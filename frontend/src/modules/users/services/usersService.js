// Users & Roles Service (Mock + Real backend ready)
// Cuando USE_MOCK=false usará endpoints reales (ver apiConfig.js)

import { USE_MOCK, ENDPOINTS, normalizeUser, serializeUser, normalizeRole } from '../../../services/apiConfig'
import { http } from '../../../services/httpClient'

const delay = (ms=500) => new Promise(r => setTimeout(r, ms))

// Permisos base por módulo
export const permissionMatrix = {
  finance: { label: 'Gestión Financiera', actions: ['view','create','edit','delete'] },
  areas: { label: 'Áreas Comunes', actions: ['view','reservar','gestionar'] },
  maintenance: { label: 'Mantenimiento', actions: ['view','create','assign'] },
  security: { label: 'Seguridad', actions: ['view','config'] },
  reports: { label: 'Reportes', actions: ['view','generate','export'] },
  communication: { label: 'Comunicación', actions: ['view','publish'] }
}

// Roles iniciales
let roles = [
  { id: 'r_admin', name: 'Administrador', description: 'Control completo', permissions: Object.entries(permissionMatrix).flatMap(([mod, cfg]) => cfg.actions.map(a => `${mod}.${a}`)) },
  { id: 'r_residente', name: 'Residente', description: 'Acceso básico residencial', permissions: [ 'areas.view','areas.reservar','communication.view','reports.view' ] },
  { id: 'r_personal', name: 'Personal', description: 'Gestión operativa', permissions: [ 'maintenance.view','maintenance.create','maintenance.assign','areas.view','reports.view' ] }
]

// Usuarios mock
let users = Array.from({ length: 57 }).map((_,i) => {
  const role = i % 7 === 0 ? 'Administrador' : (i % 3 === 0 ? 'Personal' : 'Residente')
  // Solo dos estados permitidos: Activo / Inactivo
  const status = (i % 5 === 0) ? 'Inactivo' : 'Activo'
  const isResident = role === 'Residente'
  const bloque = isResident ? ('B' + ((i % 5) + 1)) : null
  const casa = isResident ? String(100 + i).padStart(3,'0') : null
  return {
    id: 'u'+(i+1),
    fullName: `Usuario ${i+1}`,
    email: `usuario${i+1}@demo.com`,
    phone: '+5917' + String(1000000 + i),
    ci: String(5000000 + i),
    bloque,
    casa,
    residencyType: isResident ? (i % 4 === 0 ? 'propietario' : 'inquilino') : null,
    role,
    status,
    registeredAt: new Date(Date.now() - i*86400000).toISOString(),
    lastAccessAt: new Date(Date.now() - (i%3)*3600000).toISOString()
  }
})

function applyFilters(list, { search, role, status, bloque }) {
  return list.filter(u => {
    if (search) {
      const s = search.toLowerCase()
      if (!(u.fullName.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || (u.casa||'').toLowerCase().includes(s))) return false
    }
    if (role && role !== 'ALL' && u.role !== role) return false
    if (status && status !== 'ALL' && u.status !== status) return false
    if (bloque && bloque !== 'ALL' && u.bloque !== bloque) return false
    return true
  })
}

