import React, { useEffect, useState } from 'react'
import { usePropertiesStore } from '../store/propertiesStore'
import { PropertiesToolbar } from '../components/PropertiesToolbar'
import { PropertiesTable } from '../components/PropertiesTable'
import { PropertyModal } from '../components/PropertyModal'

export default function PropertiesPage() {
  const { fetchProperties, page, total, pageSize, setPage } = usePropertiesStore()
  const [openModal, setOpenModal] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(()=>{ fetchProperties({ page:1 }) },[])

  const totalPages = Math.ceil(total / pageSize) || 1

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg font-semibold text-slate-800 mb-4">Propiedades</h1>
      <PropertiesToolbar onNew={()=> { setEditing(null); setOpenModal(true) }} />
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <PropertiesTable onEdit={(prop)=> { setEditing(prop); setOpenModal(true) }} />
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-600">
          <span>Página {page} de {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page<=1} onClick={()=> setPage(page-1)} className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-100">Anterior</button>
            <button disabled={page>=totalPages} onClick={()=> setPage(page+1)} className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-100">Siguiente</button>
          </div>
        </div>
      </div>
      <PropertyModal open={openModal} onClose={()=> setOpenModal(false)} initial={editing} />
    </div>
  )
}
