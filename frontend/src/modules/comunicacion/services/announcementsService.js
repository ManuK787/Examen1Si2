import { USE_MOCK, ENDPOINTS, normalizeAnnouncement, serializeAnnouncement, serializeAnnouncementAction } from '../../../services/apiConfig'
import { http } from '../../../services/httpClient'

// ===== Mock dataset =====
let mockAnnouncements = [
  {
    id: 1,
    title: 'Corte programado de agua',
    body: 'Mañana de 08:00 a 11:00 se realizará un mantenimiento en la red de agua. Por favor tomar previsiones.',
    plain_excerpt: 'Mañana de 08:00 a 11:00 se realizará...',
    status: 'published',
    priority: 'high',
    audience_type: 'all',
    audience_filters: null,
    publish_at: new Date(Date.now()-3600_000).toISOString(),
    published_at: new Date(Date.now()-3600_000).toISOString(),
    expires_at: null,
    tags: ['mantenimiento'],
    attachments: [],
    metrics: { total_recipients: 120, read_count: 15, read_ratio: 0.125 },
    author_id: 10,
    created_at: new Date(Date.now()-4000_000).toISOString(),
    updated_at: new Date(Date.now()-3500_000).toISOString()
  },
  {
    id: 2,
    title: 'Fiesta de la Comunidad',
    body: 'Este sábado tendremos un evento de integración a las 18:00 en el área social. Llevar algo para compartir.',
    plain_excerpt: 'Este sábado tendremos un evento de integración...',
    status: 'scheduled',
    priority: 'normal',
    audience_type: 'all',
    audience_filters: null,
    publish_at: new Date(Date.now()+ 3600_000).toISOString(),
    published_at: null,
    expires_at: null,
    tags: ['evento'],
    attachments: [],
    metrics: { total_recipients: 120, read_count: 0, read_ratio: 0 },
    author_id: 10,
    created_at: new Date(Date.now()-2000_000).toISOString(),
    updated_at: new Date(Date.now()-1500_000).toISOString()
  }
]
let mockAnnouncementId = mockAnnouncements.length + 1
// Track read receipts simple (announcement_id -> Set(userId))
const mockReads = new Map()

function applyAutoPublish(){
  const now = Date.now()
  mockAnnouncements.forEach(a => {
    if (a.status === 'scheduled' && a.publish_at && Date.parse(a.publish_at) <= now){
      a.status = 'published'
      a.published_at = new Date().toISOString()
      a.updated_at = a.published_at
    }
  })
}

export async function listAnnouncements({ page=1, pageSize=10, status='', priority='', search='', tag='' }={}){
  if (USE_MOCK){
    applyAutoPublish()
    let data = [...mockAnnouncements]
    if (status) data = data.filter(a => a.status === status)
    if (priority) data = data.filter(a => a.priority === priority)
    if (tag) data = data.filter(a => a.tags.includes(tag))
    if (search){
      const s = search.toLowerCase()
      data = data.filter(a => a.title.toLowerCase().includes(s) || a.body.toLowerCase().includes(s))
    }
    // Orden por created desc
    data.sort((a,b)=> Date.parse(b.created_at)-Date.parse(a.created_at))
    const total = data.length
    const start = (page-1)*pageSize
    const slice = data.slice(start, start+pageSize)
    return { items: slice.map(normalizeAnnouncement), total, page, pageSize }
  }
  const params = new URLSearchParams({ page:String(page), page_size:String(pageSize) })
  if (status) params.append('status', status)
  if (priority) params.append('priority', priority)
  if (tag) params.append('tag', tag)
  if (search) params.append('search', search)
  const res = await http.get(`${ENDPOINTS.announcements.root}?${params.toString()}`)
  const results = res.results || res.items || []
  const total = res.count ?? res.total ?? results.length
  return { items: results.map(normalizeAnnouncement), total, page, pageSize }
}

export async function getAnnouncement(id){
  if (USE_MOCK){
    applyAutoPublish()
    const found = mockAnnouncements.find(a=>a.id===id)
    if (!found) throw new Error('No encontrado')
    return normalizeAnnouncement(found)
  }
  const res = await http.get(ENDPOINTS.announcements.detail(id))
  return normalizeAnnouncement(res)
}

export async function createAnnouncement(data){
  if (USE_MOCK){
    if (!data.title) throw new Error('Título requerido')
    if (!data.body) throw new Error('Contenido requerido')
    const now = new Date().toISOString()
    const record = {
      id: mockAnnouncementId++,
      title: data.title,
      body: data.body,
      plain_excerpt: (data.body||'').slice(0,80),
      status: data.publishAt ? 'scheduled' : 'draft',
      priority: data.priority || 'normal',
      audience_type: data.audienceType || 'all',
      audience_filters: data.audienceFilters || null,
      publish_at: data.publishAt || null,
      published_at: null,
      expires_at: data.expiresAt || null,
      tags: data.tags || [],
      attachments: [],
      metrics: { total_recipients: 0, read_count: 0, read_ratio: 0 },
      author_id: 1,
      created_at: now,
      updated_at: now
    }
    mockAnnouncements.push(record)
    return normalizeAnnouncement(record)
  }
  const body = serializeAnnouncement(data)
  const res = await http.post(ENDPOINTS.announcements.root, body)
  return normalizeAnnouncement(res)
}

