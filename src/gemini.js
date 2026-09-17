// All Gemini calls are proxied through our own Express server so the API key
// never reaches the browser. This file is just a thin fetch wrapper.

const BASE = '/api'

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Request failed (${res.status})`)
  }
  return res.json()
}

// Generate a polished portfolio summary from raw form data
export function generatePortfolio(formData) {
  return post('/portfolio', { formData })
}

// Get the next interview question given portfolio + full Q&A history so far
export function getNextQuestion({ portfolio, history, questionNumber, totalQuestions }) {
  return post('/interview/next-question', { portfolio, history, questionNumber, totalQuestions })
}

// Score a single answer (0-10) across the evaluation dimensions
export function evaluateAnswer({ question, answer, portfolio }) {
  return post('/interview/evaluate', { question, answer, portfolio })
}

// Generate the final performance report from the full interview transcript
export function generateReport({ portfolio, transcript }) {
  return post('/interview/report', { portfolio, transcript })
}
