import { useMaintenanceTasksStore } from '../store/maintenanceTasksStore'
import { Pencil, Trash2, Loader2, ArrowRightLeft, AlertTriangle, CheckCircle2, CircleDashed, XCircle } from 'lucide-react'

function StatusBadge({ status }){
  let cls = 'px-2 py-0.5 text-xs rounded-full font-medium inline-flex items-center gap-1'
  let icon = null
  switch(status){
    case 'pendiente': cls += ' bg-slate-200 text-slate-700'; icon=<CircleDashed className="w-3 h-3" />; break
    case 'en progreso': cls += ' bg-amber-200 text-amber-800'; icon=<AlertTriangle className="w-3 h-3" />; break
    case 'completada': cls += ' bg-green-200 text-green-800'; icon=<CheckCircle2 className="w-3 h-3" />; break
    case 'cancelada': cls += ' bg-red-200 text-red-700'; icon=<XCircle className="w-3 h-3" />; break
    default: cls += ' bg-slate-200 text-slate-600'
  }
  return <span className={cls}>{icon}{status}</span>
}

function PriorityBadge({ priority }){
  let cls = 'px-2 py-0.5 text-xs rounded-full font-medium'
  switch(priority){
    case 'high': cls += ' bg-red-600 text-white'; break
    case 'medium': cls += ' bg-amber-500 text-white'; break
    case 'low': cls += ' bg-slate-400 text-white'; break
    default: cls += ' bg-slate-300 text-slate-700'
  }
  return <span className={cls}>{priority}</span>
}

export default function MaintenanceTasksTable(){
  const tasks = useMaintenanceTasksStore(s=>s.tasks)
  const loading = useMaintenanceTasksStore(s=>s.loading)
  const error = useMaintenanceTasksStore(s=>s.error)
  const openEditDialog = useMaintenanceTasksStore(s=>s.openEditDialog)
  const openStatusDialog = useMaintenanceTasksStore(s=>s.openStatusDialog)
  const removeTask = useMaintenanceTasksStore(s=>s.removeTask)
  const page = useMaintenanceTasksStore(s=>s.page)
  const pageSize = useMaintenanceTasksStore(s=>s.pageSize)
  const setPage = useMaintenanceTasksStore(s=>s.setPage)

  // No hacemos fetch aquí para evitar loops; la página controla el fetching.

  const canEdit = t => t.status === 'pendiente'
  const canDelete = t => t.status === 'pendiente'

  return (
    <div className="border rounded overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">ID</th>
              <th className="px-3 py-2 text-left font-semibold">Título</th>
              <th className="px-3 py-2 text-left font-semibold">Estado</th>
              <th className="px-3 py-2 text-left font-semibold">Progreso</th>
              <th className="px-3 py-2 text-left font-semibold">Prioridad</th>
              <th className="px-3 py-2 text-left font-semibold">Asignado</th>
              <th className="px-3 py-2 text-left font-semibold">Creado</th>
              <th className="px-3 py-2 text-left font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500"><Loader2 className="w-5 h-5 mx-auto animate-spin" /></td>
              </tr>
            )}
            {!loading && error && (
              <tr><td colSpan={8} className="py-6 text-center text-red-600">{error}</td></tr>
            )}
            {!loading && !error && tasks.length === 0 && (
              <tr><td colSpan={8} className="py-6 text-center text-slate-500">Sin registros</td></tr>
            )}
            {tasks.map(t => (
              <tr key={t.id} className="border-t hover:bg-slate-50">
                <td className="px-3 py-2 align-top">{t.id}</td>
                <td className="px-3 py-2 align-top">
                  <div className="font-medium text-slate-800">{t.title}</div>
                  {t.description && <div className="text-xs text-slate-500 line-clamp-2 max-w-xs">{t.description}</div>}
                  {t.dueDate && <div className="text-[11px] mt-1 text-amber-600">Vence: {t.dueDate}</div>}
                </td>
                <td className="px-3 py-2 align-top"><StatusBadge status={t.status} /></td>
                <td className="px-3 py-2 align-top">{t.progressPercent ?? 0}%</td>
                <td className="px-3 py-2 align-top"><PriorityBadge priority={t.priority} /></td>
                <td className="px-3 py-2 align-top text-xs">{t.assigneeName || ('ID '+t.assigneeId)}</td>
                <td className="px-3 py-2 align-top text-xs">{t.createdAt?.slice(0,10)}</td>
                <td className="px-3 py-2 align-top">
                  <div className="flex gap-1">
                    <button onClick={()=>openStatusDialog(t)} className="p-1 rounded hover:bg-slate-200" title="Cambiar estado"><ArrowRightLeft className="w-4 h-4" /></button>
                    {canEdit(t) && <button onClick={()=>openEditDialog(t)} className="p-1 rounded hover:bg-slate-200" title="Editar"><Pencil className="w-4 h-4" /></button>}
                    {canDelete(t) && <button onClick={()=>{ if (confirm('¿Eliminar tarea?')) removeTask(t.id) }} className="p-1 rounded hover:bg-red-100 text-red-600" title="Eliminar"><Trash2 className="w-4 h-4" /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Paginación simple (mock) */}
      <div className="flex items-center justify-between px-3 py-2 border-t bg-slate-50 text-xs text-slate-600">
        <span>Página {page}</span>
        <div className="flex gap-2">
          <button disabled={page===1} onClick={()=>setPage(page-1)} className="px-2 py-1 border rounded disabled:opacity-40">Prev</button>
          <button onClick={()=>setPage(page+1)} className="px-2 py-1 border rounded">Next</button>
        </div>
      </div>
    </div>
  )
}
