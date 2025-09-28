import { useAnnouncementsStore } from '../store/announcementsStore'
import { Loader2, Eye, Archive, Play, CalendarClock, XCircle, Pencil } from 'lucide-react'

function PriorityBadge({priority}){
  let cls = 'px-2 py-0.5 rounded-full text-xs font-medium'
  switch(priority){
    case 'urgent': cls+=' bg-red-600 text-white'; break
    case 'high': cls+=' bg-amber-500 text-white'; break
    default: cls+=' bg-slate-300 text-slate-700'
  }
  return <span className={cls}>{priority}</span>
}

function StatusBadge({status}){
  const map = {
    draft: 'Borrador',
    scheduled: 'Programado',
    published: 'Publicado',
    archived: 'Archivado',
    cancelled: 'Cancelado'
  }
  let base='px-2 py-0.5 rounded-full text-xs font-medium'
  switch(status){
    case 'draft': base+=' bg-slate-200 text-slate-600'; break
    case 'scheduled': base+=' bg-indigo-200 text-indigo-700'; break
    case 'published': base+=' bg-green-200 text-green-700'; break
    case 'archived': base+=' bg-slate-300 text-slate-600'; break
    case 'cancelled': base+=' bg-red-200 text-red-700'; break
    default: base+=' bg-slate-200 text-slate-600'
  }
  return <span className={base}>{map[status]||status}</span>
}

export default function AnnouncementsTable(){
  const items = useAnnouncementsStore(s=>s.items)
  const loading = useAnnouncementsStore(s=>s.loading)
  const error = useAnnouncementsStore(s=>s.error)
  const page = useAnnouncementsStore(s=>s.page)
  const pageSize = useAnnouncementsStore(s=>s.pageSize)
  const setPage = useAnnouncementsStore(s=>s.setPage)
  const openEdit = useAnnouncementsStore(s=>s.openEdit)
  const publish = useAnnouncementsStore(s=>s.publish)
  const schedule = useAnnouncementsStore(s=>s.schedule)
  const archive = useAnnouncementsStore(s=>s.archive)
  const cancel = useAnnouncementsStore(s=>s.cancel)

  const canPublish = a => a.status === 'draft'
  const canSchedule = a => a.status === 'draft'
  const canArchive = a => a.status === 'published'
  const canCancel = a => a.status === 'draft' || a.status === 'scheduled'
  const canEdit = a => a.status === 'draft' || a.status === 'scheduled'

  return (
    <div className="border rounded overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Título</th>
              <th className="px-3 py-2 text-left font-semibold">Estado</th>
              <th className="px-3 py-2 text-left font-semibold">Prioridad</th>
              <th className="px-3 py-2 text-left font-semibold">Publicación</th>
              <th className="px-3 py-2 text-left font-semibold">Métricas</th>
              <th className="px-3 py-2 text-left font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="py-8 text-center text-slate-500"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr>
            )}
            {!loading && error && (
              <tr><td colSpan={6} className="py-6 text-center text-red-600">{error}</td></tr>
            )}
            {!loading && !error && items.length===0 && (
              <tr><td colSpan={6} className="py-6 text-center text-slate-500">Sin comunicados</td></tr>
            )}
            {items.map(a => (
              <tr key={a.id} className="border-t hover:bg-slate-50">
                <td className="px-3 py-2 align-top">
                  <div className="font-medium text-slate-800 line-clamp-1 max-w-xs">{a.title}</div>
                  {a.excerpt && <div className="text-xs text-slate-500 line-clamp-2 max-w-sm">{a.excerpt}</div>}
                  {a.tags?.length>0 && <div className="mt-1 flex flex-wrap gap-1">{a.tags.slice(0,3).map(t=> <span key={t} className="px-1.5 py-0.5 bg-slate-200 text-[10px] rounded">{t}</span>)}{a.tags.length>3 && <span className="text-[10px] text-slate-500">+{a.tags.length-3}</span>}</div>}
                </td>
                <td className="px-3 py-2 align-top"><StatusBadge status={a.status} /></td>
                <td className="px-3 py-2 align-top"><PriorityBadge priority={a.priority} /></td>
                <td className="px-3 py-2 align-top text-xs">
                  {a.publishedAt ? <span className="text-green-700">{a.publishedAt.slice(0,16).replace('T',' ')}</span>
                    : (a.publishAt ? <span className="text-indigo-700">Prog: {a.publishAt.slice(0,16).replace('T',' ')}</span> : <span className="text-slate-500">—</span>)}
                </td>
                <td className="px-3 py-2 align-top text-xs">
                  {a.metrics ? (
                    <span>{a.metrics.read_count ?? 0}/{a.metrics.total_recipients ?? 0}</span>
                  ) : <span className="text-slate-400">—</span>}
                </td>
                <td className="px-3 py-2 align-top">
                  <div className="flex flex-wrap gap-1">
                    {canPublish(a) && <button onClick={()=>publish(a.id)} className="p-1 rounded hover:bg-green-100 text-green-700" title="Publicar"><Play className="w-4 h-4" /></button>}
                    {canSchedule(a) && <button onClick={()=>{
                      const dt = prompt('Fecha/hora publicación (YYYY-MM-DD HH:MM)')
                      if (dt){
                        const iso = dt.replace(' ','T')+':00'
                        schedule(a.id, iso)
                      }
                    }} className="p-1 rounded hover:bg-indigo-100 text-indigo-700" title="Programar"><CalendarClock className="w-4 h-4" /></button>}
                    {canArchive(a) && <button onClick={()=>archive(a.id)} className="p-1 rounded hover:bg-slate-200 text-slate-700" title="Archivar"><Archive className="w-4 h-4" /></button>}
                    {canCancel(a) && <button onClick={()=>cancel(a.id)} className="p-1 rounded hover:bg-red-100 text-red-600" title="Cancelar"><XCircle className="w-4 h-4" /></button>}
                    {canEdit(a) && <button onClick={()=>openEdit(a)} className="p-1 rounded hover:bg-slate-200" title="Editar"><Pencil className="w-4 h-4" /></button>}
                    <button className="p-1 rounded hover:bg-slate-200" title="Ver"><Eye className="w-4 h-4" /></button>
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
