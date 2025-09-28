import { useAnnouncementsStore } from '../store/announcementsStore'
import { Plus, RotateCcw } from 'lucide-react'

export default function AnnouncementsToolbar(){
  const openCreate = useAnnouncementsStore(s=>s.openCreate)
  const resetFilters = useAnnouncementsStore(s=>s.resetFilters)
  const setFilter = useAnnouncementsStore(s=>s.setFilter)
  const filters = useAnnouncementsStore(s=>s.filters)
  const loading = useAnnouncementsStore(s=>s.loading)
  const forceReload = useAnnouncementsStore(s=>s.forceReload)

  return (
    <div className="flex flex-wrap gap-3 items-end mb-4">
      <div className="flex flex-col">
        <label className="text-xs font-medium">Buscar</label>
        <input value={filters.search} onChange={e=>setFilter('search', e.target.value)} className="border rounded px-2 py-1 text-sm" placeholder="Título o contenido" />
      </div>
      <div className="flex flex-col">
        <label className="text-xs font-medium">Estado</label>
        <select value={filters.status} onChange={e=>setFilter('status', e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="">Todos</option>
          <option value="draft">Borrador</option>
          <option value="scheduled">Programado</option>
          <option value="published">Publicado</option>
          <option value="archived">Archivado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-xs font-medium">Prioridad</label>
        <select value={filters.priority} onChange={e=>setFilter('priority', e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="">Todas</option>
          <option value="normal">Normal</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-xs font-medium">Tag</label>
        <input value={filters.tag} onChange={e=>setFilter('tag', e.target.value)} className="border rounded px-2 py-1 text-sm" />
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <button onClick={forceReload} disabled={loading} className="px-3 py-1 text-sm border rounded">Recargar</button>
        <button onClick={resetFilters} className="px-2 py-1 text-sm border rounded" title="Reset filtros"><RotateCcw className="w-4 h-4" /></button>
        <button onClick={openCreate} className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded"><Plus className="w-4 h-4" /> Nuevo</button>
      </div>
    </div>
  )
}
