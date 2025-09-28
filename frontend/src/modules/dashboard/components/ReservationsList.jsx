import SectionCard from "./SectionCard";

export function ReservationsList({ items = [], loading }) {
  return (
    <SectionCard
      title="Reservas Hoy"
      subtitle={loading ? "Cargando..." : `${items.length} activas`}
      className="h-full"
    >
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 rounded bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}
      {!loading && items.length === 0 && (
        <p className="text-xs text-slate-500">No hay reservas activas.</p>
      )}
      {!loading && items.length > 0 && (
        <ul className="space-y-2 max-h-[200px] overflow-auto pr-1">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-start justify-between gap-2 rounded border border-slate-100 px-2 py-1.5 hover:bg-slate-50 transition-colors text-xs"
            >
              <div className="flex flex-col">
                <span className="font-medium text-slate-700">{it.area}</span>
                <span className="text-slate-500">
                  {it.start} - {it.end}
                </span>
              </div>
              <span className="text-slate-500">{it.user}</span>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
