import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: '🧠',
    title: 'AI Portfolio Builder',
    desc: 'Turn your raw experience into a polished, professional portfolio in seconds.'
  },
  {
    icon: '🎤',
    title: 'Voice or Text Interviews',
    desc: 'Speak your answers naturally or type them — your call.'
  },
  {
    icon: '📊',
    title: 'Instant Scoring',
    desc: 'Get feedback on relevance, clarity, and depth after every answer.'
  },
  {
    icon: '📈',
    title: 'Performance Reports',
    desc: 'Detailed breakdowns of strengths, weaknesses, and what to fix next.'
  }
]

export default function Landing() {
  return (
    <div>
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center fade-in">
        <div className="inline-block px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 text-sm font-medium mb-6">
          ✨ Powered by Google Gemini
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
          Ace your next interview
          <br />
          <span className="bg-brand-gradient bg-clip-text text-transparent">with an AI that knows you</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10">
          Build a personalized portfolio, take a realistic voice-driven mock interview, and get a
          detailed performance report — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/portfolio/build" className="btn-primary text-base">
            Build My Portfolio →
          </Link>
          <Link to="/dashboard" className="btn-secondary text-base">
            View Dashboard
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 hover:-translate-y-1 transition-transform duration-300">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="card p-8 sm:p-12 bg-brand-gradient text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to practice?</h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            It takes less than a minute to build your portfolio and start your first mock interview.
          </p>
          <Link
            to="/portfolio/build"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-brand-700 font-semibold hover:opacity-90 transition-opacity"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  )
}