export const usersService = {
  async listUsers(params = {}) {
    const { page = 1, pageSize = 20, search = '', role = 'ALL', status = 'ALL', bloque = 'ALL' } = params
    if (USE_MOCK) {
      await delay(350)
      const filtered = applyFilters(users, { search, role, status, bloque })
      const total = filtered.length
      const start = (page - 1) * pageSize
      const slice = filtered.slice(start, start + pageSize)
      return { users: slice, total, page, pageSize }
    }
    const query = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      ...(search ? { search } : {}),
      ...(role !== 'ALL' ? { role } : {}),
      ...(status !== 'ALL' ? { status: status === 'Activo' ? 'active' : 'inactive' } : {}),
      ...(bloque !== 'ALL' ? { block: bloque } : {})
    })
    const data = await http.get(`${ENDPOINTS.users.root}?${query.toString()}`)
    return {
      users: (data.results || data.users || []).map(normalizeUser),
      total: data.count ?? data.total ?? 0,
      page,
      pageSize
    }
  },
  async listRoles() {
    if (USE_MOCK) {
      await delay(200)
      const rolesWithCount = roles.map(r => ({ ...r, usersCount: users.filter(u => u.role === r.name).length }))
      return { roles: rolesWithCount }
    }
    const data = await http.get(ENDPOINTS.roles.root)
    const list = Array.isArray(data) ? data : (data.results || data.roles || [])
    return { roles: list.map(normalizeRole) }
  },
  async createUser(formData) {
    if (USE_MOCK) {
      await delay(400)
      if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
        throw new Error('El email ya está registrado')
      }
      const id = 'u' + (users.length + 1)
      const newUser = { id, registeredAt: new Date().toISOString(), lastAccessAt: new Date().toISOString(), status: 'Activo', ...formData }
      users.unshift(newUser)
      return { user: newUser }
    }
    const payload = serializeUser(formData)
    const data = await http.post(ENDPOINTS.users.root, payload)
    return { user: normalizeUser(data.user || data) }
  },
  async updateUser(id, formData) {
    if (USE_MOCK) {
      await delay(400)
      if (formData.email) {
        const exists = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== id)
        if (exists) throw new Error('Otro usuario ya usa este email')
      }
      users = users.map(u => u.id === id ? { ...u, ...formData } : u)
      return { user: users.find(u => u.id === id) }
    }
    const payload = serializeUser(formData)
    const data = await http.patch(ENDPOINTS.users.detail(id), payload)
    return { user: normalizeUser(data.user || data) }
  },
  async changeUserStatus(id, status) {
    if (USE_MOCK) {
      await delay(300)
      const safe = status === 'Activo' ? 'Activo' : 'Inactivo'
      users = users.map(u => u.id === id ? { ...u, status: safe } : u)
      return { ok: true }
    }
    const backendStatus = status === 'Activo' ? 'active' : 'inactive'
    // Prefer specialized endpoint if exists
    try {
      await http.patch(ENDPOINTS.users.status(id), { status: backendStatus })
    } catch {
      await http.patch(ENDPOINTS.users.detail(id), { status: backendStatus })
    }
    return { ok: true }
  },
  async deleteUser(id) {
    if (USE_MOCK) {
      await delay(300)
      users = users.filter(u => u.id !== id)
      return { ok: true }
    }
    await http.delete(ENDPOINTS.users.detail(id))
    return { ok: true }
  },
  async createRole(data) {
    if (USE_MOCK) {
      await delay(400)
      const id = 'r_' + (roles.length + 1)
      const role = { id, permissions: [], usersCount: 0, ...data }
      roles.push(role)
      return { role }
    }
    const res = await http.post(ENDPOINTS.roles.root, data)
    return { role: normalizeRole(res.role || res) }
  },
  async updateRole(id, data) {
    if (USE_MOCK) {
      await delay(400)
      roles = roles.map(r => r.id === id ? { ...r, ...data } : r)
      return { role: roles.find(r => r.id === id) }
    }
    const res = await http.patch(ENDPOINTS.roles.detail(id), data)
    return { role: normalizeRole(res.role || res) }
  },
  async deleteRole(id) {
    if (USE_MOCK) {
      await delay(300)
      roles = roles.filter(r => r.id !== id)
      return { ok: true }
    }
    await http.delete(ENDPOINTS.roles.detail(id))
    return { ok: true }
  },
  async updateRolePermissions(id, permissions) {
    if (USE_MOCK) {
      await delay(350)
      roles = roles.map(r => r.id === id ? { ...r, permissions } : r)
      return { role: roles.find(r => r.id === id) }
    }
    const res = await http.patch(ENDPOINTS.roles.detail(id), { permissions })
    return { role: normalizeRole(res.role || res) }
  },
  async getPermissionMatrix() {
    if (USE_MOCK) {
      await delay(150)
      return { matrix: permissionMatrix }
    }
    const data = await http.get(ENDPOINTS.roles.permissionsMatrix)
    // Backend puede devolver { modules: {...} } o { matrix: {...} }
    return { matrix: data.matrix || data.modules || data }
  }
}
