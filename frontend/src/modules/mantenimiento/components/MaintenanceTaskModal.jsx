import { useState, useEffect } from 'react'
import { useMaintenanceTasksStore } from '../store/maintenanceTasksStore'

export default function MaintenanceTaskModal(){
  const dialog = useMaintenanceTasksStore(s=>s.dialog)
  const closeDialog = useMaintenanceTasksStore(s=>s.closeDialog)
  const createTask = useMaintenanceTasksStore(s=>s.createTask)
  const updateTask = useMaintenanceTasksStore(s=>s.updateTask)
  const loading = useMaintenanceTasksStore(s=>s.loading)
  const error = useMaintenanceTasksStore(s=>s.error)

  const editing = dialog.editing
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assigneeId: '',
    assigneeName: '',
    dueDate: ''
  })

  useEffect(()=>{
    if (editing){
      setForm({
        title: editing.title || '',
        description: editing.description || '',
        priority: editing.priority || 'medium',
        assigneeId: editing.assigneeId || '',
        assigneeName: editing.assigneeName || '',
        dueDate: editing.dueDate || ''
      })
    } else {
      setForm({ title:'', description:'', priority:'medium', assigneeId:'', assigneeName:'', dueDate:'' })
    }
  }, [editing])

  if (!dialog.open) return null

  const onChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      assigneeId: form.assigneeId ? Number(form.assigneeId) : undefined
    }
    if (editing){
      await updateTask(editing.id, payload)
    } else {
      await createTask(payload)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded shadow-lg w-full max-w-lg p-4">
        <h2 className="text-lg font-semibold mb-4">{editing ? 'Editar Tarea' : 'Nueva Tarea de Mantenimiento'}</h2>
        {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Título *</label>
            <input name="title" value={form.title} onChange={onChange} required className="w-full border rounded px-2 py-1 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Descripción</label>
            <textarea name="description" value={form.description} onChange={onChange} rows={3} className="w-full border rounded px-2 py-1 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Prioridad</label>
              <select name="priority" value={form.priority} onChange={onChange} className="w-full border rounded px-2 py-1 text-sm">
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Fecha Límite</label>
              <input type="date" name="dueDate" value={form.dueDate||''} onChange={onChange} className="w-full border rounded px-2 py-1 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">ID Asignado *</label>
              <input name="assigneeId" value={form.assigneeId} onChange={onChange} required className="w-full border rounded px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium">Nombre Asignado</label>
              <input name="assigneeName" value={form.assigneeName} onChange={onChange} className="w-full border rounded px-2 py-1 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeDialog} className="px-3 py-1 text-sm border rounded">Cancelar</button>
            <button disabled={loading} className="px-4 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-60">{loading ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
