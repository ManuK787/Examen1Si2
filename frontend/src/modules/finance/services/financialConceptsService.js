// Mock service for financial concepts (fees, fines, misc) - Fase 1 (fixed, per_unit, per_m2)
import { nanoid } from 'nanoid'

const mockData = [
  {
    id: nanoid(),
    code: 'FEE-MANT',
    name: 'Cuota Ordinaria',
    description: 'Mantenimiento general y operación',
    conceptType: 'fee',
    calculation: { method: 'fixed', baseAmount: 120, currency: 'BOB', unitBasis: null, formula: null, scale: null },
    periodicity: 'monthly',
    scope: { appliesTo: 'all', blocks: [], propertyTypes: [], infractions: [], selectionIds: [] },
    versioning: { current: { validFrom: '2025-01-01', validTo: null } },
    status: 'active',
    audit: { createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-01T10:00:00Z', createdByName: 'Admin', updatedByName: 'Admin' }
  },
  {
    id: nanoid(),
    code: 'FEE-AGUA',
    name: 'Agua',
    description: 'Consumo de agua prorrateado por unidad',
    conceptType: 'fee',
    calculation: { method: 'per_unit', baseAmount: 15, currency: 'BOB', unitBasis: 'unit', formula: null, scale: null },
    periodicity: 'monthly',
    scope: { appliesTo: 'blocks', blocks: ['Torre A','Torre B'], propertyTypes: [], infractions: [], selectionIds: [] },
    versioning: { current: { validFrom: '2025-02-01', validTo: null } },
    status: 'active',
    audit: { createdAt: '2025-02-01T09:00:00Z', updatedAt: '2025-02-01T09:00:00Z', createdByName: 'Admin', updatedByName: 'Admin' }
  },
  {
    id: nanoid(),
    code: 'FEE-SEG',
    name: 'Seguridad',
    description: 'Servicio de guardia y monitoreo',
    conceptType: 'fee',
    calculation: { method: 'fixed', baseAmount: 35, currency: 'BOB', unitBasis: null, formula: null, scale: null },
    periodicity: 'monthly',
    scope: { appliesTo: 'all', blocks: [], propertyTypes: [], infractions: [], selectionIds: [] },
    versioning: { current: { validFrom: '2025-03-01', validTo: null } },
    status: 'active',
    audit: { createdAt: '2025-03-01T09:00:00Z', updatedAt: '2025-03-01T09:00:00Z', createdByName: 'Admin', updatedByName: 'Admin' }
  },
  {
    id: nanoid(),
    code: 'FINE-RUIDO',
    name: 'Multa Ruido',
    description: 'Ruido excesivo fuera de horario',
    conceptType: 'fine',
    calculation: { method: 'fixed', baseAmount: 50, currency: 'BOB', unitBasis: null, formula: null, scale: null },
    periodicity: 'one_time',
    scope: { appliesTo: 'infractions', blocks: [], propertyTypes: [], infractions: ['ruido'], selectionIds: [] },
    versioning: { current: { validFrom: '2025-01-15', validTo: null } },
    status: 'active',
    audit: { createdAt: '2025-01-15T09:00:00Z', updatedAt: '2025-01-15T09:00:00Z', createdByName: 'Admin', updatedByName: 'Admin' }
  }
]

function simulateLatency(){ return new Promise(r=>setTimeout(r, 300)) }

export async function listFinancialConcepts(params={}){
  await simulateLatency()
  const { page=1, pageSize=10, status='', periodicity='', conceptType='', search='' } = params
  let data = [...mockData]
  if (status) data = data.filter(c=>c.status===status)
  if (periodicity) data = data.filter(c=>c.periodicity===periodicity)
  if (conceptType) data = data.filter(c=>c.conceptType===conceptType)
  if (search){
    const q = search.toLowerCase()
    data = data.filter(c=> c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
  }
  const total = data.length
  const start = (page-1)*pageSize
  const results = data.slice(start, start+pageSize)
  return { items: results, total }
}

export async function createFinancialConcept(payload){
  await simulateLatency()
  const now = new Date().toISOString()
  const rec = {
    id: nanoid(),
    code: payload.code || ('GEN-'+Math.random().toString(36).slice(2,7).toUpperCase()),
    name: payload.name,
    description: payload.description || '',
    conceptType: payload.conceptType || 'fee',
    calculation: normalizeCalculation(payload),
    periodicity: payload.periodicity || 'monthly',
    scope: normalizeScope(payload.scope),
    versioning: { current: { validFrom: payload.validFrom || now.slice(0,10), validTo: payload.validTo || null } },
    status: payload.status || 'active',
    audit: { createdAt: now, updatedAt: now, createdByName: 'Admin', updatedByName: 'Admin' }
  }
  mockData.unshift(rec)
  return rec
}

export async function updateFinancialConcept(id,payload){
  await simulateLatency()
  const idx = mockData.findIndex(c=>c.id===id)
  if (idx===-1) throw new Error('Not found')
  const prev = mockData[idx]
  const updated = {
    ...prev,
    name: payload.name ?? prev.name,
    description: payload.description ?? prev.description,
    calculation: payload.calculation ? normalizeCalculation(payload.calculation) : prev.calculation,
    periodicity: payload.periodicity ?? prev.periodicity,
    scope: payload.scope ? normalizeScope(payload.scope) : prev.scope,
    audit: { ...prev.audit, updatedAt: new Date().toISOString(), updatedByName: 'Admin' }
  }
  mockData[idx] = updated
  return updated
}

export async function scheduleVersion(id,{ validFrom, baseAmount, formula }){
  await simulateLatency()
  const item = mockData.find(c=>c.id===id)
  if (!item) throw new Error('Not found')
  item.versioning.next = { validFrom, baseAmount: baseAmount ?? item.calculation.baseAmount, formula: formula ?? item.calculation.formula }
  if (item.status === 'active') item.status = 'active' // unchanged but left explicit
  return item
}

export async function disableFinancialConcept(id){
  await simulateLatency()
  const item = mockData.find(c=>c.id===id)
  if (!item) throw new Error('Not found')
  item.status = 'disabled'
  return item
}

export async function enableFinancialConcept(id){
  await simulateLatency()
  const item = mockData.find(c=>c.id===id)
  if (!item) throw new Error('Not found')
  item.status = 'active'
  return item
}

export async function cloneFinancialConcept(id){
  await simulateLatency()
  const orig = mockData.find(c=>c.id===id)
  if (!orig) throw new Error('Not found')
  const now = new Date().toISOString()
  const clone = {
    ...orig,
    id: nanoid(),
    code: orig.code + '-CLONE',
    name: orig.name + ' (Copia)',
    status: 'draft',
    versioning: { current: { validFrom: now.slice(0,10), validTo: null } },
    audit: { createdAt: now, updatedAt: now, createdByName: 'Admin', updatedByName: 'Admin' }
  }
  mockData.unshift(clone)
  return clone
}

export async function deleteFinancialConcept(id){
  await simulateLatency()
  const idx = mockData.findIndex(c=>c.id===id)
  if (idx===-1) throw new Error('Not found')
  const item = mockData[idx]
  if (item.status !== 'draft') throw new Error('Sólo se puede eliminar borrador')
  mockData.splice(idx,1)
  return { success:true }
}

function normalizeCalculation(c){
  return {
    method: c.method || c.calculation?.method || 'fixed',
    baseAmount: c.baseAmount ?? c.calculation?.baseAmount ?? 0,
    currency: c.currency || c.calculation?.currency || 'BOB',
    unitBasis: c.unitBasis ?? c.calculation?.unitBasis ?? null,
    formula: c.formula ?? c.calculation?.formula ?? null,
    scale: null // fase 1 sin escalado
  }
}

function normalizeScope(scope){
  const s = scope || {}
  return {
    appliesTo: s.appliesTo || 'all',
    blocks: s.blocks || [],
    propertyTypes: s.propertyTypes || [],
    infractions: s.infractions || [],
    selectionIds: s.selectionIds || []
  }
}

export function extractFinancialConceptError(e){
  return e?.message || 'Error financiero'
}
