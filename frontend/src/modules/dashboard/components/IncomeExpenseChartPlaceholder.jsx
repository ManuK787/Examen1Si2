import SectionCard from "./SectionCard";

export function IncomeExpenseChartPlaceholder() {
  return (
    <SectionCard
      title="Ingresos vs Egresos"
      subtitle="Últimos 6 meses"
      action={
        <button className="text-xs text-indigo-600 hover:underline">
          Detalle
        </button>
      }
      className="h-full"
    >
      <div className="h-64 w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <div className="h-32 w-full bg-gradient-to-b from-slate-100 to-slate-200 rounded-md overflow-hidden flex items-end gap-1 p-2">
            {/* Barras simuladas */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end gap-1">
                <div
                  className="w-full bg-indigo-300/60 rounded"
                  style={{ height: `${40 + i * 8}%` }}
                />
                <div
                  className="w-full bg-rose-300/60 rounded"
                  style={{ height: `${30 + i * 6}%` }}
                />
              </div>
            ))}
          </div>
          <span className="text-xs">Gráfico próximamente</span>
        </div>
      </div>
    </SectionCard>
  );
}
