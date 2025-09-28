import { useEffect, useState } from 'react'
import { useReservationsStore } from '../store/reservationsStore'

function validate(form){
  const errors = {}
  if (!form.areaId) errors.areaId = 'Requerido'
  if (!form.date) errors.date = 'Requerido'
  if (!form.startTime) errors.startTime = 'Requerido'
  if (!form.endTime) errors.endTime = 'Requerido'
  if (form.startTime && form.endTime && form.startTime >= form.endTime) errors.endTime = 'Fin debe ser > inicio'
  return errors
}

export default function ReservationModal(){
  const { modalOpen, closeModal, editing, createItem, updateItem, loading, error } = useReservationsStore()
  const [form, setForm] = useState({ areaId:'', date:'', startTime:'', endTime:'', attendees:'', notes:'', requesterName:'' })
  const [errors, setErrors] = useState({})

  useEffect(()=>{
    if (editing){
      setForm({
        areaId: editing.areaId || '',
        date: editing.date || '',
        startTime: editing.startTime || '',
        endTime: editing.endTime || '',
        attendees: editing.attendees || '',
        notes: editing.notes || '',
        requesterName: editing.requesterName || ''
      })
    } else if (modalOpen){
      setForm({ areaId:'', date:'', startTime:'', endTime:'', attendees:'', notes:'', requesterName:'' })
    }
  },[modalOpen, editing])

  if (!modalOpen) return null

  function onChange(e){
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e){
    e.preventDefault()
    const v = validate(form)
    setErrors(v)
    if (Object.keys(v).length) return
    const payload = {
      areaId: form.areaId ? Number(form.areaId) : null,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      attendees: form.attendees ? Number(form.attendees) : null,
      notes: form.notes.trim(),
      requesterName: form.requesterName.trim() || 'Sin nombre'
    }
    if (editing){
      await updateItem(editing.id, payload)
    } else {
      await createItem(payload)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-slate-900/30 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-lg mt-16 rounded shadow-lg border">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">{editing ? 'Editar Reserva' : 'Nueva Reserva'}</h3>
          <button onClick={closeModal} className="text-slate-500 hover:text-slate-700 text-sm">✕</button>
        </div>
        {error && <div className="px-5 py-2 text-xs text-rose-600 bg-rose-50 border-b">{error}</div>}
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Área ID</label>
              <input name="areaId" value={form.areaId} onChange={onChange} className="border rounded px-2 py-1 text-sm" />
              {errors.areaId && <span className="text-[10px] text-rose-600">{errors.areaId}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Fecha</label>
              <input type="date" name="date" value={form.date} onChange={onChange} className="border rounded px-2 py-1 text-sm" />
              {errors.date && <span className="text-[10px] text-rose-600">{errors.date}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Inicio</label>
              <input type="time" name="startTime" value={form.startTime} onChange={onChange} className="border rounded px-2 py-1 text-sm" />
              {errors.startTime && <span className="text-[10px] text-rose-600">{errors.startTime}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Fin</label>
              <input type="time" name="endTime" value={form.endTime} onChange={onChange} className="border rounded px-2 py-1 text-sm" />
              {errors.endTime && <span className="text-[10px] text-rose-600">{errors.endTime}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Asistentes</label>
              <input name="attendees" value={form.attendees} onChange={onChange} type="number" min="0" className="border rounded px-2 py-1 text-sm" />
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Notas</label>
              <textarea name="notes" value={form.notes} onChange={onChange} className="border rounded px-2 py-1 text-sm min-h-[70px] resize-y" />
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Solicitante</label>
              <input name="requesterName" value={form.requesterName} onChange={onChange} placeholder="Nombre residente" className="border rounded px-2 py-1 text-sm" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={closeModal} className="px-3 py-1.5 text-xs border rounded hover:bg-slate-100">Cancelar</button>
            <button disabled={loading} className="px-3 py-1.5 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50">{editing ? 'Guardar cambios' : 'Crear'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
