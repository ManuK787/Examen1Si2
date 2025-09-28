import React from 'react'
import { Users } from 'lucide-react'

export function EmptyState({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4 text-slate-500">
      <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
        <Users size={28} className="text-slate-400" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-600">No hay usuarios</p>
        <p className="text-xs text-slate-500">Intenta ajustar la búsqueda o limpiar los filtros activos.</p>
      </div>
      {onReset && <button onClick={onReset} className="text-xs px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 transition">Limpiar filtros</button>}
    </div>
  )
}
