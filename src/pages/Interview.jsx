import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadPortfolio, saveInterviewResult } from '../storage.js'
import { getNextQuestion, evaluateAnswer, generateReport } from '../gemini.js'
import MicButton from '../components/MicButton.jsx'
import ScoreBadge from '../components/ScoreBadge.jsx'

const TOTAL_QUESTIONS = 12

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null

export default function Interview() {
  const portfolio = loadPortfolio()
  const navigate = useNavigate()

  const [history, setHistory] = useState([]) // { question, answer, score }
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [questionNumber, setQuestionNumber] = useState(1)
  const [answer, setAnswer] = useState('')
  const [phase, setPhase] = useState('loading-question') // loading-question | answering | scoring | done
  const [lastScore, setLastScore] = useState(null)
  const [voiceOn, setVoiceOn] = useState(true)
  const [error, setError] = useState('')
  const startedRef = useRef(false)

  useEffect(() => {
    if (!portfolio) return
    if (startedRef.current) return
    startedRef.current = true
    fetchNextQuestion([], 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const speak = (text) => {
    if (!voiceOn || !synth) return
    synth.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 1
    utter.pitch = 1
    synth.speak(utter)
  }

  const replay = () => speak(currentQuestion)

  const fetchNextQuestion = async (hist, num) => {
    setPhase('loading-question')
    setError('')
    try {
      const { question, done } = await getNextQuestion({
        portfolio: portfolio.generated,
        history: hist,
        questionNumber: num,
        totalQuestions: TOTAL_QUESTIONS
      })
      if (done || !question) {
        finishInterview(hist)
        return
      }
      setCurrentQuestion(question)
      setQuestionNumber(num)
      setAnswer('')
      setLastScore(null)
      setPhase('answering')
      speak(question)
    } catch (err) {
      setError(err.message || 'Failed to load the next question.')
      setPhase('answering')
    }
  }

  const submitAnswer = async () => {
    if (!answer.trim()) return
    setPhase('scoring')
    setError('')
    try {
      const { score, feedback } = await evaluateAnswer({
        question: currentQuestion,
        answer,
        portfolio: portfolio.generated
      })
      const entry = { question: currentQuestion, answer, score, feedback }
      const newHistory = [...history, entry]
      setHistory(newHistory)
      setLastScore(score)

      setTimeout(() => {
        if (questionNumber >= TOTAL_QUESTIONS) {
          finishInterview(newHistory)
        } else {
          fetchNextQuestion(newHistory, questionNumber + 1)
        }
      }, 1200)
    } catch (err) {
      setError(err.message || 'Failed to evaluate your answer.')
      setPhase('answering')
    }
  }

  const finishInterview = async (hist) => {
    setPhase('done')
    try {
      const { report } = await generateReport({ portfolio: portfolio.generated, transcript: hist })
      const result = { ...report, transcript: hist }
      saveInterviewResult(result)
      const all = JSON.parse(localStorage.getItem('prepai_interviews') || '[]')
      navigate(`/report/${all[0].id}`)
    } catch (err) {
      setError(err.message || 'Failed to generate your report.')
    }
  }

  if (!portfolio) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-slate-500 mb-6">Build a portfolio first so the interview can be personalized.</p>
        <button className="btn-primary" onClick={() => navigate('/portfolio/build')}>
          Build Portfolio
        </button>
      </div>
    )
  }

  const progressPct = Math.min(100, Math.round(((questionNumber - 1) / TOTAL_QUESTIONS) * 100))

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 fade-in">
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
          <span>
            Question {Math.min(questionNumber, TOTAL_QUESTIONS)} / {TOTAL_QUESTIONS}
          </span>
          <button
            className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800"
            onClick={() => setVoiceOn((v) => !v)}
          >
            {voiceOn ? '🔊 Voice On' : '🔇 Voice Off'}
          </button>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="card p-6 sm:p-8 min-h-[320px] flex flex-col">
        {phase === 'loading-question' ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Thinking of the next question...
          </div>
        ) : phase === 'done' ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Generating your performance report...
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-brand-gradient flex-shrink-0 flex items-center justify-center text-white text-sm">
                🤖
              </div>
              <div className="flex-1">
                <p className="font-medium leading-relaxed">{currentQuestion}</p>
                <button onClick={replay} className="text-xs text-brand-600 dark:text-brand-400 mt-2 hover:underline">
                  🔁 Replay question
                </button>
              </div>
            </div>

            {lastScore !== null && phase === 'scoring' && (
              <div className="mb-4">
                <ScoreBadge score={lastScore} />
              </div>
            )}

            <div className="mt-auto space-y-3">
              <textarea
                className="input-field min-h-[110px] resize-y"
                placeholder="Type your answer, or use the mic..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={phase === 'scoring'}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex items-center justify-between">
                <MicButton onResult={setAnswer} disabled={phase === 'scoring'} />
                <button
                  className="btn-primary"
                  onClick={submitAnswer}
                  disabled={phase === 'scoring' || !answer.trim()}
                >
                  {phase === 'scoring' ? 'Evaluating...' : 'Submit Answer →'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
