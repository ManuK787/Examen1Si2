// Central API configuration and feature flags
// Toggle mocks globally here. When backend is ready, set USE_MOCK=false (or via env VITE_USE_MOCK=false)

export const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'true') === 'true'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Centralized endpoint map (avoid hardcoding across services)
export const ENDPOINTS = {
  auth: {
    login: '/auth/login/',
    register: '/auth/register/',
    me: '/auth/me/',
    logout: '/auth/logout/',
    refresh: '/auth/refresh/',
    changePassword: '/auth/change-password/'
  },
  users: {
    root: '/users/', // list + create
    detail: (id) => `/users/${id}/`,
    status: (id) => `/users/${id}/status/` // optional specialized endpoint
  },
  roles: {
    root: '/roles/',
    detail: (id) => `/roles/${id}/`,
    permissionsMatrix: '/permissions/matrix/'
  },
  vehicles: {
    root: '/vehicles/',
    detail: (id) => `/vehicles/${id}/`,
    colors: '/vehicles/colors/' // opcional, si el backend lo ofrece
  },
  properties: {
    root: '/properties/', // list + create
    detail: (id) => `/properties/${id}/`,
    stats: '/properties/stats/' // opcional para KPIs futuras
  },
  commonAreas: {
    root: '/common-areas/', // list + create
    detail: (id) => `/common-areas/${id}/`,
    availability: (id) => `/common-areas/${id}/availability/`, // opcional para consultar slots
    reservations: (id) => `/common-areas/${id}/reservations/` // opcional para listar/crear reservas directas
  },
  reservations: {
    root: '/reservations/', // list + create
    detail: (id) => `/reservations/${id}/`,
    status: (id) => `/reservations/${id}/status/`,
    calendar: '/reservations/calendar/' // opcional futuro (rango)
  },
  maintenance: {
    root: '/maintenance-tasks/',
    detail: (id) => `/maintenance-tasks/${id}/`,
    status: (id) => `/maintenance-tasks/${id}/status/`
  },
  announcements: {
    root: '/announcements/', // list + create
    detail: (id) => `/announcements/${id}/`,
    publish: (id) => `/announcements/${id}/publish/`,
    schedule: (id) => `/announcements/${id}/schedule/`,
    archive: (id) => `/announcements/${id}/archive/`,
    cancel: (id) => `/announcements/${id}/cancel/`,
    read: (id) => `/announcements/${id}/read/`,
    metrics: (id) => `/announcements/${id}/metrics/`,
    active: '/announcements/active/',
    unreadCount: '/announcements/unread-count/'
  }
}

// Timeouts (ms)
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT || 15000)

// Normalizers isolate backend shape from UI
export function normalizeUser(raw) {
  if (!raw) return null
  return {
    id: raw.id,
    fullName: raw.full_name ?? raw.fullName ?? '',
    email: raw.email,
    phone: raw.phone || '',
    ci: raw.ci || raw.identity_number || '',
    bloque: raw.block ?? raw.bloque ?? null,
    casa: raw.house_number ?? raw.casa ?? null,
    residencyType: raw.residency_type ?? raw.residencyType ?? null,
    role: raw.role_name ?? raw.role ?? 'Residente',
    status: raw.status === 'inactive' ? 'Inactivo' : (raw.status === 'active' ? 'Activo' : (raw.status || 'Activo')),
    registeredAt: raw.created_at ?? raw.registeredAt ?? new Date().toISOString(),
    lastAccessAt: raw.last_access_at ?? raw.lastAccessAt ?? null
  }
}

export function serializeUser(data) {
  // Accepts form data from UI and converts to backend expected shape
  return {
    full_name: data.fullName,
    email: data.email,
    phone: data.phone || null,
    ci: data.ci || null,
    block: data.bloque || null,
    house_number: data.casa || null,
    residency_type: data.residencyType || null,
    role_name: data.role,
    status: data.status === 'Inactivo' ? 'inactive' : 'active'
  }
}

