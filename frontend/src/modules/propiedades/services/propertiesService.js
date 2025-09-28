// propertiesService (mock MVP)
// Campos: id, block, number, ownerName, landSizeM2, capacity, occupancyStatus ('ocupado'|'libre')

import { USE_MOCK, ENDPOINTS, normalizeProperty } from '../../../services/apiConfig'
import { http } from '../../../services/httpClient'

const delay = (ms=400)=> new Promise(r=>setTimeout(r,ms))

// Generar dataset mock (bloques formateados como b1, b2, b3 ...)
const BLOCKS = ['b1','b2','b3','b4','b5']
let properties = Array.from({ length: 73 }).map((_,i)=> {
  const block = BLOCKS[i % BLOCKS.length]
  const number = String( (i % 25) + 1 ).padStart(2,'0')
  const landSizeM2 = 120 + (i % 10) * 10 // 120..210
  const capacity = 2 + (i % 5) // 2..6
  const occupied = i % 3 !== 0 // aprox 66% ocupadas
  const ownerName = occupied ? `Propietario ${i+1}` : (i % 2 ===0 ? `Propietario ${i+1}` : '')
  return {
    id: 'p'+(i+1),
    block,
    number,
  code: block + '-' + number,
    ownerName: ownerName || `Propietario ${(i%7)+1}`,
    landSizeM2,
    capacity,
    occupancyStatus: occupied ? 'ocupado' : 'libre',
    createdAt: new Date(Date.now()- i*3600_000).toISOString(),
    updatedAt: new Date().toISOString()
  }
})

function applyFilters(list,{ block='ALL', search='' }){
  return list.filter(p=>{
    if (block !== 'ALL' && p.block !== block) return false
    if (search){
      const s = search.toLowerCase()
      // Buscar por code, ownerName o block + number juntos (ej: b1-03 o b103)
      const composite = (p.block + p.number).toLowerCase()
      if (!(p.code.toLowerCase().includes(s) || p.ownerName.toLowerCase().includes(s) || composite.includes(s.replace('-','')))) return false
    }
    return true
  })
}

export const propertiesService = {
  async listProperties(params={}){
    const { page=1, pageSize=10, block='ALL', search='' } = params
    if (USE_MOCK){
      await delay(300)
      const filtered = applyFilters(properties,{ block, search })
      const total = filtered.length
      const start = (page-1)*pageSize
      return { properties: filtered.slice(start,start+pageSize), total, page, pageSize }
    }
    // Backend real
    const qs = new URLSearchParams({ page:String(page), page_size:String(pageSize), ...(block!=='ALL'?{ block }:{}), ...(search?{ search }: {}) })
    const data = await http.get(`${ENDPOINTS.properties.root}?${qs.toString()}`)
    const rawList = data.results || data.properties || data.items || []
    const list = rawList.map(normalizeProperty)
    return { properties: list, total: data.count || data.total || list.length, page, pageSize }
  },
  distinctBlocks(){
    // Para el mock
    return Array.from(new Set(properties.map(p=>p.block))).sort((a,b)=>{
      const na = parseInt(a.slice(1),10)
      const nb = parseInt(b.slice(1),10)
      return na - nb
    })
  },
  async createProperty(data){
    if (USE_MOCK){
      await delay(250)
      const { block, number } = data
      if (properties.some(p=> p.block===block && p.number===number)){
        throw new Error('Ya existe una propiedad con ese bloque y número')
      }
      const id = 'p'+(properties.length+1)
      const now = new Date().toISOString()
      const prop = {
        id,
        block,
        number: number.padStart(2,'0'),
        code: block + '-' + number.padStart(2,'0'),
        ownerName: data.ownerName || '',
        landSizeM2: Number(data.landSizeM2)||0,
        capacity: Number(data.capacity)||0,
        occupancyStatus: data.occupancyStatus || 'libre',
        createdAt: now,
        updatedAt: now
      }
      properties = [prop, ...properties]
      return prop
    }
    const payload = {
      block: data.block,
      number: data.number,
      owner_name: data.ownerName,
      land_size_m2: data.landSizeM2,
      capacity: data.capacity,
      occupancy_status: data.occupancyStatus === 'ocupado' ? 'occupied' : 'free'
    }
    const created = await http.post(ENDPOINTS.properties.root, payload)
    return normalizeProperty(created)
  },
  async updateProperty(id, data){
    if (USE_MOCK){
      await delay(250)
      const idx = properties.findIndex(p=>p.id===id)
      if (idx===-1) throw new Error('Propiedad no encontrada')
      const target = properties[idx]
      // Si cambia block o number validar duplicado
      const newBlock = data.block ?? target.block
      const newNumber = (data.number ?? target.number)
      if (properties.some(p=> p.id!==id && p.block===newBlock && p.number===newNumber)){
        throw new Error('Ya existe otra propiedad con ese bloque y número')
      }
      const updated = {
        ...target,
        ...data,
        number: newNumber.padStart(2,'0'),
        code: newBlock + '-' + newNumber.padStart(2,'0'),
        landSizeM2: Number(data.landSizeM2 ?? target.landSizeM2),
        capacity: Number(data.capacity ?? target.capacity),
        updatedAt: new Date().toISOString()
      }
      properties[idx] = updated
      return updated
    }
    const payload = {
      ...(data.block ? { block: data.block } : {}),
      ...(data.number ? { number: data.number } : {}),
      ...(data.ownerName !== undefined ? { owner_name: data.ownerName } : {}),
      ...(data.landSizeM2 !== undefined ? { land_size_m2: data.landSizeM2 } : {}),
      ...(data.capacity !== undefined ? { capacity: data.capacity } : {}),
      ...(data.occupancyStatus ? { occupancy_status: data.occupancyStatus === 'ocupado' ? 'occupied' : 'free' } : {})
    }
    const updated = await http.patch(ENDPOINTS.properties.detail(id), payload)
    return normalizeProperty(updated)
  },
  async deleteProperty(id){
    if (USE_MOCK){
      await delay(200)
      const before = properties.length
      properties = properties.filter(p=>p.id!==id)
      if (before === properties.length) throw new Error('Propiedad no encontrada')
      return { ok:true }
    }
    await http.delete(ENDPOINTS.properties.detail(id))
    return { ok:true }
  }
}
