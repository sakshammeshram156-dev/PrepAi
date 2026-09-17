import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generatePortfolio } from '../gemini.js'
import { savePortfolio, loadPortfolio } from '../storage.js'

const FIELDS = [
  { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Saksham Sharma' },
  { key: 'about', label: 'About You', type: 'textarea', placeholder: 'A short intro about yourself...' },
  { key: 'education', label: 'Education', type: 'textarea', placeholder: 'Degree, college, year, CGPA...' },
  { key: 'skills', label: 'Skills', type: 'textarea', placeholder: 'Java, Spring Boot, React, SQL...' },
  { key: 'experience', label: 'Experience', type: 'textarea', placeholder: 'Internships, jobs, roles...' },
  { key: 'projects', label: 'Projects', type: 'textarea', placeholder: 'Project name — what it does — tech used' },
  { key: 'certifications', label: 'Certifications', type: 'textarea', placeholder: 'Any certifications you hold' },
  { key: 'achievements', label: 'Achievements', type: 'textarea', placeholder: 'Awards, hackathons, recognitions' },
  { key: 'targetRole', label: 'Target Job Role', type: 'text', placeholder: 'Backend Developer (Java/Spring Boot)' }
]

const EMPTY = FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {})

export default function PortfolioBuilder() {
  const existing = loadPortfolio()
  const [form, setForm] = useState(existing?.formData || EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.targetRole.trim()) {
      setError('Please fill in at least your name and target job role.')
      return
    }
    setLoading(true)
    try {
      const { portfolio } = await generatePortfolio(form)
      savePortfolio({ formData: form, generated: portfolio })
      navigate('/portfolio/preview')
    } catch (err) {
      setError(err.message || 'Something went wrong generating your portfolio.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-14 fade-in">
      <h1 className="text-3xl font-bold mb-2">Build Your Portfolio</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        Fill in your details and Gemini will turn it into a polished, professional portfolio.
      </p>

      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="label-text">{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea
                className="input-field min-h-[90px] resize-y"
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
              />
            ) : (
              <input
                className="input-field"
                type="text"
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
              />
            )}
          </div>
        ))}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Generating your portfolio...' : 'Generate Portfolio →'}
        </button>
      </form>
    </div>
  )
}
