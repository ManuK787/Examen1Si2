import React from 'react'
import { usePropertiesStore } from '../store/propertiesStore'
import { Pencil, Trash2 } from 'lucide-react'

export function PropertiesTable({ onEdit }){
  const { properties, loading, error, deleteProperty } = usePropertiesStore()

  if (loading) return <div className="text-sm text-slate-500 p-4">Cargando propiedades...</div>
  if (error) return <div className="text-sm text-rose-600 p-4">{error}</div>
  if (!properties.length) return <div className="text-sm text-slate-500 p-4">Sin propiedades</div>

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-600">
            <th className="text-left px-3 py-2 font-semibold">Bloque</th>
            <th className="text-left px-3 py-2 font-semibold">Nro</th>
            <th className="text-left px-3 py-2 font-semibold">Propietario</th>
            <th className="text-right px-3 py-2 font-semibold">Terreno (m²)</th>
            <th className="text-right px-3 py-2 font-semibold">Capacidad</th>
            <th className="text-left px-3 py-2 font-semibold">Estado</th>
            <th className="text-right px-3 py-2 font-semibold">Acciones</th>
            {/* Columna 'Actualizado' removida a solicitud */}
          </tr>
        </thead>
        <tbody>
          {properties.map(p => (
            <tr key={p.id} className="border-b last:border-b-0 border-slate-100 hover:bg-slate-50">
              <td className="px-3 py-2">{p.block}</td>
              <td className="px-3 py-2">{p.number}</td>
              <td className="px-3 py-2 truncate max-w-[140px]" title={p.ownerName}>{p.ownerName}</td>
              <td className="px-3 py-2 text-right tabular-nums">{p.landSizeM2}</td>
              <td className="px-3 py-2 text-right tabular-nums">{p.capacity}</td>
              <td className="px-3 py-2">
                <span className={`px-2 py-1 rounded-full text-[10px] font-semibold tracking-wide ${p.occupancyStatus==='ocupado' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}> {p.occupancyStatus==='ocupado' ? 'Ocupado' : 'Libre'} </span>
              </td>
              <td className="px-3 py-2 text-right flex items-center justify-end gap-2">
                {onEdit && (
                  <button
                    onClick={()=> onEdit(p)}
                    className="p-1 rounded-md hover:bg-slate-200 hover:text-slate-700 text-slate-600"
                    title="Editar"
                    aria-label="Editar propiedad"
                  >
                    <Pencil size={16} />
                  </button>
                )}
                <button
                  onClick={()=> { if (confirm('¿Eliminar propiedad?')) deleteProperty(p.id) }}
                  className="p-1 rounded-md hover:bg-rose-100 hover:text-rose-600 text-rose-600"
                  title="Eliminar"
                  aria-label="Eliminar propiedad"
                >
                  <Trash2 size={16} />
                </button>
              </td>
              {/* Celda de 'Actualizado' removida */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
