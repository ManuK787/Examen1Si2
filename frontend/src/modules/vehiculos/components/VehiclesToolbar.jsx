import React, { useMemo } from 'react'
import { useVehiclesStore } from '../store/vehiclesStore'

export function VehiclesToolbar({ onNew }) {
  const { filters, setFilters, resetFilters, distinctColors, loading } = useVehiclesStore()
  const colors = useMemo(()=> distinctColors(), [filters])
  const hasActive = filters.search || (filters.color && filters.color!=='ALL')

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mt-4">
      <div className="flex flex-col md:flex-row gap-3 flex-1">
        <div className="flex-1">
          <input
            placeholder="Buscar por placa, marca, modelo o residente..."
            value={filters.search}
            onChange={e=> setFilters({ search: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div>
          <select
            value={filters.color}
            onChange={e=> setFilters({ color: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="ALL">Color (Todos)</option>
            {colors.map(c=> <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
          </select>
        </div>
        {hasActive && (
          <button
            onClick={resetFilters}
            className="px-3 py-2 text-xs font-medium rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
          >Limpiar</button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onNew}
          disabled={loading}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
        >Nuevo Vehículo</button>
      </div>
    </div>
  )
}
