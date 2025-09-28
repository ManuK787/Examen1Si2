import { useState, useEffect } from 'react'
import { useAnnouncementsStore } from '../store/announcementsStore'

export default function AnnouncementModal(){
  // Select only the needed primitive pieces to avoid object identity churn
  const dialogOpen = useAnnouncementsStore(s=>s.dialog.open)
  const editing = useAnnouncementsStore(s=>s.dialog.editing)
  const closeDialog = useAnnouncementsStore(s=>s.closeDialog)
  const create = useAnnouncementsStore(s=>s.create)
  const update = useAnnouncementsStore(s=>s.update)

  const [form,setForm] = useState({
    title:'', body:'', excerpt:'', priority:'normal', tags:'', publishAt:''
  })
  useEffect(()=>{
    if (editing){
      setForm({
        title: editing.title||'',
        body: editing.body||'',
        excerpt: editing.excerpt||'',
        priority: editing.priority||'normal',
        tags: (editing.tags||[]).join(','),
        publishAt: editing.publishAt ? editing.publishAt.slice(0,16) : ''
      })
    } else if (open){
      setForm({title:'',body:'',excerpt:'',priority:'normal',tags:'', publishAt:''})
    }
  },[editing, open])

  if (!dialogOpen) return null

  const onSubmit = (e)=>{
    e.preventDefault()
    const payload = {
      title: form.title.trim(),
      body: form.body.trim(),
      excerpt: form.excerpt.trim(),
      priority: form.priority,
      tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean)
    }
    const scheduleIso = form.publishAt ? form.publishAt+':00' : null
    if (editing){
      update(editing.id, payload)
    } else {
      create(payload)
      if (scheduleIso){
        // schedule after create? simple flow: rely on user action later or extend store
      }
    }
    closeDialog()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded shadow-lg animate-in">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="font-semibold text-slate-700 text-sm">{editing? 'Editar comunicado' : 'Nuevo comunicado'}</h2>
          <button onClick={closeDialog} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        <form onSubmit={onSubmit} className="p-4 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Título</label>
            <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required className="w-full border rounded px-2 py-1" maxLength={160} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Resumen / Excerpt (opcional)</label>
            <input value={form.excerpt} onChange={e=>setForm(f=>({...f,excerpt:e.target.value}))} className="w-full border rounded px-2 py-1" maxLength={240} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Contenido</label>
            <textarea value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} rows={6} className="w-full border rounded px-2 py-1 font-mono" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Prioridad</label>
              <select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))} className="w-full border rounded px-2 py-1">
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tags (coma)</label>
              <input value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))} className="w-full border rounded px-2 py-1" placeholder="info, mantenimiento" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Programar publicación (YYYY-MM-DD HH:MM)</label>
              <input type="datetime-local" value={form.publishAt} onChange={e=>setForm(f=>({...f,publishAt:e.target.value}))} className="border rounded px-2 py-1" />
              <p className="text-[10px] text-slate-500 mt-1">Si se deja vacío permanecerá en borrador hasta publicar o programar.</p>
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={closeDialog} className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded border">Cancelar</button>
            <button className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-500">{editing? 'Guardar cambios':'Crear'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
