import React, { useState, useEffect } from 'react'
import { Search, Plus, FilterX, X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { useUsersStore } from '../store/usersStore'

export function UsersToolbar({ onNew }) {
  const { filters, setFilters, resetFilters, total } = useUsersStore()
  const [localSearch, setLocalSearch] = useState(filters.search)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Debounce búsqueda
  useEffect(() => {
    const h = setTimeout(() => {
      if (localSearch !== filters.search) setFilters({ search: localSearch })
    }, 350)
    return () => clearTimeout(h)
  }, [localSearch])

  // Se elimina fetch inicial aquí; lo maneja UsersPage para evitar condiciones de carrera

  const hasActiveFilters = ['role','status','bloque','search'].some(k => filters[k] && filters[k] !== '' && filters[k] !== 'ALL')

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-4">
        {/* Desktop: una sola fila; Mobile: buscador + acciones y filtros colapsables */}
        <div className="flex flex-wrap items-stretch gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={localSearch} onChange={e=>setLocalSearch(e.target.value)} placeholder="Buscar (nombre, email)" className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-slate-800 placeholder-slate-400" />
            {localSearch && <button onClick={()=>setLocalSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={14}/></button>}
          </div>
          {/* Filtros inline en desktop (md+) */}
          <div className="hidden md:flex items-stretch gap-2 flex-none">
            <select value={filters.role} onChange={e=>setFilters({ role: e.target.value })} className="text-xs bg-white border border-slate-300 rounded-md px-2 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500">
              <option value="ALL">Rol</option>
              <option value="Administrador">Administrador</option>
              <option value="Residente">Residente</option>
              <option value="Personal">Personal</option>
            </select>
            <select value={filters.status} onChange={e=>setFilters({ status: e.target.value })} className="text-xs bg-white border border-slate-300 rounded-md px-2 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500">
              <option value="ALL">Estado</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
            <select value={filters.bloque} onChange={e=>setFilters({ bloque: e.target.value })} className="text-xs bg-white border border-slate-300 rounded-md px-2 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500">
              <option value="ALL">Bloque</option>
              {['B1','B2','B3','B4','B5'].map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            {/* Filtro de casa removido según requerimiento */}
            {hasActiveFilters && (
              <button onClick={resetFilters} className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300">
                <FilterX size={14}/> Limpiar
              </button>
            )}
          </div>
          {/* Botón toggle filtros (solo móvil) */}
          <button type="button" onClick={()=>setMobileFiltersOpen(o=>!o)} className="md:hidden inline-flex items-center gap-1 px-3 py-2 rounded-md border border-slate-300 bg-slate-50 text-slate-600 text-xs font-medium">
            <SlidersHorizontal size={14}/> Filtros
            <ChevronDown size={14} className={`transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={onNew} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-md shadow whitespace-nowrap">
            <Plus size={16}/> Registrar
          </button>
        </div>
        {/* Panel colapsable móvil */}
        <div className={`${mobileFiltersOpen ? 'grid' : 'hidden'} grid-cols-2 gap-2 md:hidden`}>
          <select value={filters.role} onChange={e=>setFilters({ role: e.target.value })} className="text-xs bg-white border border-slate-300 rounded-md px-2 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500">
            <option value="ALL">Rol</option>
            <option value="Administrador">Administrador</option>
            <option value="Residente">Residente</option>
            <option value="Personal">Personal</option>
          </select>
          <select value={filters.status} onChange={e=>setFilters({ status: e.target.value })} className="text-xs bg-white border border-slate-300 rounded-md px-2 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500">
            <option value="ALL">Estado</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
          <select value={filters.bloque} onChange={e=>setFilters({ bloque: e.target.value })} className="text-xs bg-white border border-slate-300 rounded-md px-2 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500">
            <option value="ALL">Bloque</option>
            {['B1','B2','B3','B4','B5'].map(b => <option key={b} value={b}>{b}</option>)}
          </select>
            {/* Filtro de casa removido en móvil */}
          {hasActiveFilters && (
            <button onClick={resetFilters} className="col-span-2 inline-flex items-center justify-center gap-1 text-xs px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300">
              <FilterX size={14}/> Limpiar filtros
            </button>
          )}
        </div>
      </div>
      <div className="text-[11px] uppercase tracking-wide font-semibold text-slate-500 px-1">{total} usuarios</div>
    </div>
  )
}
