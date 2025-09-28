import { USE_MOCK, ENDPOINTS, normalizeReservation, serializeReservation } from '../../../services/apiConfig'
import { http } from '../../../services/httpClient'

// ===== Mock Dataset =====
let mockReservations = [
  {
    id: 1,
    common_area_id: 1,
    date: new Date().toISOString().slice(0,10),
    start_time: '10:00',
    end_time: '12:00',
    status: 'approved',
    attendees: 20,
    notes: 'Reunión vecinos',
    reason: null,
    requested_by: 101,
    requester_name: 'Juan Pérez',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    hourly_rate_snapshot: 120,
    duration_hours: 2,
    total_amount: 240,
    currency: 'BOB',
    payment_required: true,
    payment_status: 'pending',
    paid_at: null
  },
  {
    id: 2,
    common_area_id: 1,
    date: new Date().toISOString().slice(0,10),
    start_time: '13:00',
    end_time: '14:30',
    status: 'pending',
    attendees: 10,
    notes: 'Cumpleaños',
    reason: null,
    requested_by: 102,
    requester_name: 'María López',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    hourly_rate_snapshot: null,
    duration_hours: null,
    total_amount: null,
    currency: 'BOB',
    payment_required: false,
    payment_status: 'none',
    paid_at: null
  }
]
let mockResId = mockReservations.length + 1

function timeToMinutes(t){
  if (!t) return 0
  const [h,m] = t.split(':').map(Number)
  return h*60 + m
}

function overlaps(aStart,aEnd,bStart,bEnd){
  return aStart < bEnd && bStart < aEnd
}

function validateOverlap({ areaId, date, startTime, endTime, excludeId }){
  const s = timeToMinutes(startTime)
  const e = timeToMinutes(endTime)
  for (const r of mockReservations){
    if (excludeId && r.id === excludeId) continue
    if (r.common_area_id !== areaId) continue
    if (r.date !== date) continue
    if (!['approved','pending'].includes(r.status)) continue
    const rs = timeToMinutes(r.start_time)
    const re = timeToMinutes(r.end_time)
    if (overlaps(s,e,rs,re)){
      throw new Error('Conflicto de horario con otra reserva (ID '+r.id+')')
    }
  }
}

export async function listReservations({ page=1, pageSize=10, status='', dateFrom='', dateTo='', search='' }={}){
  if (USE_MOCK){
    let data = [...mockReservations]
    if (status){
      let backStatus
      switch(status){
        case 'pendiente': backStatus='pending'; break
        case 'aprobada': backStatus='approved'; break
        case 'rechazada': backStatus='rejected'; break
        case 'cancelada': backStatus='cancelled'; break
        case 'expirada': backStatus='approved'; break // se filtrará después por fecha
        default: backStatus=status
      }
      data = data.filter(r => r.status === backStatus)
    }
    if (dateFrom){
      data = data.filter(r => r.date >= dateFrom)
    }
    if (dateTo){
      data = data.filter(r => r.date <= dateTo)
    }
    if (search){
      const s = search.toLowerCase()
      data = data.filter(r => (r.notes||'').toLowerCase().includes(s) || (r.requester_name||'').toLowerCase().includes(s))
    }
    // derivar expiradas para filtrado por 'expirada'
    const now = new Date()
    if (status === 'expirada'){
      data = data.filter(r => {
        if (r.status !== 'approved') return false
        const [y,m,d] = r.date.split('-').map(Number)
        const [eh,em] = r.end_time.split(':').map(Number)
        const endDate = new Date(y,m-1,d,eh,em)
        return endDate.getTime() < now.getTime()
      })
    }
    const total = data.length
    const start = (page-1)*pageSize
    const paginated = data.slice(start,start+pageSize)
    return { items: paginated.map(normalizeReservation), total, page, pageSize }
  }
  const params = new URLSearchParams()
  params.append('page',page)
  params.append('page_size',pageSize)
  if (status) params.append('status', status)
  if (dateFrom) params.append('date_from', dateFrom)
  if (dateTo) params.append('date_to', dateTo)
  if (search) params.append('search', search)
  const res = await http.get(`${ENDPOINTS.reservations.root}?${params.toString()}`)
  const results = res.results || res.items || []
  const total = res.count ?? res.total ?? results.length
  return { items: results.map(normalizeReservation), total, page, pageSize }
}

