export default function ScoreBadge({ score }) {
  const color =
    score >= 8 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
    score >= 5 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${color} fade-in`}>
      ⭐ {score}/10
    </span>
  )
}
