import { useEffect } from 'react'
import MaintenanceTasksToolbar from '../components/MaintenanceTasksToolbar'
import MaintenanceTasksTable from '../components/MaintenanceTasksTable'
import MaintenanceTaskModal from '../components/MaintenanceTaskModal'
import MaintenanceStatusDialog from '../components/MaintenanceStatusDialog'
import { useMaintenanceTasksStore } from '../store/maintenanceTasksStore'

export default function MantenimientoPage() {
  const fetchTasks = useMaintenanceTasksStore(s=>s.fetchTasks)
  const dirty = useMaintenanceTasksStore(s=>s.dirty)

  useEffect(()=>{
    if (!dirty) return
    fetchTasks()
  }, [dirty, fetchTasks])
  return (
    <div className="p-6 space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-800">Mantenimiento</h1>
        <p className="text-sm text-slate-500">Gestión simple de tareas de mantenimiento internas.</p>
      </header>
      <MaintenanceTasksToolbar />
      <MaintenanceTasksTable />
      <MaintenanceTaskModal />
      <MaintenanceStatusDialog />
    </div>
  )
}
