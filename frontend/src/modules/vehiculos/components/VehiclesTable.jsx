import React from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useVehiclesStore } from '../store/vehiclesStore'

export function VehiclesTable({ onEdit }) {
  const { vehicles, loading, error, deleteVehicle } = useVehiclesStore()

  if (error) return <div className="text-sm text-rose-500">{error}</div>
  if (!loading && vehicles.length === 0) return (
    <div className="mt-6 border border-slate-200 rounded-lg p-10 text-center text-sm text-slate-500 bg-white">
      No hay vehículos registrados.
    </div>
  )

  return (
    <div className="mt-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm min-w-[860px]">
          <thead className="bg-gradient-to-r from-slate-100 to-slate-50">
            <tr className="border-b border-slate-200">
              <th className="text-left text-[11px] uppercase tracking-wide text-slate-500 font-semibold px-4 py-2">Placa</th>
              <th className="text-left text-[11px] uppercase tracking-wide text-slate-500 font-semibold px-4 py-2">Marca</th>
              <th className="text-left text-[11px] uppercase tracking-wide text-slate-500 font-semibold px-4 py-2">Modelo</th>
              <th className="text-left text-[11px] uppercase tracking-wide text-slate-500 font-semibold px-4 py-2">Color</th>
              <th className="text-left text-[11px] uppercase tracking-wide text-slate-500 font-semibold px-4 py-2">Residente</th>
              <th className="text-left text-[11px] uppercase tracking-wide text-slate-500 font-semibold px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length:6 }).map((_,i)=>(
              <tr key={i} className="border-b border-slate-100">
                <td colSpan={6} className="px-4 py-4">
                  <div className="h-4 w-1/3 bg-slate-200 rounded animate-pulse" />
                </td>
              </tr>
            ))}
            {!loading && vehicles.map(v => (
              <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2 font-medium text-slate-800">{v.plate}</td>
                <td className="px-4 py-2 text-slate-700">{v.brand}</td>
                <td className="px-4 py-2 text-slate-700">{v.model}</td>
                <td className="px-4 py-2 text-slate-700">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700">
                    {v.color.charAt(0).toUpperCase()+v.color.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-700">{v.ownerName}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2 text-slate-500">
                    <button onClick={()=>onEdit && onEdit(v)} className="p-1 rounded-md hover:bg-slate-200 hover:text-slate-700" title="Editar"><Pencil size={16}/></button>
                    <button onClick={()=> { if(confirm('Eliminar vehículo?')) deleteVehicle(v.id) }} className="p-1 rounded-md hover:bg-rose-100 hover:text-rose-600" title="Eliminar"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
