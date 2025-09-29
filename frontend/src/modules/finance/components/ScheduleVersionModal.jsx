import { useState, useEffect } from 'react'
import { useFinancialConceptsStore } from '../store/financialConceptsStore'

export default function ScheduleVersionModal(){
  const dialogOpen = useFinancialConceptsStore(s=>s.dialog.open)
  const mode = useFinancialConceptsStore(s=>s.dialog.mode)
  const editing = useFinancialConceptsStore(s=>s.dialog.editing)
  const closeDialog = useFinancialConceptsStore(s=>s.closeDialog)
  const schedule = useFinancialConceptsStore(s=>s.schedule)

  const isSchedule = mode==='schedule'

  const [form,setForm] = useState({ baseAmount:'', validFrom:'' })

  useEffect(()=>{
    if (isSchedule && editing){
      setForm({ baseAmount: editing.calculation.baseAmount, validFrom: '' })
    }
  },[isSchedule, editing])

  if (!dialogOpen || !isSchedule) return null

  const onSubmit = (e)=>{
    e.preventDefault()
    if(!form.validFrom) return
    schedule(editing.id, {
      calculation: { ...editing.calculation, baseAmount: Number(form.baseAmount) },
      validFrom: form.validFrom
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded shadow-lg">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="font-semibold text-slate-700 text-sm">Programar nueva versión</h2>
          <button onClick={closeDialog} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        <form onSubmit={onSubmit} className="p-4 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium mb-1">Monto Base</label>
            <input type="number" step="0.01" value={form.baseAmount} onChange={e=>setForm(f=>({...f,baseAmount:e.target.value}))} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Vigente Desde</label>
            <input type="date" value={form.validFrom} onChange={e=>setForm(f=>({...f,validFrom:e.target.value}))} required className="w-full border rounded px-2 py-1" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeDialog} className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded border">Cancelar</button>
            <button className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-500">Programar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
