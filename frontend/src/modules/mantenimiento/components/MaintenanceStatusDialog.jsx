import { useState, useEffect } from 'react'
import { useMaintenanceTasksStore } from '../store/maintenanceTasksStore'

const STATUS_OPTIONS = [
  { ui: 'pendiente', label: 'Pendiente' },
  { ui: 'en progreso', label: 'En Progreso' },
  { ui: 'completada', label: 'Completada' },
  { ui: 'cancelada', label: 'Cancelada' }
]

export default function MaintenanceStatusDialog(){
  const statusDialog = useMaintenanceTasksStore(s=>s.statusDialog)
  const closeStatusDialog = useMaintenanceTasksStore(s=>s.closeStatusDialog)
  const changeStatus = useMaintenanceTasksStore(s=>s.changeStatus)
  const loading = useMaintenanceTasksStore(s=>s.loading)
  const error = useMaintenanceTasksStore(s=>s.error)
  const task = statusDialog.task
  const [uiStatus, setUiStatus] = useState('pendiente')
  const [progress, setProgress] = useState('')
  const [reason, setReason] = useState('')

  useEffect(()=>{
    if (task){
      // task.status is already in UI language (pendiente, en progreso, etc.) from normalizer
      setUiStatus(task.status)
      setProgress(task.progressPercent ?? '')
      setReason('')
    }
  }, [task])

  if (!statusDialog.open) return null

  const onSubmit = async e => {
    e.preventDefault()
  await changeStatus(task.id, uiStatus, progress === '' ? null : Number(progress), reason)
  }

  const needsProgress = uiStatus === 'en progreso'
  const needsReason = uiStatus === 'cancelada'

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded shadow-lg w-full max-w-md p-4">
        <h2 className="text-lg font-semibold mb-4">Cambiar Estado</h2>
        {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3 text-sm">
          <div>
            <label className="block font-medium mb-1">Estado</label>
            <select value={uiStatus} onChange={e=>setUiStatus(e.target.value)} className="w-full border rounded px-2 py-1">
              {STATUS_OPTIONS.map(o => <option key={o.ui} value={o.ui}>{o.label}</option>)}
            </select>
          </div>
          {needsProgress && (
            <div>
              <label className="block font-medium mb-1">Progreso (%)</label>
              <input type="number" min={0} max={100} value={progress} onChange={e=>setProgress(e.target.value)} className="w-full border rounded px-2 py-1" />
            </div>
          )}
          {needsReason && (
            <div>
              <label className="block font-medium mb-1">Motivo Cancelación *</label>
              <textarea rows={3} value={reason} onChange={e=>setReason(e.target.value)} required className="w-full border rounded px-2 py-1" />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeStatusDialog} className="px-3 py-1 border rounded">Cerrar</button>
            <button disabled={loading} className="px-4 py-1 bg-blue-600 text-white rounded disabled:opacity-60">{loading ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
