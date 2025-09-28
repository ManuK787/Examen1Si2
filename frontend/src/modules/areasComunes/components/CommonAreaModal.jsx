import { useEffect, useState } from 'react'
import { useCommonAreasStore } from '../store/commonAreasStore'

const TYPES = [
  { value: 'salon', label: 'Salón' },
  { value: 'piscina', label: 'Piscina' },
  { value: 'gimnasio', label: 'Gimnasio' },
  { value: 'cancha', label: 'Cancha' },
  { value: 'parque', label: 'Parque' }
]

function validate(form){
  const errors = {}
  if (!form.name?.trim()) errors.name = 'Nombre requerido'
  if (!form.type) errors.type = 'Tipo requerido'
  const capacityNum = Number(form.capacity)
  if (!capacityNum || capacityNum <= 0) errors.capacity = 'Capacidad debe ser > 0'
  if (form.hourlyRate !== '' && form.hourlyRate != null) {
    const hr = Number(form.hourlyRate)
    if (isNaN(hr) || hr < 0) errors.hourlyRate = 'Costo debe ser >= 0'
  }
  // Horarios basicos HH:MM 24h
  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/
  if (!timeRegex.test(form.openTime)) errors.openTime = 'Hora inválida'
  if (!timeRegex.test(form.closeTime)) errors.closeTime = 'Hora inválida'
  if (!errors.openTime && !errors.closeTime) {
    if (form.openTime >= form.closeTime) errors.closeTime = 'Cierre debe ser mayor que apertura'
  }
  return errors
}

export function CommonAreaModal(){
  const { isModalOpen, closeModal, editingItem, createItem, updateItem, loading } = useCommonAreasStore()
  const isEdit = !!editingItem
  const [form, setForm] = useState({
    code: '',
    name: '',
    type: '',
    capacity: '',
    openTime: '08:00',
    closeTime: '18:00',
    requiresApproval: false,
    status: 'disponible'
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)

  useEffect(() => {
    if (editingItem) {
      setForm({
        code: editingItem.code || '',
        name: editingItem.name || '',
        type: editingItem.type || '',
        capacity: editingItem.capacity ?? '',
        openTime: editingItem.openTime || '08:00',
        closeTime: editingItem.closeTime || '18:00',
        requiresApproval: !!editingItem.requiresApproval,
        status: editingItem.status || 'disponible'
      })
    } else if (isModalOpen) {
      setForm({
        code: '',
        name: '',
        type: '',
        capacity: '',
        openTime: '08:00',
        closeTime: '18:00',
        requiresApproval: false,
        status: 'disponible'
      })
    }
    setErrors({})
    setSubmitError(null)
  }, [editingItem, isModalOpen])

  if (!isModalOpen) return null

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const v = validate(form)
    setErrors(v)
    if (Object.keys(v).length) return
    try {
      setSubmitError(null)
      if (isEdit) {
        await updateItem(editingItem.id, form)
      } else {
        await createItem(form)
      }
      closeModal()
    } catch (err) {
      setSubmitError(err.message || 'Error al guardar')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
      <div className="bg-white rounded-lg shadow w-full max-w-lg mx-4 animate-fade-in">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="font-semibold text-slate-700 text-sm">{isEdit ? 'Editar Área Común' : 'Nueva Área Común'}</h2>
          <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-sm">
          {submitError && <div className="text-red-600 text-xs bg-red-50 border border-red-200 rounded p-2">{submitError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Nombre *</label>
              <input name="name" value={form.name} onChange={onChange} className="w-full border rounded px-2 py-1 text-sm" placeholder="Ej: Salón Social" />
              {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tipo *</label>
              <select name="type" value={form.type} onChange={onChange} className="w-full border rounded px-2 py-1 text-sm">
                <option value="">Seleccione...</option>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {errors.type && <p className="text-red-500 text-[11px] mt-1">{errors.type}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Capacidad *</label>
              <input name="capacity" type="number" min={1} value={form.capacity} onChange={onChange} className="w-full border rounded px-2 py-1 text-sm" />
              {errors.capacity && <p className="text-red-500 text-[11px] mt-1">{errors.capacity}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Costo/Hora (opcional)</label>
              <input name="hourlyRate" type="number" min={0} step="0.01" value={form.hourlyRate || ''} onChange={onChange} className="w-full border rounded px-2 py-1 text-sm" placeholder="0 = sin costo" />
              {errors.hourlyRate && <p className="text-red-500 text-[11px] mt-1">{errors.hourlyRate}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Apertura *</label>
              <input name="openTime" type="time" value={form.openTime} onChange={onChange} className="w-full border rounded px-2 py-1 text-sm" />
              {errors.openTime && <p className="text-red-500 text-[11px] mt-1">{errors.openTime}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Cierre *</label>
              <input name="closeTime" type="time" value={form.closeTime} onChange={onChange} className="w-full border rounded px-2 py-1 text-sm" />
              {errors.closeTime && <p className="text-red-500 text-[11px] mt-1">{errors.closeTime}</p>}
            </div>
            <div className="flex items-center gap-2 mt-5">
              <input id="requiresApproval" name="requiresApproval" type="checkbox" checked={form.requiresApproval} onChange={onChange} />
              <label htmlFor="requiresApproval" className="text-xs text-slate-600">Requiere Aprobación</label>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Estado *</label>
              <select name="status" value={form.status} onChange={onChange} className="w-full border rounded px-2 py-1 text-sm">
                <option value="disponible">Disponible</option>
                <option value="reservado">Reservado</option>
                <option value="mantenimiento">Mantenimiento</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={closeModal} className="px-3 py-1.5 text-xs rounded border border-slate-300 text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button disabled={loading} className="px-3 py-1.5 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
              {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
