import { USE_MOCK } from '../../../services/apiConfig'
import { ENDPOINTS, normalizeCommonArea, serializeCommonArea } from '../../../services/apiConfig'
import { http } from '../../../services/httpClient'

// Mock dataset (podemos ampliar luego o mover a un seed central)
let mockCommonAreas = [
  {
    id: 1,
    code: 'AC-01',
    name: 'Salón Social',
    type: 'salon',
    capacity: 80,
    open_time: '08:00',
    close_time: '22:00',
    requires_approval: true,
    hourly_rate: 120,
    status: 'available',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    code: 'AC-02',
    name: 'Piscina',
    type: 'piscina',
    capacity: 40,
    open_time: '06:00',
    close_time: '20:00',
    requires_approval: false,
    hourly_rate: 0,
    status: 'maintenance',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]
let mockIdCounter = mockCommonAreas.length + 1

function generateCode(base = 'AC') {
  const next = String(mockIdCounter).padStart(2, '0')
  return `${base}-${next}`
}

export async function listCommonAreas({ page = 1, pageSize = 10, search = '', type = '', status = '' } = {}) {
  if (USE_MOCK) {
    let data = [...mockCommonAreas]
    if (search) {
      const s = search.toLowerCase()
      data = data.filter(a => a.name.toLowerCase().includes(s) || (a.code || '').toLowerCase().includes(s))
    }
    if (type) {
      data = data.filter(a => a.type === type)
    }
    if (status) {
      let normalized
      switch (status) {
        case 'disponible': normalized = 'available'; break
        case 'reservado': normalized = 'reserved'; break
        case 'mantenimiento': normalized = 'maintenance'; break
        default: normalized = status
      }
      data = data.filter(a => a.status === normalized)
    }
    const total = data.length
    const start = (page - 1) * pageSize
    const paginated = data.slice(start, start + pageSize)
    return {
      items: paginated.map(normalizeCommonArea),
      total,
      page,
      pageSize
    }
  }
  // Real API
  const params = new URLSearchParams()
  params.append('page', page)
  params.append('page_size', pageSize)
  if (search) params.append('search', search)
  if (type) params.append('type', type)
  if (status) params.append('status', status)
  const res = await http.get(`${ENDPOINTS.commonAreas.root}?${params.toString()}`)
  const results = Array.isArray(res.results) ? res.results : res.items || res.data || []
  const total = res.count ?? res.total ?? results.length
  return {
    items: results.map(normalizeCommonArea),
    total,
    page: Number(res.page) || page,
    pageSize: Number(res.page_size) || pageSize
  }
}

export async function createCommonArea(payload) {
  if (USE_MOCK) {
    const now = new Date().toISOString()
    const code = payload.code || generateCode('AC')
    const record = {
      id: mockIdCounter++,
      code,
      name: payload.name,
      type: payload.type,
      capacity: Number(payload.capacity) || 0,
      open_time: payload.openTime || '08:00',
      close_time: payload.closeTime || '18:00',
      requires_approval: !!payload.requiresApproval,
  hourly_rate: payload.hourlyRate != null && payload.hourlyRate !== '' ? Number(payload.hourlyRate) : 0,
  status: (payload.status === 'reservado' ? 'reserved' : (payload.status === 'mantenimiento' ? 'maintenance' : 'available')),
      created_at: now,
      updated_at: now
    }
    mockCommonAreas.push(record)
    return normalizeCommonArea(record)
  }
  const body = serializeCommonArea(payload)
  const res = await http.post(ENDPOINTS.commonAreas.root, body)
  return normalizeCommonArea(res)
}

export async function updateCommonArea(id, payload) {
  if (USE_MOCK) {
    const idx = mockCommonAreas.findIndex(a => a.id === id)
    if (idx === -1) throw new Error('Área no encontrada')
    const now = new Date().toISOString()
    mockCommonAreas[idx] = {
      ...mockCommonAreas[idx],
      name: payload.name,
      type: payload.type,
      capacity: Number(payload.capacity) || 0,
      open_time: payload.openTime || '08:00',
      close_time: payload.closeTime || '18:00',
      requires_approval: !!payload.requiresApproval,
  hourly_rate: payload.hourlyRate != null && payload.hourlyRate !== '' ? Number(payload.hourlyRate) : mockCommonAreas[idx].hourly_rate || 0,
  status: (payload.status === 'reservado' ? 'reserved' : (payload.status === 'mantenimiento' ? 'maintenance' : 'available')),
      updated_at: now
    }
    return normalizeCommonArea(mockCommonAreas[idx])
  }
  const body = serializeCommonArea(payload)
  const res = await http.put(ENDPOINTS.commonAreas.detail(id), body)
  return normalizeCommonArea(res)
}

export async function deleteCommonArea(id) {
  if (USE_MOCK) {
    mockCommonAreas = mockCommonAreas.filter(a => a.id !== id)
    return { success: true }
  }
  await http.delete(ENDPOINTS.commonAreas.detail(id))
  return { success: true }
}

export function extractCommonAreaError(err){
  if (!err) return 'Error desconocido'
  if (typeof err === 'string') return err
  if (err.response?.data) {
    const data = err.response.data
    if (typeof data === 'string') return data
    if (data.detail) return data.detail
    if (data.error) return data.error
    if (Array.isArray(data.errors)) return data.errors.join(', ')
  }
  return err.message || 'Error en la solicitud'
}
