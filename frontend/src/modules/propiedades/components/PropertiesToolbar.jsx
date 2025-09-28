import React from 'react'
import { usePropertiesStore } from '../store/propertiesStore'

export function PropertiesToolbar({ onNew }){
  const { setFilters, filters, distinctBlocks } = usePropertiesStore()
  const blocks = distinctBlocks()

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between mb-4">
      <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600">Bloque</label>
          <select value={filters.block} onChange={e=> setFilters({ block: e.target.value })} className="border border-slate-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400">
            <option value="ALL">Todos</option>
            {blocks.map(b=> <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <input
            placeholder="Buscar bloque, número o propietario..."
            value={filters.search}
            onChange={e=> setFilters({ search: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      </div>
      <div className="flex items-center">
        {onNew && (
          <button type="button" onClick={onNew} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 text-white hover:bg-slate-700 shadow">
            <span>Nuevo</span>
          </button>
        )}
      </div>
    </div>
  )
}
