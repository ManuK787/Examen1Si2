import { useFinancialConceptsStore } from '../store/financialConceptsStore'
import { Plus, RotateCcw } from 'lucide-react'

export default function ConceptsToolbar(){
  const setFilter = useFinancialConceptsStore(s=>s.setFilter)
  const resetFilters = useFinancialConceptsStore(s=>s.resetFilters)
  const filters = useFinancialConceptsStore(s=>s.filters)
  const openCreate = useFinancialConceptsStore(s=>s.openDialog)
  const loading = useFinancialConceptsStore(s=>s.loading)
  const forceReload = useFinancialConceptsStore(s=>s.forceReload)

  return (
    <div className="flex flex-wrap gap-3 items-end mb-4">
      <div className="flex flex-col">
        <label className="text-xs font-medium">Buscar</label>
        <input value={filters.search} onChange={e=>setFilter('search', e.target.value)} className="border rounded px-2 py-1 text-sm" placeholder="Nombre / Código" />
      </div>
      <div className="flex flex-col">
        <label className="text-xs font-medium">Estado</label>
        <select value={filters.status} onChange={e=>setFilter('status', e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="">Todos</option>
          <option value="active">Activo</option>
          <option value="draft">Borrador</option>
          <option value="scheduled">Programado</option>
          <option value="disabled">Desactivado</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-xs font-medium">Periodicidad</label>
        <select value={filters.periodicity} onChange={e=>setFilter('periodicity', e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="">Todas</option>
          <option value="monthly">Mensual</option>
          <option value="quarterly">Trimestral</option>
          <option value="yearly">Anual</option>
          <option value="one_time">Única</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-xs font-medium">Tipo</label>
        <select value={filters.conceptType} onChange={e=>setFilter('conceptType', e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="">Todos</option>
            <option value="fee">Expensa</option>
            <option value="fine">Multa</option>
            <option value="misc">Otro</option>
        </select>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <button onClick={forceReload} disabled={loading} className="px-3 py-1 text-sm border rounded">Recargar</button>
        <button onClick={resetFilters} className="px-2 py-1 text-sm border rounded" title="Reset filtros"><RotateCcw className="w-4 h-4" /></button>
        <button onClick={()=>openCreate('create',null)} className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-600 text-white rounded"><Plus className="w-4 h-4" /> Nuevo Concepto</button>
      </div>
    </div>
  )
}
