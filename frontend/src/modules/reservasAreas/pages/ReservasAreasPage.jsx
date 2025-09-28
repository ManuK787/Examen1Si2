import ReservationsToolbar from '../components/ReservationsToolbar'
import ReservationsTable from '../components/ReservationsTable'
import ReservationModal from '../components/ReservationModal'
import ReservationStatusDialog from '../components/ReservationStatusDialog'
import { useReservationsStore } from '../store/reservationsStore'
import { useEffect } from 'react'

export default function ReservasAreasPage(){
  const { fetch } = useReservationsStore()
  useEffect(()=>{ fetch() },[]) // initial load (also done by table but safe)
  return (
    <div className="p-6 space-y-5">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-800">Reservas de Áreas Comunes</h1>
        <p className="text-xs text-slate-500 max-w-prose">Gestión de solicitudes y aprobaciones de uso de las áreas comunes.</p>
      </div>
      <ReservationsToolbar />
      <ReservationsTable />
      <ReservationModal />
      <ReservationStatusDialog />
    </div>
  )
}
