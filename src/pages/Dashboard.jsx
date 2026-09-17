import { Link } from 'react-router-dom'
import { loadPortfolio, loadInterviews, getDashboardStats } from '../storage.js'

export default function Dashboard() {
  const portfolio = loadPortfolio()
  const interviews = loadInterviews()
  const stats = getDashboardStats()

  return (
    <div className="max-w-4xl mx-auto px-6 py-14 fade-in">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Interviews Taken" value={stats.count} />
        <StatCard label="Average Score" value={`${stats.average}/100`} />
        <StatCard label="Best Score" value={`${stats.best}/100`} />
        <StatCard label="Portfolio" value={portfolio ? 'Ready' : 'Not built'} />
      </div>

      <div className="card p-6 sm:p-8 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Your Portfolio</h2>
          <Link to={portfolio ? '/portfolio/preview' : '/portfolio/build'} className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
            {portfolio ? 'View →' : 'Build one →'}
          </Link>
        </div>
        {portfolio ? (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-bold">
              {portfolio.formData.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-medium">{portfolio.formData.name}</p>
              <p className="text-sm text-slate-500">{portfolio.formData.targetRole}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">You haven't built a portfolio yet.</p>
        )}
      </div>

      <div className="card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Interview History</h2>
          <Link to="/interview" className="btn-primary !py-2 !px-4 text-sm">
            New Interview
          </Link>
        </div>
        {interviews.length === 0 ? (
          <p className="text-sm text-slate-500">No interviews yet — take your first mock interview to see results here.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {interviews.map((i) => (
              <Link
                key={i.id}
                to={`/report/${i.id}`}
                className="flex items-center justify-between py-4 hover:bg-slate-50 dark:hover:bg-slate-900 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <p className="font-medium">{new Date(i.date).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-500">{new Date(i.date).toLocaleTimeString()}</p>
                </div>
                <span className="font-semibold text-brand-600 dark:text-brand-400">{i.overallScore}/100</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
