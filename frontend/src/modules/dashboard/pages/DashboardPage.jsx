import KpiCard from "../components/KpiCard";
import { IncidentsList } from "../components/IncidentsList";
import { MaintenanceList } from "../components/MaintenanceList";
import { ReservationsList } from "../components/ReservationsList";
import { IncomeExpenseChartPlaceholder } from "../components/IncomeExpenseChartPlaceholder";
import { OccupancyChartPlaceholder } from "../components/OccupancyChartPlaceholder";
import { useDashboardData } from "../hooks/useDashboardData";

export default function DashboardPage() {
  const {
    summary,
    incidents,
    maintenance,
    reservations,
    incomeExpense,
    occupancy,
    occupancyAverage,
    loading,
    error,
    reload,
  } = useDashboardData();
  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 flex items-center justify-between">
          <span>Error: {error}</span>
          <button onClick={reload} className="text-rose-700 underline">
            Reintentar
          </button>
        </div>
      )}
      {/* KPIs fila 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          variant="glass"
          label="Residentes"
          value={summary.residents}
          icon={"👥"}
          color="indigo"
          loading={loading}
        />
        <KpiCard
          variant="glass"
          label="Morosidad"
          value={`${summary.delinquencyPercent}%`}
          sub={`Bs. ${summary.delinquencyAmount}`}
          icon={"⚠️"}
          color="rose"
          loading={loading}
        />
        <KpiCard
          variant="glass"
          label="Ingresos Mes"
          value={`Bs. ${summary.incomeMonth}`}
          icon={"💰"}
          color="emerald"
          loading={loading}
        />
        <KpiCard
          variant="glass"
          label="Reservas Hoy"
          value={summary.reservationsToday}
          icon={"📅"}
          color="amber"
          loading={loading}
        />
      </div>

      {/* Fila 2: gráfico grande + incidentes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 min-h-[380px] flex flex-col">
          <IncomeExpenseChartPlaceholder />
        </div>
        <div className="lg:col-span-4 min-h-[380px] flex flex-col">
          <IncidentsList items={incidents} loading={loading} />
        </div>
      </div>

      {/* Fila 3: mantenimiento + ocupación + reservas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 min-h-[320px] flex flex-col">
          <MaintenanceList items={maintenance} loading={loading} />
        </div>
        <div className="lg:col-span-4 min-h-[320px] flex flex-col">
          <OccupancyChartPlaceholder value={occupancyAverage} loading={loading} />
        </div>
        <div className="lg:col-span-4 min-h-[320px] flex flex-col">
          <ReservationsList items={reservations} loading={loading} />
        </div>
      </div>
    </div>
  );
}
