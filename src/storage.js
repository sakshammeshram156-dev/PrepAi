// Tiny localStorage wrapper — keeps all key names in one place.

const KEYS = {
  PORTFOLIO: 'prepai_portfolio',
  INTERVIEWS: 'prepai_interviews'
}

export function savePortfolio(portfolio) {
  localStorage.setItem(KEYS.PORTFOLIO, JSON.stringify(portfolio))
}

export function loadPortfolio() {
  const raw = localStorage.getItem(KEYS.PORTFOLIO)
  return raw ? JSON.parse(raw) : null
}

export function clearPortfolio() {
  localStorage.removeItem(KEYS.PORTFOLIO)
}

export function saveInterviewResult(result) {
  const all = loadInterviews()
  all.unshift({ ...result, id: Date.now(), date: new Date().toISOString() })
  localStorage.setItem(KEYS.INTERVIEWS, JSON.stringify(all))
}

export function loadInterviews() {
  const raw = localStorage.getItem(KEYS.INTERVIEWS)
  return raw ? JSON.parse(raw) : []
}

export function getDashboardStats() {
  const interviews = loadInterviews()
  if (interviews.length === 0) {
    return { count: 0, average: 0, best: 0 }
  }
  const scores = interviews.map((i) => i.overallScore || 0)
  const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  const best = Math.max(...scores)
  return { count: interviews.length, average, best }
}
