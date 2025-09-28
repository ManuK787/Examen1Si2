import { useState } from 'react'
import { useReservationsStore } from '../store/reservationsStore'
import { Plus, Filter, RotateCcw } from 'lucide-react'

export default function ReservationsToolbar(){
  const { setFilter, applyFilters, resetFilters, openCreate, filters, loading } = useReservationsStore()
  const [local, setLocal] = useState({ ...filters })

  function handleChange(e){
    const { name, value } = e.target
    setLocal(prev => ({ ...prev, [name]: value }))
  }
  function commitFilters(){
    Object.entries(local).forEach(([k,v]) => setFilter(k,v))
    applyFilters()
  }

  return (
    <div className="flex flex-col gap-4 bg-white rounded border p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold text-slate-700">Filtros</h2>
        <div className="ml-auto flex gap-2">
          <button onClick={commitFilters} disabled={loading} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50">
            <Filter size={14}/> Aplicar
          </button>
          <button onClick={resetFilters} disabled={loading} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            <RotateCcw size={14}/> Reset
          </button>
          <button onClick={openCreate} disabled={loading} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50">
            <Plus size={14}/> Nueva
          </button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-600 uppercase tracking-wide">Estado</label>
          <select name="status" value={local.status} onChange={handleChange} className="border rounded px-2 py-1 text-sm">
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
            <option value="cancelada">Cancelada</option>
            <option value="expirada">Expirada</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-600 uppercase tracking-wide">Desde</label>
          <input type="date" name="dateFrom" value={local.dateFrom} onChange={handleChange} className="border rounded px-2 py-1 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-600 uppercase tracking-wide">Hasta</label>
          <input type="date" name="dateTo" value={local.dateTo} onChange={handleChange} className="border rounded px-2 py-1 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-600 uppercase tracking-wide">Buscar</label>
            <input name="search" value={local.search} onChange={handleChange} placeholder="Notas / solicitante" className="border rounded px-2 py-1 text-sm" />
        </div>
      </div>
    </div>
  )
}
