import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePropertiesStore } from '../store/propertiesStore'

// Validaciones básicas reutilizadas
const BLOCK_REGEX = /^b\d{1,2}$/ // b1 .. b99

function validate(values, { existingCompositeKeys = [], editingId = null }){
  const errors = {}
  if (!values.block) errors.block = 'Bloque requerido'
  else if (!BLOCK_REGEX.test(values.block)) errors.block = 'Formato bN (b1, b2...)'

  if (!values.number) errors.number = 'Número requerido'
  else {
    const num = Number(values.number)
    if (Number.isNaN(num) || num < 1 || num > 99) errors.number = 'Número 1-99'
  }

  const numberPadded = values.number?.toString().padStart(2,'0')
  const composite = `${values.block}#${numberPadded}`
  if (!editingId && existingCompositeKeys.includes(composite)){
    errors.number = 'Ya existe bloque y número'
  }

  if (!values.ownerName || !values.ownerName.trim()) errors.ownerName = 'Propietario requerido'

  if (!values.occupancyStatus) errors.occupancyStatus = 'Estado requerido'

  if (values.landSizeM2 === '' || values.landSizeM2 === null) errors.landSizeM2 = 'Área requerida'
  else if (Number(values.landSizeM2) <= 0) errors.landSizeM2 = 'Debe ser > 0'

  if (values.capacity === '' || values.capacity === null) errors.capacity = 'Capacidad requerida'
  else if (!Number.isInteger(Number(values.capacity)) || Number(values.capacity) <= 0) errors.capacity = 'Entero > 0'

  return errors
}