export function normalizeRole(raw) {
  if (!raw) return null
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description || '',
    permissions: raw.permissions || [],
    usersCount: raw.users_count ?? raw.usersCount ?? 0
  }
}

// Normalizador de vehículos (para desacoplar backend de UI)
export function normalizeVehicle(raw) {
  if (!raw) return null
  return {
    id: raw.id,
    plate: raw.plate || raw.plate_number || '',
    brand: raw.brand || '',
    model: raw.model || '',
    color: (raw.color || '').toLowerCase(),
    ownerUserId: raw.owner_user_id ?? raw.ownerUserId ?? null,
    ownerName: raw.owner_name ?? raw.ownerName ?? '',
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updated_at || raw.updatedAt || raw.created_at || new Date().toISOString()
  }
}

// Normalizador de propiedades para desacoplar shape del backend
export function normalizeProperty(raw){
  if (!raw) return null
  // Backend podría usar snake_case; UI usa camelCase
  const block = raw.block?.toLowerCase?.() || raw.block || ''
  let number = raw.number ?? raw.house_number ?? raw.houseNumber ?? ''
  number = typeof number === 'number' ? String(number).padStart(2,'0') : String(number).padStart(2,'0')
  const landSize = raw.land_size_m2 ?? raw.landSizeM2 ?? raw.area_m2 ?? raw.area ?? 0
  const capacity = raw.capacity ?? raw.max_capacity ?? 0
  const statusRaw = raw.occupancy_status ?? raw.occupancyStatus ?? raw.status
  const status = statusRaw === 'occupied' ? 'ocupado' : (statusRaw === 'free' ? 'libre' : (statusRaw || 'libre'))
  return {
    id: raw.id,
    block,
    number,
    code: block && number ? `${block}-${number}` : '',
    ownerName: raw.owner_name ?? raw.ownerName ?? '',
    landSizeM2: Number(landSize) || 0,
    capacity: Number(capacity) || 0,
    occupancyStatus: status,
    createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updated_at ?? raw.updatedAt ?? raw.created_at ?? new Date().toISOString()
  }
}

// Normalizador de áreas comunes
export function normalizeCommonArea(raw){
  if (!raw) return null
  const statusRaw = raw.status ?? raw.state
  // Backend esperado: 'available' | 'reserved' | 'maintenance'
  let status
  switch (statusRaw) {
    case 'available':
    case 'disponible':
      status = 'disponible'; break
    case 'reserved':
    case 'reservado':
      status = 'reservado'; break
    case 'maintenance':
    case 'mantenimiento':
      status = 'mantenimiento'; break
    default:
      status = 'disponible'
  }
  const requiresApproval = raw.requires_approval ?? raw.requiresApproval ?? false
  const openTime = raw.open_time ?? raw.openTime ?? '08:00'
  const closeTime = raw.close_time ?? raw.closeTime ?? '18:00'
  return {
    id: raw.id,
    code: raw.code ?? raw.codigo ?? '',
    name: raw.name ?? raw.nombre ?? '',
    type: raw.type ?? raw.area_type ?? raw.tipo ?? '',
    capacity: Number(raw.capacity ?? raw.capacidad ?? 0) || 0,
    openTime,
    closeTime,
    requiresApproval: Boolean(requiresApproval),
    hourlyRate: raw.hourly_rate != null ? Number(raw.hourly_rate) : (raw.hourlyRate != null ? Number(raw.hourlyRate) : null),
    status,
    createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updated_at ?? raw.updatedAt ?? raw.created_at ?? new Date().toISOString()
  }
}

export function serializeCommonArea(data){
  let backendStatus
  switch (data.status) {
    case 'reservado': backendStatus = 'reserved'; break
    case 'mantenimiento': backendStatus = 'maintenance'; break
    case 'disponible':
    default:
      backendStatus = 'available'
  }
  return {
    code: data.code || undefined, // puede autogenerarse en backend si se omite
    name: data.name,
    type: data.type,
    capacity: Number(data.capacity),
    open_time: data.openTime,
    close_time: data.closeTime,
    requires_approval: !!data.requiresApproval,
    hourly_rate: data.hourlyRate != null && data.hourlyRate !== '' ? Number(data.hourlyRate) : 0,
    status: backendStatus
  }
}

