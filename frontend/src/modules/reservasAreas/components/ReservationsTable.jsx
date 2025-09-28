import { useReservationsStore } from '../store/reservationsStore'
import { useEffect } from 'react'
import { CheckCircle2, XCircle, Ban, Loader2, DollarSign } from 'lucide-react'

function StatusBadge({ status }){
  const map = {
    pendiente: 'bg-amber-100 text-amber-700 border-amber-300',
    aprobada: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    rechazada: 'bg-rose-100 text-rose-700 border-rose-300',
    cancelada: 'bg-slate-200 text-slate-700 border-slate-300',
    expirada: 'bg-gray-100 text-gray-600 border-gray-300'
  }
  return <span className={`inline-block text-[11px] px-2 py-0.5 rounded border font-medium ${map[status]||'bg-slate-100'}`}>{status}</span>
}

function PaymentBadge({ paymentStatus }){
  const map = {
    none: 'bg-slate-200 text-slate-600 border-slate-300',
    pending: 'bg-amber-100 text-amber-700 border-amber-300',
    overdue: 'bg-red-100 text-red-600 border-red-300',
    paid: 'bg-emerald-100 text-emerald-700 border-emerald-300'
  }
  const labelMap = { none: '—', pending: 'pendiente', paid: 'pagado', overdue: 'vencido' }
  return <span className={`inline-block text-[11px] px-2 py-0.5 rounded border font-medium ${map[paymentStatus]||'bg-slate-100'}`}>{labelMap[paymentStatus]||paymentStatus}</span>
}

export default function ReservationsTable(){
  const { items, fetch, loading, error, page, pageSize, total, setPage, openEdit, openStatusDialog, markPaid } = useReservationsStore()

  useEffect(()=>{ fetch() },[]) // eslint-disable-line

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="bg-white rounded border shadow-sm overflow-hidden">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Reservas</h3>
        {loading && <Loader2 className="animate-spin" size={18}/>}
      </div>
      {error && <div className="p-3 text-xs text-rose-600 bg-rose-50 border-b">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Fecha</th>
              <th className="text-left px-3 py-2 font-medium">Horario</th>
              <th className="text-left px-3 py-2 font-medium">Área</th>
              <th className="text-left px-3 py-2 font-medium">Solicitante</th>
              <th className="text-left px-3 py-2 font-medium">Estado</th>
              <th className="text-left px-3 py-2 font-medium">Monto</th>
              <th className="text-left px-3 py-2 font-medium">Pago</th>
              <th className="text-left px-3 py-2 font-medium">Notas</th>
              <th className="text-right px-3 py-2 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(r => (
              <tr key={r.id} className="border-t hover:bg-slate-50">
                <td className="px-3 py-2 whitespace-nowrap">{r.date}</td>
                <td className="px-3 py-2 text-slate-600">{r.startTime} - {r.endTime}</td>
                <td className="px-3 py-2">{r.areaName || `Área ${r.areaId}`}</td>
                <td className="px-3 py-2">{r.requesterName || r.requestedBy}</td>
                <td className="px-3 py-2"><StatusBadge status={r.status}/></td>
                <td className="px-3 py-2 whitespace-nowrap">{r.totalAmount != null ? (r.totalAmount > 0 ? `Bs ${r.totalAmount.toFixed(2)}` : '—') : '—'}</td>
                <td className="px-3 py-2"><PaymentBadge paymentStatus={r.paymentStatus}/></td>
                <td className="px-3 py-2 max-w-[180px] truncate" title={r.notes}>{r.notes || '-'}</td>
                <td className="px-3 py-2 text-right">
                  <div className="inline-flex items-center gap-2">
                    {r.status === 'pendiente' && (
                      <>
                        <button onClick={()=>openStatusDialog(r,'aprobada')} className="p-1 rounded hover:bg-emerald-50 text-emerald-600" title="Aprobar"><CheckCircle2 size={16}/></button>
                        <button onClick={()=>openStatusDialog(r,'rechazada')} className="p-1 rounded hover:bg-rose-50 text-rose-600" title="Rechazar"><XCircle size={16}/></button>
                      </>
                    )}
                    {r.status === 'aprobada' && (
                      <button onClick={()=>openStatusDialog(r,'cancelada')} className="p-1 rounded hover:bg-slate-100 text-slate-600" title="Cancelar"><Ban size={16}/></button>
                    )}
                    {r.status === 'aprobada' && ['pending','overdue'].includes(r.paymentStatus) && (
                      <button onClick={()=>markPaid(r.id)} className="p-1 rounded hover:bg-emerald-50 text-emerald-600" title="Marcar pagado"><DollarSign size={16}/></button>
                    )}
                    {r.status === 'pendiente' && (
                      <button onClick={()=>openEdit(r)} className="text-xs px-2 py-1 border rounded hover:bg-slate-100">Editar</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-xs text-slate-500">Sin resultados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-3 border-t flex items-center justify-between text-xs text-slate-600 bg-slate-50">
        <span>Página {page} de {totalPages}</span>
        <div className="flex gap-1">
          <button disabled={page<=1} onClick={()=>setPage(page-1)} className="px-2 py-1 border rounded disabled:opacity-40">Prev</button>
          <button disabled={page>=totalPages} onClick={()=>setPage(page+1)} className="px-2 py-1 border rounded disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  )
}
