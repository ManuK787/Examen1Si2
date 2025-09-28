import { USE_MOCK, ENDPOINTS, normalizeMaintenanceTask, serializeMaintenanceTask, serializeMaintenanceTaskStatusChange } from '../../../services/apiConfig'
import { http } from '../../../services/httpClient'

// ===== Mock Dataset =====
let mockTasks = [
  {
    id: 1,
    title: 'Revisar luminaria pasillo B2',
    description: 'Foco intermitente en pasillo segundo piso bloque B2',
    priority: 'medium',
    status: 'pending',
    assignee_id: 201,
    assignee_name: 'Carlos Pérez',
    progress_percent: 0,
    due_date: new Date(Date.now()+ 86400000).toISOString().slice(0,10),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Cambiar bomba de agua',
    description: 'Baja presión en bloque A',
    priority: 'high',
    status: 'in_progress',
    assignee_id: 202,
    assignee_name: 'María Soto',
    progress_percent: 40,
    started_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]
let mockTaskId = mockTasks.length + 1

export async function listMaintenanceTasks({ page=1, pageSize=10, status='', priority='', assigneeId='', search='' }={}){
  if (USE_MOCK){
    let data = [...mockTasks]
    if (status){
      let backStatus
      switch(status){
        case 'pendiente': backStatus='pending'; break
        case 'en progreso': backStatus='in_progress'; break
        case 'completada': backStatus='done'; break
        case 'cancelada': backStatus='cancelled'; break
        default: backStatus = status
      }
      data = data.filter(t => t.status === backStatus)
    }
    if (priority){
      data = data.filter(t => t.priority === priority)
    }
    if (assigneeId){
      data = data.filter(t => String(t.assignee_id) === String(assigneeId))
    }
    if (search){
      const s = search.toLowerCase()
      data = data.filter(t => t.title.toLowerCase().includes(s) || (t.description||'').toLowerCase().includes(s))
    }
    const total = data.length
    const start = (page-1)*pageSize
    const paginated = data.slice(start,start+pageSize)
    return { items: paginated.map(normalizeMaintenanceTask), total, page, pageSize }
  }
  const params = new URLSearchParams()
  params.append('page',page)
  params.append('page_size',pageSize)
  if (status) params.append('status', status)
  if (priority) params.append('priority', priority)
  if (assigneeId) params.append('assignee_id', assigneeId)
  if (search) params.append('search', search)
  const res = await http.get(`${ENDPOINTS.maintenance.root}?${params.toString()}`)
  const results = res.results || res.items || []
  const total = res.count ?? res.total ?? results.length
  return { items: results.map(normalizeMaintenanceTask), total, page, pageSize }
}

export async function createMaintenanceTask(payload){
  if (USE_MOCK){
    if (!payload.title) throw new Error('Título requerido')
    if (!payload.assigneeId) throw new Error('Asignado requerido')
    const now = new Date().toISOString()
    const record = {
      id: mockTaskId++,
      title: payload.title,
      description: payload.description || '',
      priority: payload.priority || 'medium',
      status: 'pending',
      assignee_id: payload.assigneeId,
      assignee_name: payload.assigneeName || ('Usuario '+payload.assigneeId),
      progress_percent: 0,
      due_date: payload.dueDate || null,
      created_at: now,
      updated_at: now
    }
    mockTasks.push(record)
    return normalizeMaintenanceTask(record)
  }
  const body = serializeMaintenanceTask(payload)
  const res = await http.post(ENDPOINTS.maintenance.root, body)
  return normalizeMaintenanceTask(res)
}

export async function updateMaintenanceTask(id, payload){
  if (USE_MOCK){
    const idx = mockTasks.findIndex(t => t.id === id)
    if (idx === -1) throw new Error('Tarea no encontrada')
    const current = mockTasks[idx]
    if (current.status !== 'pending') throw new Error('Sólo tareas pendientes pueden editarse')
    const now = new Date().toISOString()
    mockTasks[idx] = {
      ...current,
      title: payload.title ?? current.title,
      description: payload.description ?? current.description,
      priority: payload.priority ?? current.priority,
      assignee_id: payload.assigneeId ?? current.assignee_id,
      assignee_name: payload.assigneeName ?? current.assignee_name,
      due_date: payload.dueDate ?? current.due_date,
      updated_at: now
    }
    return normalizeMaintenanceTask(mockTasks[idx])
  }
  const body = serializeMaintenanceTask(payload)
  const res = await http.patch(ENDPOINTS.maintenance.detail(id), body)
  return normalizeMaintenanceTask(res)
}

export async function changeMaintenanceTaskStatus(id, uiStatus, progressPercent=null, reason=''){
  if (USE_MOCK){
    const idx = mockTasks.findIndex(t => t.id === id)
    if (idx === -1) throw new Error('Tarea no encontrada')
    let backend
    switch(uiStatus){
      case 'pendiente': backend='pending'; break
      case 'en progreso': backend='in_progress'; break
      case 'completada': backend='done'; break
      case 'cancelada': backend='cancelled'; break
      default: throw new Error('Estado no permitido')
    }
    const current = mockTasks[idx]
    // Validaciones simples
    if (backend === 'in_progress' && current.status === 'pending'){
      current.started_at = current.started_at || new Date().toISOString()
    }
    if (backend === 'done' && current.status === 'pending'){
      // permitir atajo: set started y completed
      current.started_at = current.started_at || new Date().toISOString()
    }
    if (backend === 'done'){
      current.completed_at = new Date().toISOString()
      current.progress_percent = 100
    }
    if (backend === 'cancelled'){
      if (!reason) throw new Error('Se requiere motivo para cancelar')
      current.cancellation_reason = reason
    }
    if (progressPercent != null && backend === 'in_progress'){
      current.progress_percent = Math.min(100, Math.max(0, Number(progressPercent)))
    }
    current.status = backend
    current.updated_at = new Date().toISOString()
    mockTasks[idx] = current
    return normalizeMaintenanceTask(current)
  }
  // Real backend
  // Map UI status (in Spanish) to backend raw expected values
  let backendStatus
  switch(uiStatus){
    case 'pendiente': backendStatus = 'pending'; break
    case 'en progreso': backendStatus = 'in_progress'; break
    case 'completada': backendStatus = 'done'; break
    case 'cancelada': backendStatus = 'cancelled'; break
    default: backendStatus = uiStatus // assume already raw
  }
  const payload = serializeMaintenanceTaskStatusChange({ status: backendStatus, progressPercent, reason })
  const res = await http.post(ENDPOINTS.maintenance.status(id), payload)
  return normalizeMaintenanceTask(res)
}

export async function deleteMaintenanceTask(id){
  if (USE_MOCK){
    mockTasks = mockTasks.filter(t => t.id !== id)
    return { success:true }
  }
  await http.delete(ENDPOINTS.maintenance.detail(id))
  return { success:true }
}

export function extractMaintenanceTaskError(err){
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
