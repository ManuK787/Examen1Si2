import { useCommonAreasStore } from '../store/commonAreasStore'
import { useEffect, useState } from 'react'

const TYPES = [
  { value: '', label: 'Todos los tipos' },
  { value: 'salon', label: 'Salón' },
  { value: 'piscina', label: 'Piscina' },
  { value: 'gimnasio', label: 'Gimnasio' },
  { value: 'cancha', label: 'Cancha' },
  { value: 'parque', label: 'Parque' }
]

export function CommonAreasToolbar(){
  const { openNewModal, setSearch, setTypeFilter, setStatusFilter, fetch, search, typeFilter, statusFilter } = useCommonAreasStore()
  const [localSearch, setLocalSearch] = useState(search)

  useEffect(() => { setLocalSearch(search) }, [search])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSearch(localSearch)
    fetch()
  }

  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 bg-white p-3 border rounded text-xs">
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-2 md:items-end flex-1">
        <div className="flex-1">
          <label className="block text-[11px] font-medium text-slate-600 mb-1">Buscar</label>
            <input value={localSearch} onChange={e => setLocalSearch(e.target.value)} placeholder="Nombre" className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-600 mb-1">Tipo</label>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); fetch() }} className="border rounded px-2 py-1 min-w-[140px]">
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-600 mb-1">Estado</label>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); fetch() }} className="border rounded px-2 py-1 min-w-[140px]">
            <option value="">Todos</option>
            <option value="disponible">Disponible</option>
            <option value="reservado">Reservado</option>
            <option value="mantenimiento">Mantenimiento</option>
          </select>
        </div>
        <div className="flex gap-2 md:mt-5">
          <button type="submit" className="px-3 py-1.5 bg-slate-600 text-white rounded hover:bg-slate-700">Filtrar</button>
          <button type="button" onClick={() => { setLocalSearch(''); setSearch(''); setTypeFilter(''); setStatusFilter(''); fetch() }} className="px-3 py-1.5 border rounded hover:bg-slate-50">Limpiar</button>
        </div>
      </form>
      <div className="flex justify-end md:ml-4">
        <button onClick={openNewModal} className="px-4 py-2 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700">Nuevo</button>
      </div>
    </div>
  )
}
