// Color style map to avoid dynamic Tailwind class purge issues
const COLOR_STYLES = {
  indigo: 'bg-indigo-100 text-indigo-600',
  blue: 'bg-blue-100 text-blue-600',
  sky: 'bg-sky-100 text-sky-600',
  cyan: 'bg-cyan-100 text-cyan-600',
  teal: 'bg-teal-100 text-teal-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  green: 'bg-green-100 text-green-600',
  lime: 'bg-lime-100 text-lime-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  amber: 'bg-amber-100 text-amber-600',
  orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600',
  rose: 'bg-rose-100 text-rose-600',
  pink: 'bg-pink-100 text-pink-600',
  fuchsia: 'bg-fuchsia-100 text-fuchsia-600',
  purple: 'bg-purple-100 text-purple-600',
  violet: 'bg-violet-100 text-violet-600',
  slate: 'bg-slate-100 text-slate-600'
}

export default function KpiCard({ icon, label, value, sub, color = 'indigo', loading, variant = 'default' }) {
  const colorClass = COLOR_STYLES[color] || COLOR_STYLES.indigo;
  const baseCard = 'relative rounded-lg flex flex-col gap-2 overflow-hidden transition shadow-sm';
  const variants = {
    default: 'border border-slate-200 bg-white p-4 hover:shadow-md',
    glass: 'border border-white/30 bg-white/50 backdrop-blur-sm p-4 shadow-sm hover:shadow-md hover:bg-white/60 transition-colors'
  };
  const circleBase = 'h-10 w-10 flex items-center justify-center rounded-full text-lg font-semibold transition-transform';
  const circleVariants = {
    default: `${colorClass}`,
    glass: 'bg-white/40 text-slate-700 border border-white/50 backdrop-blur-sm'
  };
  return (
    <div className={`${baseCard} ${variants[variant] || variants.default} group`}> 
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`${circleBase} ${circleVariants[variant] || circleVariants.default} group-hover:scale-105`}>{icon}</div>
          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
            {loading ? (
              <div className="h-6 w-24 rounded bg-slate-200 animate-pulse" />
            ) : (
              <span className="text-2xl font-semibold text-slate-800 leading-none mt-1">{value}</span>
            )}
          </div>
        </div>
        {sub && !loading && (
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full" title={sub}>{sub}</span>
        )}
      </div>
    </div>
  )
}