// ==================== Reservations Normalization ====================
export function normalizeReservation(raw){
  if (!raw) return null
  const statusRaw = raw.status
  let status
  switch (statusRaw) {
    case 'pending': status = 'pendiente'; break
    case 'approved': status = 'aprobada'; break
    case 'rejected': status = 'rechazada'; break
    case 'cancelled': status = 'cancelada'; break
    default: status = statusRaw || 'pendiente'
  }
  // Derivar expirada: si approved y la fecha/tiempo ya pasó (lo haremos también en store)
  try {
    const today = new Date()
    if (status === 'aprobada') {
      const dateStr = raw.date || raw.reservation_date
      if (dateStr) {
        const [y,m,d] = dateStr.split('-').map(Number)
        const endTime = (raw.end_time || raw.endTime || '00:00')
        const [hh,mm] = endTime.split(':').map(Number)
        const endDate = new Date(y, m-1, d, hh, mm)
        if (endDate.getTime() < today.getTime()) {
          status = 'expirada'
        }
      }
    }
  } catch (_) {
    // silencioso
  }
  const date = raw.date || raw.reservation_date || ''
  return {
    id: raw.id,
    areaId: raw.common_area_id ?? raw.area_id ?? raw.commonAreaId ?? null,
    areaName: raw.area_name ?? raw.areaName ?? raw.area?.name ?? '',
    areaType: raw.area_type ?? raw.areaType ?? raw.area?.type ?? '',
    date,
    startTime: raw.start_time ?? raw.startTime ?? '',
    endTime: raw.end_time ?? raw.endTime ?? '',
    status,
    attendees: raw.attendees ?? null,
    notes: raw.notes ?? '',
    reason: raw.reason ?? null,
    requestedBy: raw.requested_by ?? raw.requestedBy ?? raw.user_id ?? null,
    requesterName: raw.requester_name ?? raw.requesterName ?? raw.user_name ?? '',
    createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updated_at ?? raw.updatedAt ?? raw.created_at ?? new Date().toISOString(),
    hourlyRateSnapshot: raw.hourly_rate_snapshot != null ? Number(raw.hourly_rate_snapshot) : (raw.hourlyRateSnapshot != null ? Number(raw.hourlyRateSnapshot) : null),
    durationHours: raw.duration_hours != null ? Number(raw.duration_hours) : (raw.durationHours != null ? Number(raw.durationHours) : null),
    totalAmount: raw.total_amount != null ? Number(raw.total_amount) : (raw.totalAmount != null ? Number(raw.totalAmount) : null),
    currency: raw.currency ?? raw.moneda ?? (raw.total_amount != null ? 'BOB' : null),
    paymentRequired: raw.payment_required != null ? Boolean(raw.payment_required) : (raw.paymentRequired != null ? Boolean(raw.paymentRequired) : ( (raw.total_amount ?? 0) > 0)),
    paymentStatus: (()=>{
      const ps = raw.payment_status ?? raw.paymentStatus
      switch(ps){
        case 'pending': return 'pending'
        case 'paid': return 'paid'
        case 'overdue': return 'overdue'
        case 'none': return 'none'
        default:
          if ((raw.total_amount ?? raw.totalAmount ?? 0) > 0) return 'pending'
          return 'none'
      }
    })(),
    paidAt: raw.paid_at ?? raw.paidAt ?? null
  }
}

