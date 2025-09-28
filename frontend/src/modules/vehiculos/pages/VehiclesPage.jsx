import React, { useEffect, useState } from 'react'
import { useVehiclesStore } from '../store/vehiclesStore'
import { VehiclesToolbar } from '../components/VehiclesToolbar'
import { VehiclesTable } from '../components/VehiclesTable'
import { VehicleModal } from '../components/VehicleModal'

export default function VehiclesPage() {
  const { fetchVehicles, page, pageSize, total, setPage } = useVehiclesStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)

  useEffect(()=>{ fetchVehicles() }, [page])

  const onNew = () => { setEditingVehicle(null); setModalOpen(true) }
  const onEdit = (vehicle) => { setEditingVehicle(vehicle); setModalOpen(true) }
  const totalPages = Math.ceil(total / pageSize) || 1

  return (
    <div className="space-y-4 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Gestión de Vehículos</h1>
          <p className="text-xs text-slate-500 mt-1">Administra los vehículos registrados y sus propietarios.</p>
        </div>
      </div>
      <VehiclesToolbar onNew={onNew} />
      <VehiclesTable onEdit={onEdit} />
      <div className="flex items-center justify-end gap-2 pt-2">
        <button disabled={page===1} onClick={()=> setPage(page-1)} className="px-3 py-1 text-xs rounded border border-slate-300 bg-white disabled:opacity-50">Anterior</button>
        <span className="text-xs text-slate-600 select-none">Página {page} de {totalPages}</span>
        <button disabled={page===totalPages} onClick={()=> setPage(page+1)} className="px-3 py-1 text-xs rounded border border-slate-300 bg-white disabled:opacity-50">Siguiente</button>
      </div>
      <VehicleModal open={modalOpen} onClose={()=> setModalOpen(false)} vehicle={editingVehicle} />
    </div>
  )
}
