import { useState, useEffect } from 'react'
import { useFinancialConceptsStore } from '../store/financialConceptsStore'

export default function ConceptModal(){
  const dialogOpen = useFinancialConceptsStore(s=>s.dialog.open)
  const mode = useFinancialConceptsStore(s=>s.dialog.mode)
  const editing = useFinancialConceptsStore(s=>s.dialog.editing)
  const closeDialog = useFinancialConceptsStore(s=>s.closeDialog)
  const create = useFinancialConceptsStore(s=>s.create)
  const update = useFinancialConceptsStore(s=>s.update)

  const isEdit = mode==='edit'

  const [form,setForm] = useState({
    name:'', code:'', description:'', conceptType:'fee', method:'fixed', baseAmount:0, currency:'BOB', periodicity:'monthly', unitBasis:'', validFrom:'', validTo:'', appliesTo:'all', blocks:'', propertyTypes:'', infractions:''
  })

  useEffect(()=>{
    if (isEdit && editing){
      const c = editing
      setForm({
        name: c.name,
        code: c.code,
        description: c.description,
        conceptType: c.conceptType,
        method: c.calculation.method,
        baseAmount: c.calculation.baseAmount,
        currency: c.calculation.currency,
        periodicity: c.periodicity,
        unitBasis: c.calculation.unitBasis || '',
        validFrom: c.versioning.current.validFrom,
        validTo: c.versioning.current.validTo || '',
        appliesTo: c.scope.appliesTo,
        blocks: c.scope.blocks.join(','),
        propertyTypes: c.scope.propertyTypes.join(','),
        infractions: c.scope.infractions.join(',')
      })
    } else if (dialogOpen && !isEdit){
      setForm(f=>({...f, name:'', code:'', description:'', conceptType:'fee', method:'fixed', baseAmount:0, currency:'BOB', periodicity:'monthly', unitBasis:'', validFrom:'', validTo:'', appliesTo:'all', blocks:'', propertyTypes:'', infractions:'' }))
    }
  },[dialogOpen, isEdit, editing])

  if (!dialogOpen || (mode!=='create' && mode!=='edit')) return null

  const onSubmit = (e)=>{
    e.preventDefault()
    const payload = {
      name: form.name.trim(),
      code: form.code.trim() || undefined,
      description: form.description.trim(),
      conceptType: form.conceptType,
      calculation: { method: form.method, baseAmount: Number(form.baseAmount), currency: form.currency, unitBasis: form.unitBasis || null },
      periodicity: form.periodicity,
      scope: buildScope(form),
      validFrom: form.validFrom || undefined,
      validTo: form.validTo || undefined,
      status: isEdit ? undefined : 'active'
    }
    if (isEdit){
      update(editing.id, payload)
    } else {
      create(payload)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded shadow-lg">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="font-semibold text-slate-700 text-sm">{isEdit? 'Editar Concepto' : 'Nuevo Concepto'}</h2>
          <button onClick={closeDialog} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        <form onSubmit={onSubmit} className="p-4 space-y-6 text-sm">
          <section className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1">Nombre</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Código (opcional)</label>
              <input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value}))} className="w-full border rounded px-2 py-1" />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-medium mb-1">Descripción</label>
              <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3} className="w-full border rounded px-2 py-1" />
            </div>
          </section>
          <section className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Tipo</label>
              <select value={form.conceptType} onChange={e=>setForm(f=>({...f,conceptType:e.target.value}))} className="w-full border rounded px-2 py-1">
                <option value="fee">Expensa</option>
                <option value="fine">Multa</option>
                <option value="misc">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Método</label>
              <select value={form.method} onChange={e=>setForm(f=>({...f,method:e.target.value}))} className="w-full border rounded px-2 py-1">
                <option value="fixed">Fijo</option>
                <option value="per_unit">Por unidad</option>
                <option value="per_m2">Por m²</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Monto Base</label>
              <input type="number" step="0.01" value={form.baseAmount} onChange={e=>setForm(f=>({...f,baseAmount:e.target.value}))} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Moneda</label>
              <select value={form.currency} onChange={e=>setForm(f=>({...f,currency:e.target.value}))} className="w-full border rounded px-2 py-1">
                <option value="BOB">BOB</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Periodicidad</label>
              <select value={form.periodicity} onChange={e=>setForm(f=>({...f,periodicity:e.target.value}))} className="w-full border rounded px-2 py-1">
                <option value="monthly">Mensual</option>
                <option value="quarterly">Trimestral</option>
                <option value="yearly">Anual</option>
                <option value="one_time">Único</option>
              </select>
            </div>
            {form.method==='per_unit' && <div>
              <label className="block text-xs font-medium mb-1">Unit Basis</label>
              <input value={form.unitBasis} onChange={e=>setForm(f=>({...f,unitBasis:e.target.value}))} placeholder="unidad" className="w-full border rounded px-2 py-1" />
            </div>}
            {form.method==='per_m2' && <div>
              <label className="block text-xs font-medium mb-1">Base Unidad</label>
              <input disabled value="m²" className="w-full border rounded px-2 py-1 bg-slate-100" />
            </div>}
            <div>
              <label className="block text-xs font-medium mb-1">Vigente Desde</label>
              <input type="date" value={form.validFrom} onChange={e=>setForm(f=>({...f,validFrom:e.target.value}))} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Vigente Hasta</label>
              <input type="date" value={form.validTo} onChange={e=>setForm(f=>({...f,validTo:e.target.value}))} className="w-full border rounded px-2 py-1" />
            </div>
          </section>
          <section className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Aplica a</label>
              <select value={form.appliesTo} onChange={e=>setForm(f=>({...f,appliesTo:e.target.value}))} className="w-full border rounded px-2 py-1">
                <option value="all">Todas</option>
                <option value="blocks">Bloques</option>
                <option value="property_types">Tipos Propiedad</option>
                <option value="infractions">Infracciones</option>
              </select>
            </div>
            {form.appliesTo==='blocks' && <div className="col-span-2">
              <label className="block text-xs font-medium mb-1">Bloques (coma)</label>
              <input value={form.blocks} onChange={e=>setForm(f=>({...f,blocks:e.target.value}))} className="w-full border rounded px-2 py-1" />
            </div>}
            {form.appliesTo==='property_types' && <div className="col-span-2">
              <label className="block text-xs font-medium mb-1">Tipos Propiedad (coma)</label>
              <input value={form.propertyTypes} onChange={e=>setForm(f=>({...f,propertyTypes:e.target.value}))} className="w-full border rounded px-2 py-1" />
            </div>}
            {form.appliesTo==='infractions' && <div className="col-span-2">
              <label className="block text-xs font-medium mb-1">Tipos Infracción (coma)</label>
              <input value={form.infractions} onChange={e=>setForm(f=>({...f,infractions:e.target.value}))} className="w-full border rounded px-2 py-1" />
            </div>}
          </section>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeDialog} className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded border">Cancelar</button>
            <button className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-500">{isEdit? 'Guardar Cambios':'Crear'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function buildScope(form){
  const appliesTo = form.appliesTo
  return {
    appliesTo,
    blocks: appliesTo==='blocks'? parseComma(form.blocks):[],
    propertyTypes: appliesTo==='property_types'? parseComma(form.propertyTypes):[],
    infractions: appliesTo==='infractions'? parseComma(form.infractions):[],
    selectionIds: []
  }
}
function parseComma(str){ return str.split(',').map(s=>s.trim()).filter(Boolean) }
