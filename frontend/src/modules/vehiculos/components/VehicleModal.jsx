import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useVehiclesStore } from '../store/vehiclesStore'
import { useUsersStore } from '../../users/store/usersStore'

export function VehicleModal({ open, onClose, vehicle }) {
  const { createVehicle, updateVehicle, vehicles } = useVehiclesStore()
  const { users, fetchUsers } = useUsersStore()
  const editing = !!vehicle
  const [form, setForm] = useState({ plate:'', brand:'', model:'', color:'', ownerUserId:'', ownerName:'' })
  const colorOptions = [
    'blanco','negro','gris','plata','rojo','azul','verde','amarillo','naranja','marrón','café','beige','dorado','granate','vino','lila','morado','rosa','turquesa','celeste','aguamarina'
  ]
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showColorList, setShowColorList] = useState(false)
  const [showOwnerSuggestions, setShowOwnerSuggestions] = useState(false)
  const ownerInputRef = useRef(null)
  const colorBtnRef = useRef(null)

  useEffect(()=>{
    if (open){
      setError('')
      if (users.length === 0) fetchUsers({ page:1 })
      if (vehicle){
        setForm({ plate: vehicle.plate, brand: vehicle.brand, model: vehicle.model, color: vehicle.color, ownerUserId: vehicle.ownerUserId || '', ownerName: vehicle.ownerName || '' })
      } else {
        setForm({ plate:'', brand:'', model:'', color:'', ownerUserId:'', ownerName:'' })
      }
    }
  },[open, vehicle])
  // Global click handler para cerrar lista de colores (debe estar antes de cualquier return para no romper orden de hooks)
  useEffect(()=>{
    function handler(e){
      if (!colorBtnRef.current) return
      if (!colorBtnRef.current.parentElement.contains(e.target)){
        setShowColorList(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return ()=> document.removeEventListener('mousedown', handler)
  },[])

  if (!open) return null

  const onChange = e => {
    let { name, value } = e.target
    if (name === 'plate') value = value.toUpperCase().replace(/\s+/g,'')
    if (name === 'brand') value = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÜüÑñ\s-]/g,'')
    if (name === 'model') value = value.replace(/[^A-Za-z0-9ÁÉÍÓÚáéíóúÜüÑñ\s-]/g,'')
    if (name === 'ownerName') {
      // limpiar ID si se edita manualmente
      setForm(f=> ({ ...f, ownerUserId:'', ownerName: value }))
      setShowOwnerSuggestions(true)
      return
    }
    setForm(f=>({ ...f, [name]: value }))
  }

  const validate = ()=>{
    // Nuevo formato requerido: 3 o 4 números seguidos de 3 letras (ej: 123ABC, 1234ABC)
    // Permitimos formato legado al editar (ej: ABC123, ABC-1234) para no bloquear registros existentes.
    const newPattern = /^\d{3,4}[A-Z]{3}$/
    const legacyPattern = /^[A-Z]{3}-?\d{3,4}$/
    const plateUpper = form.plate.toUpperCase()
    const isNewValid = newPattern.test(plateUpper)
    const isLegacyValid = legacyPattern.test(plateUpper)
    if (!isNewValid) {
      // Solo aceptamos legado si se está editando y la placa original también era válida bajo legado
      if (!(editing && vehicle && legacyPattern.test(vehicle.plate.toUpperCase()) && isLegacyValid)) {
        return 'Placa inválida (formato: 123ABC o 1234ABC)'
      }
    }
    const duplicate = vehicles.some(v=> v.plate.toUpperCase() === form.plate.toUpperCase() && (!editing || v.id !== vehicle.id))
    if (duplicate) return 'La placa ya está registrada'
    if (!form.brand.trim()) return 'Marca requerida'
    if (form.brand.trim().length < 2) return 'Marca muy corta'
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ\s-]+$/.test(form.brand.trim())) return 'Marca: solo letras'
    if (!form.model.trim()) return 'Modelo requerido'
    if (form.model.trim().length < 2) return 'Modelo muy corto'
    if (!/^[A-Za-z0-9ÁÉÍÓÚáéíóúÜüÑñ\s-]+$/.test(form.model.trim())) return 'Modelo: solo letras y números'
    if (!form.color.trim()) return 'Color requerido'
    if (form.color.length < 3) return 'Color muy corto'
    if (!colorOptions.includes(form.color)) return 'Selecciona un color válido'
    if (!form.ownerUserId && !form.ownerName.trim()) return 'Residente requerido (selecciona o escribe nombre)'
    return ''
  }

  const onSubmit = async e => {
    e.preventDefault()
    const vErr = validate()
    if (vErr){ setError(vErr); return }
    setSaving(true)
    try {
      let ownerId = form.ownerUserId
      let ownerName = form.ownerName.trim()
      if (!ownerId && ownerName){
        const match = users.find(u=> u.fullName.toLowerCase() === ownerName.toLowerCase())
        if (match){
          ownerId = match.id
          ownerName = match.fullName
        }
      }
      if (!ownerName && ownerId){
        const match = users.find(u=> u.id === ownerId)
        ownerName = match? match.fullName : 'Residente'
      }
      const payload = { ...form, ownerUserId: ownerId || undefined, ownerName: ownerName || 'Residente' }
      if (editing) await updateVehicle(vehicle.id, payload)
      else await createVehicle(payload)
      onClose()
    } catch (err){
      setError(err.message || 'Error al guardar')
    } finally { setSaving(false) }
  }

  // Filtrar sugerencias de residentes
  const ownerSuggestions = form.ownerName
    ? users.filter(u=> u.role==='Residente' && u.fullName.toLowerCase().includes(form.ownerName.toLowerCase())).slice(0,8)
    : users.filter(u=> u.role==='Residente').slice(0,8)

  const pickOwner = (u) => {
    setForm(f=> ({ ...f, ownerUserId: u.id, ownerName: u.fullName }))
    setShowOwnerSuggestions(false)
  }

  const pickColor = (c) => {
    setForm(f=> ({ ...f, color: c }))
    setShowColorList(false)
  }


  const modalContent = (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-lg p-6 animate-in fade-in zoom-in" role="dialog" aria-modal="true" aria-label={editing ? 'Editar Vehículo' : 'Nuevo Vehículo'}>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">{editing ? 'Editar Vehículo' : 'Nuevo Vehículo'}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Placa</label>
              <input name="plate" value={form.plate} onChange={onChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="123ABC" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Marca</label>
              <input name="brand" value={form.brand} onChange={onChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="Toyota" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Modelo</label>
              <input name="model" value={form.model} onChange={onChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="Corolla" />
            </div>
            <div className="relative">
              <label className="block text-xs font-medium text-slate-600 mb-1">Color</label>
              <button type="button" ref={colorBtnRef} onClick={()=> setShowColorList(s=>!s)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm flex items-center justify-between bg-white focus:outline-none focus:ring-2 focus:ring-slate-400">
                <span>{form.color ? form.color.charAt(0).toUpperCase()+form.color.slice(1) : 'Seleccionar color...'}</span>
                <span className="text-[10px] text-slate-500">▼</span>
              </button>
              {showColorList && (
                <div className="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto rounded-lg border border-slate-300 bg-white shadow-md p-1 text-xs">
                  <div className="grid grid-cols-2 gap-1">
                    {colorOptions.map(c => (
                      <button key={c} type="button" onClick={()=> pickColor(c)} className={`flex items-center rounded px-2 py-1 hover:bg-slate-100 text-left ${form.color===c?'bg-slate-900 text-white hover:bg-slate-900':''}`}> 
                        {c.charAt(0).toUpperCase()+c.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Residente (escribe o selecciona)</label>
              <div className="relative">
                <input
                  ref={ownerInputRef}
                  name="ownerName"
                  value={form.ownerName}
                  onChange={onChange}
                  onFocus={()=> setShowOwnerSuggestions(true)}
                  placeholder="Juan Pérez"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                {showOwnerSuggestions && ownerSuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-slate-300 bg-white shadow-md text-xs">
                    {ownerSuggestions.map(u => (
                      <button key={u.id} type="button" onClick={()=> pickOwner(u)} className="w-full text-left px-3 py-2 hover:bg-slate-100 flex justify-between items-center">
                        <span>{u.fullName}</span>
                        {u.casa && <span className="text-[10px] text-slate-500">{u.casa}</span>}
                      </button>
                    ))}
                    <div className="px-2 py-1 border-t border-slate-200 text-[10px] text-slate-400">{form.ownerUserId ? 'Seleccionado' : 'Sin asignar a usuario existente'}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {error && <div className="text-xs text-rose-600" role="alert">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700">Cancelar</button>
            <button disabled={saving} className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50">
              {saving? 'Guardando...' : (editing? 'Guardar Cambios' : 'Crear Vehículo')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