export function PropertyModal({ open, onClose, initial }){
  const { createProperty, updateProperty, properties, loading, error } = usePropertiesStore()
  const [values, setValues] = useState(()=> initial || { block:'b1', number:'', ownerName:'', landSizeM2:'', capacity:'', occupancyStatus:'libre' })
  const [touched, setTouched] = useState({})
  const [localError, setLocalError] = useState(null)
  const firstFieldRef = useRef(null)
  const lastActiveRef = useRef(null)

  // Composite keys para duplicado (solo bloquear en create)
  const existingComposite = properties.filter(p=> !initial || p.id !== initial.id).map(p=> `${p.block}#${p.number}`)
  const errors = validate(values, { existingCompositeKeys: existingComposite, editingId: initial?.id || null })
  const hasErrors = Object.keys(errors).length > 0

  useEffect(()=>{
    if (open){
      lastActiveRef.current = document.activeElement
      setTimeout(()=>{ firstFieldRef.current?.focus() }, 50)
    }
  },[open])

  useEffect(()=>{
    if (!open){
      // restore focus
      lastActiveRef.current?.focus?.()
    }
  },[open])

  // Sincronizar valores cuando se abre en modo edición o cambia la propiedad inicial
  useEffect(()=>{
    if (open){
      if (initial){
        setValues({
          block: initial.block || 'b1',
            // initial.number ya está padded, pero aseguramos string simple sin ceros sobrantes para UX
          number: initial.number?.toString().replace(/^0+/,'') || '',
          ownerName: initial.ownerName || '',
          landSizeM2: initial.landSizeM2?.toString() || '',
          capacity: initial.capacity?.toString() || '',
          occupancyStatus: initial.occupancyStatus || 'libre'
        })
      } else {
        setValues({ block:'b1', number:'', ownerName:'', landSizeM2:'', capacity:'', occupancyStatus:'libre' })
      }
      setTouched({})
      setLocalError(null)
    }
  },[open, initial])

  if (!open) return null

  async function handleSubmit(e){
    e.preventDefault()
    setTouched({ block:true, number:true, ownerName:true, landSizeM2:true, capacity:true })
    if (hasErrors){
      setLocalError('Corrige los errores antes de continuar')
      return
    }
    const payload = {
      block: values.block.trim(),
      number: values.number.toString().padStart(2,'0'),
      ownerName: values.ownerName.trim(),
      landSizeM2: Number(values.landSizeM2),
      capacity: Number(values.capacity),
      occupancyStatus: values.occupancyStatus
    }
    const ok = initial ? await updateProperty(initial.id, payload) : await createProperty(payload)
    if (ok) onClose()
  }

  function setField(field, val){
    setValues(v=> ({ ...v, [field]: val }))
  }

  function fieldError(name){
    return touched[name] && errors[name]
  }

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="property-modal-title" className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mt-16 mb-10 mx-4 animate-fade-in">
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex justify-between items-start">
            <h2 id="property-modal-title" className="text-base font-semibold text-slate-800">{initial ? 'Editar propiedad' : 'Nueva propiedad'}</h2>
            <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700 text-sm" aria-label="Cerrar">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Bloque</label>
              <input ref={firstFieldRef} value={values.block} onChange={e=> setField('block', e.target.value.toLowerCase())} onBlur={()=> setTouched(t=>({...t, block:true}))} className={`w-full border rounded px-2 py-1 text-sm ${fieldError('block')?'border-rose-500':'border-slate-300'}`} placeholder="b1" />
              {fieldError('block') && <p className="text-[11px] text-rose-600 mt-1">{errors.block}</p>}
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Número</label>
              <input value={values.number} onChange={e=> setField('number', e.target.value.replace(/\D/g,''))} onBlur={()=> setTouched(t=>({...t, number:true}))} className={`w-full border rounded px-2 py-1 text-sm ${fieldError('number')?'border-rose-500':'border-slate-300'}`} placeholder="01" />
              {fieldError('number') && <p className="text-[11px] text-rose-600 mt-1">{errors.number}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Propietario</label>
            <input value={values.ownerName} onChange={e=> setField('ownerName', e.target.value)} onBlur={()=> setTouched(t=>({...t, ownerName:true}))} className={`w-full border rounded px-2 py-1 text-sm ${fieldError('ownerName')?'border-rose-500':'border-slate-300'}`} placeholder="Nombre del propietario" />
            {fieldError('ownerName') && <p className="text-[11px] text-rose-600 mt-1">{errors.ownerName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Área (m²)</label>
              <input value={values.landSizeM2} onChange={e=> setField('landSizeM2', e.target.value.replace(/[^\d.]/g,''))} onBlur={()=> setTouched(t=>({...t, landSizeM2:true}))} className={`w-full border rounded px-2 py-1 text-sm ${fieldError('landSizeM2')?'border-rose-500':'border-slate-300'}`} placeholder="150" />
              {fieldError('landSizeM2') && <p className="text-[11px] text-rose-600 mt-1">{errors.landSizeM2}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Capacidad</label>
              <input value={values.capacity} onChange={e=> setField('capacity', e.target.value.replace(/\D/g,''))} onBlur={()=> setTouched(t=>({...t, capacity:true}))} className={`w-full border rounded px-2 py-1 text-sm ${fieldError('capacity')?'border-rose-500':'border-slate-300'}`} placeholder="4" />
              {fieldError('capacity') && <p className="text-[11px] text-rose-600 mt-1">{errors.capacity}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Estado de ocupación</label>
            <select value={values.occupancyStatus} onChange={e=> setField('occupancyStatus', e.target.value)} onBlur={()=> setTouched(t=>({...t, occupancyStatus:true}))} className={`w-full border rounded px-2 py-1 text-sm ${fieldError('occupancyStatus')?'border-rose-500':'border-slate-300'}`}>
              <option value="libre">Libre</option>
              <option value="ocupado">Ocupado</option>
            </select>
            {fieldError('occupancyStatus') && <p className="text-[11px] text-rose-600 mt-1">{errors.occupancyStatus}</p>}
          </div>

          {(localError || error) && <div className="text-[12px] text-rose-600">{localError || error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded border text-sm border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50" disabled={loading}>Cancelar</button>
            <button type="submit" disabled={loading} className="px-3 py-1.5 rounded text-sm font-medium bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Guardando...' : (initial ? 'Guardar cambios' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
