// vehiclesService (mock + preparado para backend futuro)
// Cuando se integre backend, seguir patrón de usersService con USE_MOCK toggle.

import { USE_MOCK, ENDPOINTS, normalizeVehicle } from '../../../services/apiConfig'
import { http } from '../../../services/httpClient'

const delay = (ms=400)=> new Promise(r=>setTimeout(r,ms))

// Dataset mock
const BRANDS = ['Toyota','Nissan','Ford','Hyundai','Chevrolet','Kia','Suzuki']
const MODELS = ['Corolla','Sentra','Focus','Elantra','Onix','Rio','Swift']
const COLORS = ['blanco','negro','rojo','azul','plata','gris']

let vehicles = Array.from({ length: 34 }).map((_,i)=>{
  const brand = BRANDS[i % BRANDS.length]
  const model = MODELS[i % MODELS.length]
  const color = COLORS[i % COLORS.length]
  // Generar ya en nuevo formato: 3 o 4 números + 3 letras. Alternamos longitud.
  const num = (100 + i).toString().padStart(3,'0')
  const baseNum = (i % 2 === 0) ? num : (1000 + i).toString().slice(0,4)
  const letters = 'ABC' // fijo simple para mock
  const plate = `${baseNum}${letters}`
  return {
    id: 'v'+(i+1),
    plate,
    brand,
    model,
    color,
    ownerUserId: 'u'+((i%10)+1), // referencia mock
    ownerName: `Usuario ${(i%10)+1}`,
    createdAt: new Date(Date.now()- i*86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
})

function normalizePlate(p){
  return p.trim().toUpperCase().replace(/\s+/g,'')
}

// Conversión legacy -> nuevo formato
// ABC123  => 123ABC
// ABC-1234 => 1234ABC
function migrateLegacyPlate(plate){
  if (!plate) return plate
  const up = plate.toUpperCase()
  const legacyMatch = up.match(/^([A-Z]{3})-?(\d{3,4})$/)
  if (legacyMatch){
    const letters = legacyMatch[1]
    const numbers = legacyMatch[2]
    return numbers + letters
  }
  return plate
}

// Ejecutar migración inicial (idempotente)
vehicles = vehicles.map(v=> ({ ...v, plate: migrateLegacyPlate(v.plate) }))

function applyFilters(list,{ search='', color='ALL' }){
  return list.filter(v=>{
    if (search){
      const s = search.toLowerCase()
      if(!(v.plate.toLowerCase().includes(s) || v.brand.toLowerCase().includes(s) || v.model.toLowerCase().includes(s) || v.ownerName.toLowerCase().includes(s))) return false
    }
    if (color !== 'ALL' && v.color !== color) return false
    return true
  })
}

// Utilidad simple para obtener mensaje legible desde distintas formas de error backend
function extractErrorMessage(e){
  if (!e) return 'Error desconocido'
  if (typeof e === 'string') return e
  if (e.info){
    const i = e.info
    return i.detail || i.message || i.error || JSON.stringify(i)
  }
  return e.message || 'Error'
}

export const vehiclesService = {
  async listVehicles(params={}) {
    const { page=1, pageSize=10, search='', color='ALL' } = params
    if (USE_MOCK){
      await delay(300)
      const filtered = applyFilters(vehicles,{ search, color })
      const total = filtered.length
      const start = (page-1)*pageSize
      const slice = filtered.slice(start,start+pageSize)
      return { vehicles: slice, total, page, pageSize }
    }
    const qs = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      ...(search? { search } : {}),
      ...(color !== 'ALL' ? { color } : {})
    })
    const data = await http.get(`${ENDPOINTS.vehicles.root}?${qs.toString()}`)
    const list = (data?.results || data?.vehicles || data || []).map(normalizeVehicle)
    const total = data?.count ?? data?.total ?? list.length
    return { vehicles: list, total, page, pageSize }
  },
  async createVehicle(data){
    if (USE_MOCK){
      await delay(400)
      let plate = normalizePlate(data.plate)
      plate = migrateLegacyPlate(plate)
      if (vehicles.some(v=>v.plate === plate)) throw new Error('La placa ya está registrada')
      const id = 'v'+(vehicles.length+1)
      const now = new Date().toISOString()
      const vehicle = { id, plate, brand:data.brand.trim(), model:data.model.trim(), color:data.color.toLowerCase(), ownerUserId:data.ownerUserId, ownerName:data.ownerName, createdAt: now, updatedAt: now }
      vehicles.unshift(vehicle)
      return { vehicle }
    }
    try {
      const payload = { ...data, plate: normalizePlate(data.plate) }
      const res = await http.post(ENDPOINTS.vehicles.root, payload)
      const raw = res?.vehicle || res
      return { vehicle: normalizeVehicle(raw) }
    } catch(e){
      throw new Error(extractErrorMessage(e))
    }
  },
  async updateVehicle(id,data){
    if (USE_MOCK){
      await delay(400)
      const plate = data.plate ? migrateLegacyPlate(normalizePlate(data.plate)) : undefined
      if (plate && vehicles.some(v=>v.plate === plate && v.id !== id)) throw new Error('La placa ya está registrada')
      vehicles = vehicles.map(v=> v.id === id ? { ...v, ...data, ...(plate?{plate}:{ }), color: data.color? data.color.toLowerCase(): v.color, updatedAt: new Date().toISOString() } : v)
      return { vehicle: vehicles.find(v=>v.id===id) }
    }
    try {
      const payload = { ...data, ...(data.plate? { plate: normalizePlate(data.plate)}:{}) }
      const res = await http.patch(ENDPOINTS.vehicles.detail(id), payload)
      const raw = res?.vehicle || res
      return { vehicle: normalizeVehicle(raw) }
    } catch(e){
      throw new Error(extractErrorMessage(e))
    }
  },
  async deleteVehicle(id){
    if (USE_MOCK){
      await delay(300)
      vehicles = vehicles.filter(v=>v.id!==id)
      return { ok:true }
    }
    try {
      await http.delete(ENDPOINTS.vehicles.detail(id))
      return { ok:true }
    } catch(e){
      throw new Error(extractErrorMessage(e))
    }
  },
  distinctColors(){
    if (USE_MOCK){
      const set = new Set(vehicles.map(v=>v.color))
      return Array.from(set).sort()
    }
    // Si el backend expone endpoint de colores, podríamos implementarlo asíncrono
    // Mantener versión síncrona local (se podría cachear la última lista cargada)
    return []
  }
}
