import { useFinancialConceptsStore } from '../store/financialConceptsStore'
import { Loader2, Pencil, CalendarClock, Copy, Power, PowerOff, Trash2 } from 'lucide-react'

function StatusBadge({status,next}){
  let base='px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1'
  switch(status){
    case 'active': base+=' bg-green-100 text-green-700'; break
    case 'draft': base+=' bg-slate-200 text-slate-600'; break
    case 'scheduled': base+=' bg-indigo-100 text-indigo-700'; break
    case 'disabled': base+=' bg-amber-100 text-amber-700'; break
    case 'expired': base+=' bg-slate-300 text-slate-700'; break
    default: base+=' bg-slate-200 text-slate-600'
  }
  return <span className={base}>{status}{next && status==='active' && <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"/>}</span>
}

function CalculationCell({c, versioning}){
  if (!c) return <span className="text-slate-400">—</span>
  const next = versioning?.next
  const methodMap = { fixed:'Fijo', per_unit:'Por unidad', per_m2:'Por m²', formula:'Fórmula' }
  return (
    <div className="text-xs space-y-1">
      <div>
        {c.method==='fixed' && <span>${c.baseAmount.toFixed(2)}</span>}
        {c.method==='per_unit' && <span>{c.baseAmount.toFixed(2)} / unidad</span>}
        {c.method==='per_m2' && <span>{c.baseAmount.toFixed(2)} / m²</span>}
        {c.method==='formula' && <span className="italic text-indigo-700">ƒ Fórmula</span>}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{methodMap[c.method]}</div>
      {next && <div className="text-[10px] text-indigo-600">→ {next.baseAmount ? '$'+next.baseAmount.toFixed(2) : ''} {next.validFrom}</div>}
    </div>
  )
}

function ScopeCell({scope}){
  if (!scope) return null
  if (scope.appliesTo==='all') return <span className="text-xs">Todas</span>
  if (scope.appliesTo==='blocks') return <div className="text-xs max-w-[120px] line-clamp-2">{scope.blocks.join(', ')}</div>
  if (scope.appliesTo==='property_types') return <div className="text-xs max-w-[120px] line-clamp-2">{scope.propertyTypes.join(', ')}</div>
  if (scope.appliesTo==='infractions') return <div className="text-xs">Según infrac.</div>
  return <span className="text-xs">Selección</span>
}

export default function ConceptsTable(){
  const items = useFinancialConceptsStore(s=>s.items)
  const loading = useFinancialConceptsStore(s=>s.loading)
  const error = useFinancialConceptsStore(s=>s.error)
  const page = useFinancialConceptsStore(s=>s.page)
  const pageSize = useFinancialConceptsStore(s=>s.pageSize)
  const setPage = useFinancialConceptsStore(s=>s.setPage)

  const openDialog = useFinancialConceptsStore(s=>s.openDialog)
  const disable = useFinancialConceptsStore(s=>s.disable)
  const enable = useFinancialConceptsStore(s=>s.enable)
  const clone = useFinancialConceptsStore(s=>s.clone)
  const remove = useFinancialConceptsStore(s=>s.remove)

  return (
    <div className="border rounded overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Nombre</th>
              <th className="px-3 py-2 text-left font-semibold">Descripción</th>
              <th className="px-3 py-2 text-left font-semibold">Monto / Cálculo</th>
              <th className="px-3 py-2 text-left font-semibold">Periodicidad</th>
              <th className="px-3 py-2 text-left font-semibold">Aplica a</th>
              <th className="px-3 py-2 text-left font-semibold">Estado</th>
              <th className="px-3 py-2 text-left font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="py-8 text-center text-slate-500"><Loader2 className="w-5 h-5 animate-spin mx-auto"/></td></tr>}
            {!loading && error && <tr><td colSpan={7} className="py-6 text-center text-red-600">{error}</td></tr>}
            {!loading && !error && items.length===0 && <tr><td colSpan={7} className="py-6 text-center text-slate-500">Sin conceptos</td></tr>}
            {items.map(c => (
              <tr key={c.id} className="border-t align-top hover:bg-slate-50">
                <td className="px-3 py-2">
                  <div className="font-medium text-slate-800 line-clamp-1 max-w-[160px]">{c.name}</div>
                  <div className="text-[10px] text-slate-500">{c.code}</div>
                </td>
                <td className="px-3 py-2">
                  <div className="text-xs text-slate-600 max-w-[220px] line-clamp-2">{c.description}</div>
                </td>
                <td className="px-3 py-2"><CalculationCell c={c.calculation} versioning={c.versioning} /></td>
                <td className="px-3 py-2 text-xs capitalize">{c.periodicity==='one_time'?'Único': c.periodicity==='monthly'?'Mensual': c.periodicity==='quarterly'?'Trimestral': c.periodicity==='yearly'?'Anual': c.periodicity}</td>
                <td className="px-3 py-2"><ScopeCell scope={c.scope} /></td>
                <td className="px-3 py-2"><StatusBadge status={c.status} next={c.versioning?.next} /></td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    <button onClick={()=>openDialog('edit',c)} className="p-1 rounded hover:bg-slate-200" title="Editar"><Pencil className="w-4 h-4"/></button>
                    <button onClick={()=>openDialog('schedule',c)} className="p-1 rounded hover:bg-indigo-100 text-indigo-700" title="Programar versión"><CalendarClock className="w-4 h-4"/></button>
                    <button onClick={()=>clone(c.id)} className="p-1 rounded hover:bg-slate-200" title="Clonar"><Copy className="w-4 h-4"/></button>
                    {c.status!=='disabled' && <button onClick={()=>disable(c.id)} className="p-1 rounded hover:bg-amber-100 text-amber-700" title="Desactivar"><PowerOff className="w-4 h-4"/></button>}
                    {c.status==='disabled' && <button onClick={()=>enable(c.id)} className="p-1 rounded hover:bg-green-100 text-green-700" title="Activar"><Power className="w-4 h-4"/></button>}
                    {c.status==='draft' && <button onClick={()=>{ if(window.confirm('Eliminar borrador?')) remove(c.id) }} className="p-1 rounded hover:bg-red-100 text-red-600" title="Eliminar"><Trash2 className="w-4 h-4"/></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
