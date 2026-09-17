import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()

  const linkClass = (path) =>
    `text-sm font-medium transition-colors ${
      pathname === path
        ? 'text-brand-600 dark:text-brand-400'
        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
    }`

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-bold text-sm">
            P
          </div>
          <span className="font-semibold text-lg tracking-tight">PrepAI</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link to="/portfolio/build" className={linkClass('/portfolio/build')}>
            Portfolio
          </Link>
          <Link to="/dashboard" className={linkClass('/dashboard')}>
            Dashboard
          </Link>
          <Link to="/portfolio/build" className="btn-primary !py-2 !px-4 text-sm">
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  )
}