export async function createReservation(payload){
  if (USE_MOCK){
    const areaId = payload.areaId
    const date = payload.date
    const startTime = payload.startTime
    const endTime = payload.endTime
    if (!date || !startTime || !endTime) throw new Error('Datos incompletos')
    if (startTime >= endTime) throw new Error('La hora de inicio debe ser menor a la hora de fin')
    validateOverlap({ areaId, date, startTime, endTime })
    const now = new Date().toISOString()
    const record = {
      id: mockResId++,
      common_area_id: areaId,
      date,
      start_time: startTime,
      end_time: endTime,
      status: 'pending',
      attendees: payload.attendees ?? null,
      notes: payload.notes || '',
      reason: null,
      requested_by: payload.requestedBy ?? 0,
      requester_name: payload.requesterName || 'Desconocido',
      created_at: now,
      updated_at: now
    }
    mockReservations.push(record)
    return normalizeReservation(record)
  }
  const body = serializeReservation(payload)
  const res = await http.post(ENDPOINTS.reservations.root, body)
  return normalizeReservation(res)
}

export async function updateReservation(id, payload){
  if (USE_MOCK){
    const idx = mockReservations.findIndex(r => r.id === id)
    if (idx === -1) throw new Error('Reserva no encontrada')
    const current = mockReservations[idx]
    if (!['pending'].includes(current.status)){
      throw new Error('Solo reservas pendientes pueden editarse')
    }
    const startTime = payload.startTime ?? current.start_time
    const endTime = payload.endTime ?? current.end_time
    if (startTime >= endTime) throw new Error('La hora de inicio debe ser menor a la hora de fin')
    validateOverlap({ areaId: current.common_area_id, date: current.date, startTime, endTime, excludeId: id })
    const now = new Date().toISOString()
    mockReservations[idx] = {
      ...current,
      start_time: startTime,
      end_time: endTime,
      attendees: payload.attendees ?? current.attendees,
      notes: payload.notes ?? current.notes,
      updated_at: now
    }
    return normalizeReservation(mockReservations[idx])
  }
  const body = serializeReservation(payload)
  const res = await http.patch(ENDPOINTS.reservations.detail(id), body)
  return normalizeReservation(res)
}

export async function changeReservationStatus(id, newStatus, reason=''){
  if (USE_MOCK){
    const idx = mockReservations.findIndex(r => r.id === id)
    if (idx === -1) throw new Error('Reserva no encontrada')
    const allowed = ['approved','rejected','cancelled']
    let backend
    switch(newStatus){
      case 'aprobada': backend='approved'; break
      case 'rechazada': backend='rejected'; break
      case 'cancelada': backend='cancelled'; break
      default: throw new Error('Estado no permitido')
    }
    if (!allowed.includes(backend)) throw new Error('Transición inválida')
    const now = new Date().toISOString()
    let rec = { ...mockReservations[idx] }
    rec.status = backend
    rec.reason = reason || null
    rec.updated_at = now
    // On approval calculate payment snapshot if hourly rate exists
    if (backend === 'approved') {
      // Simular lectura de área común: para simplicidad asumimos tarifa fija 120 si common_area_id=1, sino 0
      const areaHourly = rec.common_area_id === 1 ? 120 : 0
      const durationMinutes = timeToMinutes(rec.end_time) - timeToMinutes(rec.start_time)
      const durationHours = durationMinutes/60
      const total = areaHourly > 0 ? +(areaHourly * durationHours).toFixed(2) : 0
      rec.hourly_rate_snapshot = areaHourly > 0 ? areaHourly : 0
      rec.duration_hours = +(durationHours.toFixed(2))
      rec.total_amount = total
      rec.currency = 'BOB'
      rec.payment_required = total > 0
      rec.payment_status = total > 0 ? 'pending' : 'none'
      rec.paid_at = null
    }
    mockReservations[idx] = rec
    return normalizeReservation(mockReservations[idx])
  }
  const payload = { status: newStatus, reason }
  const res = await http.post(ENDPOINTS.reservations.status(id), payload)
  return normalizeReservation(res)
}

export async function deleteReservation(id){
  if (USE_MOCK){
    mockReservations = mockReservations.filter(r => r.id !== id)
    return { success:true }
  }
  await http.delete(ENDPOINTS.reservations.detail(id))
  return { success:true }
}

export async function markReservationPaid(id){
  if (USE_MOCK){
    const idx = mockReservations.findIndex(r => r.id === id)
    if (idx === -1) throw new Error('Reserva no encontrada')
    const rec = { ...mockReservations[idx] }
    if (rec.payment_status !== 'pending' && rec.payment_status !== 'overdue'){
      throw new Error('Reserva no está pendiente de pago')
    }
    rec.payment_status = 'paid'
    rec.paid_at = new Date().toISOString()
    rec.updated_at = rec.paid_at
    mockReservations[idx] = rec
    return normalizeReservation(rec)
  }
  // Backend real podría tener endpoint dedicado /reservations/{id}/pay/
  const res = await http.post(`${ENDPOINTS.reservations.detail(id)}pay/`, {})
  return normalizeReservation(res)
}

export function extractReservationError(err){
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