export async function updateAnnouncement(id, data){
  if (USE_MOCK){
    const idx = mockAnnouncements.findIndex(a=>a.id===id)
    if (idx === -1) throw new Error('No encontrado')
    const current = mockAnnouncements[idx]
    if (!['draft','scheduled'].includes(current.status)) throw new Error('Sólo borrador o programado editable')
    const now = new Date().toISOString()
    mockAnnouncements[idx] = {
      ...current,
      title: data.title ?? current.title,
      body: data.body ?? current.body,
      plain_excerpt: data.body ? data.body.slice(0,80) : current.plain_excerpt,
      priority: data.priority ?? current.priority,
      audience_type: data.audienceType ?? current.audience_type,
      audience_filters: data.audienceFilters ?? current.audience_filters,
      publish_at: data.publishAt ?? current.publish_at,
      expires_at: data.expiresAt ?? current.expires_at,
      tags: data.tags ?? current.tags,
      updated_at: now
    }
    return normalizeAnnouncement(mockAnnouncements[idx])
  }
  const body = serializeAnnouncement(data)
  const res = await http.patch(ENDPOINTS.announcements.detail(id), body)
  return normalizeAnnouncement(res)
}

export async function publishAnnouncement(id){
  if (USE_MOCK){
    const a = mockAnnouncements.find(a=>a.id===id)
    if (!a) throw new Error('No encontrado')
    if (a.status === 'published') return normalizeAnnouncement(a)
    a.status = 'published'
    a.published_at = new Date().toISOString()
    a.updated_at = a.published_at
    return normalizeAnnouncement(a)
  }
  const res = await http.post(ENDPOINTS.announcements.publish(id), serializeAnnouncementAction('publish'))
  return normalizeAnnouncement(res)
}

export async function scheduleAnnouncement(id, publishAt){
  if (USE_MOCK){
    const a = mockAnnouncements.find(a=>a.id===id)
    if (!a) throw new Error('No encontrado')
    if (!['draft','scheduled'].includes(a.status)) throw new Error('Solo draft/scheduled')
    a.status = 'scheduled'
    a.publish_at = publishAt
    a.updated_at = new Date().toISOString()
    return normalizeAnnouncement(a)
  }
  const res = await http.post(ENDPOINTS.announcements.schedule(id), serializeAnnouncementAction('schedule',{ publishAt }))
  return normalizeAnnouncement(res)
}

export async function archiveAnnouncement(id){
  if (USE_MOCK){
    const a = mockAnnouncements.find(a=>a.id===id)
    if (!a) throw new Error('No encontrado')
    if (a.status !== 'published') throw new Error('Sólo published archivable')
    a.status = 'archived'
    a.updated_at = new Date().toISOString()
    return normalizeAnnouncement(a)
  }
  const res = await http.post(ENDPOINTS.announcements.archive(id), serializeAnnouncementAction('archive'))
  return normalizeAnnouncement(res)
}

export async function cancelAnnouncement(id){
  if (USE_MOCK){
    const a = mockAnnouncements.find(a=>a.id===id)
    if (!a) throw new Error('No encontrado')
    if (!['draft','scheduled'].includes(a.status)) throw new Error('Sólo draft/scheduled cancelable')
    a.status = 'cancelled'
    a.updated_at = new Date().toISOString()
    return normalizeAnnouncement(a)
  }
  const res = await http.post(ENDPOINTS.announcements.cancel(id), serializeAnnouncementAction('cancel'))
  return normalizeAnnouncement(res)
}

export async function listActiveAnnouncements(){
  if (USE_MOCK){
    applyAutoPublish()
    const now = Date.now()
    let data = mockAnnouncements.filter(a => a.status === 'published' && (!a.expires_at || Date.parse(a.expires_at) >= now))
    // Orden priority > publish_at desc
    const weight = p => p === 'urgent' ? 3 : (p==='high'?2:1)
    data.sort((a,b)=>{
      const dw = weight(b.priority)-weight(a.priority)
      if (dw !== 0) return dw
      return Date.parse(b.published_at||b.publish_at||b.created_at) - Date.parse(a.published_at||a.publish_at||a.created_at)
    })
    return data.map(normalizeAnnouncement)
  }
  const res = await http.get(ENDPOINTS.announcements.active)
  return (res.results || res.items || res || []).map(normalizeAnnouncement)
}

export async function markAnnouncementRead(id, userId=0){
  if (USE_MOCK){
    if (!mockReads.has(id)) mockReads.set(id, new Set())
    mockReads.get(id).add(userId||1)
    return { success:true }
  }
  await http.post(ENDPOINTS.announcements.read(id), {})
  return { success:true }
}

export async function getUnreadCount(){
  if (USE_MOCK){
    // Mock simple: published count - reads del user 1
    const userId = 1
    applyAutoPublish()
    const now = Date.now()
    const published = mockAnnouncements.filter(a => a.status==='published' && (!a.expires_at || Date.parse(a.expires_at)>=now))
    const readSet = published.filter(a=> mockReads.get(a.id)?.has(userId))
    return { count: published.length - readSet.length }
  }
  const res = await http.get(ENDPOINTS.announcements.unreadCount)
  return { count: res.count ?? 0 }
}

export function extractAnnouncementError(err){
  if (!err) return 'Error desconocido'
  if (typeof err === 'string') return err
  if (err.response?.data){
    const d = err.response.data
    if (typeof d === 'string') return d
    if (d.detail) return d.detail
    if (d.error) return d.error
    if (Array.isArray(d.errors)) return d.errors.join(', ')
  }
  return err.message || 'Error en la solicitud'
}
