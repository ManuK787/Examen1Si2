import { useState, useEffect } from 'react'
import { useReservationsStore } from '../store/reservationsStore'

export default function ReservationStatusDialog(){
  const { statusDialog, closeStatusDialog, changeStatus, loading, error } = useReservationsStore()
  const { open, target, action } = statusDialog
  const [reason, setReason] = useState('')

  useEffect(()=>{ if(open){ setReason('') } },[open])

  if (!open || !target) return null

  const actionLabel = action === 'aprobada' ? 'Aprobar' : action === 'rechazada' ? 'Rechazar' : 'Cancelar'
  const needsReason = action === 'rechazada'

  async function onConfirm(e){
    e.preventDefault()
    await changeStatus(target.id, action, reason.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
      <div className="bg-white w-full max-w-md rounded shadow border">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">{actionLabel} Reserva</h3>
          <button onClick={closeStatusDialog} className="text-slate-500 hover:text-slate-700 text-sm">✕</button>
        </div>
        {error && <div className="px-5 py-2 text-xs text-rose-600 bg-rose-50 border-b">{error}</div>}
        <form onSubmit={onConfirm} className="p-5 space-y-4">
          <p className="text-sm text-slate-600">Confirma que deseas <span className="font-medium">{actionLabel.toLowerCase()}</span> la reserva del <strong>{target.date}</strong> ({target.startTime} - {target.endTime}) para <strong>{target.requesterName || 'Residente'}</strong>.</p>
          {needsReason && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Motivo (requerido)</label>
              <textarea value={reason} onChange={e=>setReason(e.target.value)} className="border rounded px-2 py-1 text-sm min-h-[70px]"/>
              {!reason.trim() && <span className="text-[10px] text-rose-600">Ingresa un motivo</span>}
            </div>
          )}
          {action === 'cancelada' && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Motivo (opcional)</label>
              <textarea value={reason} onChange={e=>setReason(e.target.value)} className="border rounded px-2 py-1 text-sm min-h-[50px]"/>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={closeStatusDialog} className="px-3 py-1.5 text-xs border rounded hover:bg-slate-100">Cerrar</button>
            <button disabled={loading || (needsReason && !reason.trim())} className="px-3 py-1.5 text-xs rounded bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50">{actionLabel}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