export function serializeReservation(data){
  let backendStatus
  switch (data.status) {
    case 'aprobada': backendStatus = 'approved'; break
    case 'rechazada': backendStatus = 'rejected'; break
    case 'cancelada': backendStatus = 'cancelled'; break
    case 'pendiente': backendStatus = 'pending'; break
    default: backendStatus = undefined // el backend decidirá si se omite
  }
  return {
    common_area_id: data.areaId,
    date: data.date,
    start_time: data.startTime,
    end_time: data.endTime,
    attendees: data.attendees ?? undefined,
    notes: data.notes || undefined,
    requested_by: data.requestedBy ?? undefined,
    status: backendStatus,
    // Payment fields are controlled by backend on approval; we only send if explicitly editing (rare)
    payment_status: data.paymentStatus && ['pending','paid','overdue','none'].includes(data.paymentStatus) ? data.paymentStatus : undefined
  }
}

// ==================== Maintenance Tasks (Simple) ====================
export function normalizeMaintenanceTask(raw){
  if (!raw) return null
  const statusRaw = raw.status
  let status
  switch(statusRaw){
    case 'pending': status = 'pendiente'; break
    case 'in_progress': status = 'en progreso'; break
    case 'done': status = 'completada'; break
    case 'cancelled': status = 'cancelada'; break
    default: status = 'pendiente'
  }
  return {
    id: raw.id,
    title: raw.title ?? '',
    description: raw.description ?? '',
    priority: raw.priority ?? 'medium',
    status,
    assigneeId: raw.assignee_id ?? null,
    assigneeName: raw.assignee_name ?? '',
    progressPercent: raw.progress_percent != null ? Number(raw.progress_percent) : (raw.progressPercent != null ? Number(raw.progressPercent) : 0),
    dueDate: raw.due_date ?? raw.dueDate ?? null,
    startedAt: raw.started_at ?? raw.startedAt ?? null,
    completedAt: raw.completed_at ?? raw.completedAt ?? null,
    cancellationReason: raw.cancellation_reason ?? raw.cancellationReason ?? null,
    createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updated_at ?? raw.updatedAt ?? raw.created_at ?? new Date().toISOString()
  }
}

export function serializeMaintenanceTask(data){
  return {
    title: data.title,
    description: data.description || '',
    priority: data.priority || 'medium',
    assignee_id: data.assigneeId,
    due_date: data.dueDate || null
  }
}

export function serializeMaintenanceTaskStatusChange(data){
  return {
    status: data.status, // expected backend raw value: pending|in_progress|done|cancelled
    progress_percent: data.progressPercent != null ? data.progressPercent : undefined,
    reason: data.reason || undefined
  }
}

// ==================== Announcements ====================
export function normalizeAnnouncement(raw){
  if(!raw) return null
  return {
    id: raw.id,
    title: raw.title || '',
    body: raw.body ?? raw.content ?? '',
    excerpt: raw.plain_excerpt ?? raw.excerpt ?? '',
    status: raw.status || 'draft', // draft|scheduled|published|archived|cancelled
    priority: raw.priority || 'normal', // normal|high|urgent
    audienceType: raw.audience_type ?? 'all',
    audienceFilters: raw.audience_filters ?? null,
    publishAt: raw.publish_at ?? null,
    publishedAt: raw.published_at ?? null,
    expiresAt: raw.expires_at ?? null,
    tags: raw.tags || [],
    attachments: raw.attachments || [],
    metrics: raw.metrics || null,
    isRead: raw.is_read ?? false,
    authorId: raw.author_id ?? null,
    createdAt: raw.created_at ?? new Date().toISOString(),
    updatedAt: raw.updated_at ?? raw.created_at ?? new Date().toISOString()
  }
}

export function serializeAnnouncement(data){
  return {
    title: data.title,
    body: data.body,
    priority: data.priority || 'normal',
    audience_type: data.audienceType || 'all',
    audience_filters: data.audienceFilters || null,
    publish_at: data.publishAt || null,
    expires_at: data.expiresAt || null,
    tags: data.tags || [],
    attachments: data.attachments || []
  }
}

export function serializeAnnouncementAction(action, payload={}){
  switch(action){
    case 'publish':
      return { force: !!payload.force }
    case 'schedule':
      return { publish_at: payload.publishAt }
    case 'archive':
    case 'cancel':
      return {}
    default:
      return payload
  }
}
