import { useMaintenanceTasksStore } from '../store/maintenanceTasksStore'
import { Plus, RotateCcw } from 'lucide-react'

export default function MaintenanceTasksToolbar(){
  const openCreateDialog = useMaintenanceTasksStore(s=>s.openCreateDialog)
  const resetFilters = useMaintenanceTasksStore(s=>s.resetFilters)
  const setFilter = useMaintenanceTasksStore(s=>s.setFilter)
  const filters = useMaintenanceTasksStore(s=>s.filters)
  const loading = useMaintenanceTasksStore(s=>s.loading)
  const forceReload = useMaintenanceTasksStore(s=>s.forceReload)

  // El fetch ahora se centraliza en la página con un efecto único para evitar bucles.

  return (
    <div className="flex flex-wrap items-end gap-3 mb-4">
      <div className="flex flex-col">
        <label className="text-xs font-medium">Buscar</label>
        <input value={filters.search} onChange={e=>setFilter('search', e.target.value)} placeholder="Título o descripción" className="border rounded px-2 py-1 text-sm" />
      </div>
      <div className="flex flex-col">
        <label className="text-xs font-medium">Estado</label>
        <select value={filters.status} onChange={e=>setFilter('status', e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="en progreso">En Progreso</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-xs font-medium">Prioridad</label>
        <select value={filters.priority} onChange={e=>setFilter('priority', e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="">Todas</option>
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-xs font-medium">Asignado ID</label>
        <input value={filters.assigneeId} onChange={e=>setFilter('assigneeId', e.target.value)} className="border rounded px-2 py-1 text-sm" />
      </div>
      <div className="flex items-center gap-2 ml-auto">
  <button onClick={forceReload} disabled={loading} className="px-3 py-1 text-sm border rounded">Recargar</button>
        <button onClick={resetFilters} className="px-2 py-1 text-sm border rounded" title="Reset filtros"><RotateCcw className="w-4 h-4" /></button>
        <button onClick={openCreateDialog} className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded"><Plus className="w-4 h-4" /> Nueva</button>
      </div>
    </div>
  )
}
