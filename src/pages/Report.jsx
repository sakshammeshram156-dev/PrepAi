import { useParams, Link } from 'react-router-dom'
import { loadInterviews } from '../storage.js'

export default function Report() {
  const { id } = useParams()
  const interviews = loadInterviews()
  const report = interviews.find((i) => String(i.id) === String(id))

  if (!report) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-slate-500 mb-6">Report not found.</p>
        <Link to="/dashboard" className="btn-primary">
          Go to Dashboard
        </Link>
      </div>
    )
  }

  const breakdown = report.breakdown || {}

  return (
    <div className="max-w-3xl mx-auto px-6 py-14 fade-in">
      <h1 className="text-3xl font-bold mb-2">Performance Report</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        {new Date(report.date).toLocaleString()}
      </p>

      <div className="card p-8 mb-6 text-center bg-brand-gradient text-white">
        <p className="text-sm uppercase tracking-wide opacity-80 mb-1">Overall Score</p>
        <p className="text-6xl font-bold">{report.overallScore}<span className="text-2xl opacity-70">/100</span></p>
      </div>

      <div className="card p-6 sm:p-8 mb-6 space-y-4">
        <h2 className="font-semibold text-lg mb-2">Breakdown</h2>
        {Object.entries(breakdown).map(([label, pct]) => (
          <div key={label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="capitalize text-slate-600 dark:text-slate-300">
                {label.replace(/([A-Z])/g, ' $1')}
              </span>
              <span className="font-medium">{pct}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-6">
        <div className="card p-6">
          <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-3">💪 Strengths</h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {(report.strengths || []).map((s, i) => (
              <li key={i} className="flex gap-2">
                <span>✓</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold text-amber-600 dark:text-amber-400 mb-3">🎯 Improvement Areas</h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {(report.weaknesses || []).map((s, i) => (
              <li key={i} className="flex gap-2">
                <span>•</span> {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card p-6 sm:p-8 mb-6">
        <h3 className="font-semibold mb-3">📚 Personalized Preparation Tips</h3>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          {(report.tips || []).map((t, i) => (
            <li key={i} className="flex gap-2">
              <span>→</span> {t}
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-6 sm:p-8 mb-8">
        <h3 className="font-semibold mb-4">Question-by-Question Scores</h3>
        <div className="space-y-3">
          {(report.transcript || []).map((t, i) => (
            <div key={i} className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0">
              <p className="text-sm text-slate-600 dark:text-slate-300">{t.question}</p>
              <span className="flex-shrink-0 text-sm font-semibold text-brand-600 dark:text-brand-400">
                {t.score}/10
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <Link to="/interview" className="btn-primary">
          Practice Again
        </Link>
        <Link to="/dashboard" className="btn-secondary">
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
