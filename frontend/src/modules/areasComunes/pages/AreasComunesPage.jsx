import { CommonAreasToolbar } from '../components/CommonAreasToolbar'
import { CommonAreasTable } from '../components/CommonAreasTable'
import { CommonAreaModal } from '../components/CommonAreaModal'
import { useCommonAreasStore } from '../store/commonAreasStore'
import { useEffect } from 'react'

export default function AreasComunesPage() {
  const { fetch } = useCommonAreasStore()
  useEffect(() => { fetch() }, []) // primera carga
  return (
    <div className="p-6 space-y-5">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-800">Áreas Comunes</h1>
        <p className="text-xs text-slate-500">Administra las áreas disponibles del condominio. Próximamente: reservas y calendario.</p>
      </div>
      <CommonAreasToolbar />
      <CommonAreasTable />
      <CommonAreaModal />
    </div>
  )
}
