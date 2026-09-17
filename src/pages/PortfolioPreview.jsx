import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadPortfolio, savePortfolio } from '../storage.js'
import { generatePortfolio } from '../gemini.js'

export default function PortfolioPreview() {
  const [portfolio, setPortfolio] = useState(loadPortfolio())
  const [regenerating, setRegenerating] = useState(false)
  const navigate = useNavigate()

  if (!portfolio) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-slate-500 mb-6">No portfolio found yet.</p>
        <button className="btn-primary" onClick={() => navigate('/portfolio/build')}>
          Build a Portfolio
        </button>
      </div>
    )
  }

  const regenerate = async () => {
    setRegenerating(true)
    try {
      const { portfolio: generated } = await generatePortfolio(portfolio.formData)
      const updated = { ...portfolio, generated }
      savePortfolio(updated)
      setPortfolio(updated)
    } catch (err) {
      alert(err.message || 'Failed to regenerate portfolio.')
    } finally {
      setRegenerating(false)
    }
  }

  const g = portfolio.generated || {}

  return (
    <div className="max-w-3xl mx-auto px-6 py-14 fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Your Portfolio</h1>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => navigate('/portfolio/build')}>
            ✏️ Edit
          </button>
          <button className="btn-secondary" onClick={regenerate} disabled={regenerating}>
            {regenerating ? 'Regenerating...' : '🔁 Regenerate'}
          </button>
        </div>
      </div>

      <div className="card p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center text-white text-2xl font-bold">
            {portfolio.formData.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{portfolio.formData.name}</h2>
            <p className="text-brand-600 dark:text-brand-400 font-medium">{portfolio.formData.targetRole}</p>
          </div>
        </div>

        {g.summary && (
          <Section title="Summary">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{g.summary}</p>
          </Section>
        )}

        {g.skills?.length > 0 && (
          <Section title="Skills">
            <div className="flex flex-wrap gap-2">
              {g.skills.map((s) => (
                <span key={s} className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm">
                  {s}
                </span>
              ))}
            </div>
          </Section>
        )}

        {g.experience && (
          <Section title="Experience">
            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">{g.experience}</p>
          </Section>
        )}

        {g.projects?.length > 0 && (
          <Section title="Projects">
            <div className="space-y-3">
              {g.projects.map((p, i) => (
                <div key={i} className="border-l-2 border-brand-400 pl-4">
                  <h4 className="font-semibold">{p.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{p.description}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {g.education && (
          <Section title="Education">
            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{g.education}</p>
          </Section>
        )}

        {g.certifications && (
          <Section title="Certifications & Achievements">
            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{g.certifications}</p>
          </Section>
        )}
      </div>

      <div className="mt-8 text-center">
        <button className="btn-primary text-base" onClick={() => navigate('/interview')}>
          Start AI Interview →
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-2">{title}</h3>
      {children}
    </div>
  )
}
