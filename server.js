import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const DEFAULT_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-2.5-flash',
  'gemini-3.6-flash',
  'gemini-2.5-flash-lite'
].filter(Boolean)

// Remove duplicates while preserving model priority order
const FALLBACK_MODELS = [...new Set(DEFAULT_MODELS)]

// Calls Gemini and asks for strict JSON output matching the given shape, with retry and fallback models.
async function callGemini(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set on the server. Add it to your .env file.')
  }

  let lastError = null

  for (const model of FALLBACK_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: 'application/json'
            }
          })
        })

        // Retry on rate limit (429) or high demand / service unavailable (503)
        if (res.status === 429 || res.status === 503) {
          const errText = await res.text().catch(() => '')
          console.warn(`[Gemini] ${model} returned ${res.status}: ${errText.slice(0, 150)}. Retrying in ${attempt * 1000}ms...`)
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
          continue
        }

        if (!res.ok) {
          const text = await res.text().catch(() => '')
          throw new Error(`Gemini API error (${res.status}): ${text.slice(0, 300)}`)
        }

        const data = await res.json()
        const parts = data?.candidates?.[0]?.content?.parts || []
        const textPart = parts.find((p) => p.text && !p.thought) || parts.find((p) => p.text)
        const text = textPart?.text

        if (!text) {
          throw new Error('Gemini returned an empty response.')
        }

        try {
          return JSON.parse(text)
        } catch {
          // Model occasionally wraps JSON in fences despite instructions — strip and retry.
          const cleaned = text.replace(/^```(?:json)?\s*|```$/gm, '').trim()
          try {
            return JSON.parse(cleaned)
          } catch {
            const firstBrace = text.indexOf('{')
            const lastBrace = text.lastIndexOf('}')
            if (firstBrace !== -1 && lastBrace > firstBrace) {
              return JSON.parse(text.slice(firstBrace, lastBrace + 1))
            }
            throw new Error('Failed to parse Gemini response as JSON.')
          }
        }
      } catch (err) {
        lastError = err
        console.warn(`[Gemini] Attempt ${attempt} on model '${model}' failed: ${err.message}`)
        if (attempt < 3 && (err.message.includes('503') || err.message.includes('429') || err.message.includes('fetch failed'))) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
          continue
        }
        break
      }
    }
  }

  throw lastError || new Error('All Gemini model attempts failed.')
}

// ---------- 1. Portfolio generation ----------
app.post('/api/portfolio', async (req, res) => {
  try {
    const { formData } = req.body
    const prompt = `You are a professional resume/portfolio writer. Based on the raw candidate details below,
produce a polished, professional portfolio. Do not invent facts not implied by the input.

Candidate input:
${JSON.stringify(formData, null, 2)}

Respond with ONLY valid JSON in exactly this shape:
{
  "summary": "a 2-4 sentence professional summary",
  "skills": ["skill1", "skill2", "..."],
  "experience": "formatted, polished description of experience (or 'No formal experience yet' if none given)",
  "projects": [{ "name": "project name", "description": "1-2 sentence polished description" }],
  "education": "formatted education details",
  "certifications": "formatted certifications and achievements combined, or empty string if none"
}`

    const portfolio = await callGemini(prompt)
    res.json({ portfolio })
  } catch (err) {
    console.error('portfolio error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ---------- 2. Next interview question ----------
app.post('/api/interview/next-question', async (req, res) => {
  try {
    const { portfolio, history, questionNumber, totalQuestions } = req.body

    const historyText = (history || [])
      .map((h, i) => `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer}`)
      .join('\n\n')

    const stage =
      questionNumber === 1
        ? 'This is the FIRST question — ask an introduction question ("Tell me about yourself" style, tailored to their portfolio).'
        : questionNumber <= Math.ceil(totalQuestions * 0.4)
        ? 'Focus on project-based and technical questions relevant to their listed projects and skills.'
        : questionNumber <= Math.ceil(totalQuestions * 0.75)
        ? 'Focus on behavioral and role-specific questions. You may ask a natural follow-up to a previous answer if it was vague or interesting.'
        : 'Ask a deeper technical or role-specific question, or a thoughtful follow-up, appropriate to wrap up the interview.'

    const prompt = `You are a professional, friendly technical interviewer conducting a mock interview.

Candidate portfolio:
${JSON.stringify(portfolio, null, 2)}

Interview so far (do not repeat any of these questions or ask something too similar):
${historyText || '(no questions asked yet)'}

This is question ${questionNumber} of ${totalQuestions}. ${stage}

Rules:
- Ask exactly ONE question.
- Keep it conversational and concise (1-3 sentences max).
- Never invent details about the candidate that aren't in their portfolio.
- Base technical/project questions strictly on what's in their portfolio.

Respond with ONLY valid JSON in exactly this shape:
{ "question": "the interview question text", "done": false }`

    const result = await callGemini(prompt)
    res.json(result)
  } catch (err) {
    console.error('next-question error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ---------- 3. Evaluate a single answer ----------
app.post('/api/interview/evaluate', async (req, res) => {
  try {
    const { question, answer, portfolio } = req.body

    const prompt = `You are an expert interview coach evaluating one answer from a mock interview.

Candidate portfolio context:
${JSON.stringify(portfolio, null, 2)}

Question: ${question}
Candidate's answer: ${answer}

Evaluate the answer on: relevance, technical knowledge, clarity, communication, depth, and problem solving.
Give an overall score from 0-10 (integers only) and 1-2 sentences of specific, constructive feedback.

Respond with ONLY valid JSON in exactly this shape:
{ "score": 7, "feedback": "short constructive feedback" }`

    const result = await callGemini(prompt)
    res.json(result)
  } catch (err) {
    console.error('evaluate error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ---------- 4. Final performance report ----------
app.post('/api/interview/report', async (req, res) => {
  try {
    const { portfolio, transcript } = req.body

    const transcriptText = (transcript || [])
      .map((t, i) => `Q${i + 1}: ${t.question}\nA${i + 1}: ${t.answer}\nScore: ${t.score}/10\nFeedback: ${t.feedback || ''}`)
      .join('\n\n')

    const prompt = `You are an expert interview coach writing a final performance report for a mock interview.

Candidate portfolio:
${JSON.stringify(portfolio, null, 2)}

Full interview transcript with per-question scores:
${transcriptText}

Produce a final report. The overall score (0-100) should meaningfully reflect the average of the per-question
scores (each was out of 10) rather than being arbitrary. The breakdown percentages should be consistent with
patterns you see across the answers.

Respond with ONLY valid JSON in exactly this shape:
{
  "overallScore": 82,
  "breakdown": {
    "technicalKnowledge": 86,
    "communication": 80,
    "problemSolving": 88,
    "confidence": 76,
    "clarity": 84
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["area 1", "area 2", "area 3"],
  "tips": ["tip 1", "tip 2", "tip 3", "tip 4"]
}`

    const report = await callGemini(prompt)
    res.json({ report })
  } catch (err) {
    console.error('report error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/health', (req, res) => res.json({ ok: true }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`PrepAI server running on http://localhost:${PORT}`))
