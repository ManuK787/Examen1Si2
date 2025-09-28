import SectionCard from './SectionCard'

export function MaintenanceList({ items = [], loading }) {
  return (
    <SectionCard
      title="Mantenimiento"
      subtitle={loading ? 'Cargando...' : `${items.length} pendientes`}
      action={<button className="text-xs text-indigo-600 hover:underline">Ver todos</button>}
      className="h-full"
    >
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}
      {!loading && items.length === 0 && (
        <p className="text-xs text-slate-500">Sin órdenes pendientes.</p>
      )}
      {!loading && items.length > 0 && (
        <ul className="space-y-2 max-h-[230px] overflow-auto pr-1">
          {items.map(it => (
            <li key={it.id} className="flex items-start gap-2 rounded border border-slate-100 px-2 py-2 hover:bg-slate-50 transition-colors">
              <span className={`mt-0.5 h-2.5 w-2.5 rounded-full ${it.priority === 'alta' ? 'bg-rose-500' : it.priority === 'media' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <div className="flex flex-col text-xs leading-tight">
                <span className="font-medium text-slate-700">{it.title}</span>
                <span className="text-slate-500">Prioridad: {it.priority}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
