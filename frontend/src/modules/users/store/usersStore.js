import { create } from 'zustand'
import { usersService } from '../services/usersService'

// Filtros y paginación iniciales
const initialFilters = {
  search: '',
  role: 'ALL',
  status: 'ALL',
  bloque: 'ALL'
}

export const useUsersStore = create((set, get) => ({
  users: [],
  total: 0,
  page: 1,
  // Tamaño de página fijo solicitado: siempre 10 filas
  pageSize: 10,
  loading: false,
  rolesLoading: false,
  roles: [],
  permissionMatrix: null,
  filters: { ...initialFilters },
  error: null,
  // Actions
  async fetchUsers(params={}) {
    const { page = get().page } = params
    // Forzamos pageSize constante (10)
    const pageSize = 10
    const filters = { ...get().filters, ...params.filters }
    set({ loading: true, error: null, page, pageSize, filters })
    try {
      const { users, total } = await usersService.listUsers({ ...filters, page, pageSize })
      set({ users, total })
    } catch (e) {
      set({ error: e.message || 'Error al cargar usuarios' })
    } finally {
      set({ loading: false })
    }
  },
  setFilters(newFilters) {
    set(state => ({ filters: { ...state.filters, ...newFilters }, page: 1 }))
    get().fetchUsers({ page: 1 })
  },
  setPage(page) {
    set({ page })
    get().fetchUsers({ page })
  },
  async fetchRoles() {
    set({ rolesLoading: true })
    try {
      const { roles } = await usersService.listRoles()
      set({ roles })
    } finally {
      set({ rolesLoading: false })
    }
  },
  async fetchPermissionMatrix() {
    if (get().permissionMatrix) return
    const { matrix } = await usersService.getPermissionMatrix()
    set({ permissionMatrix: matrix })
  },
  async createUser(data) {
    const { user } = await usersService.createUser(data)
    // Refrescar primera página para verlo arriba
    get().fetchUsers({ page: 1 })
    return user
  },
  async updateUser(id, data) {
    const { user } = await usersService.updateUser(id, data)
    set({ users: get().users.map(u => u.id === id ? user : u) })
    return user
  },
  async changeUserStatus(id, status) {
    await usersService.changeUserStatus(id, status)
    set({ users: get().users.map(u => u.id === id ? { ...u, status } : u) })
  },
  async deleteUser(id) {
    await usersService.deleteUser(id)
    // Si se vacía la página actual ajustamos
    const { users, page } = get()
    if (users.length === 1 && page > 1) {
      get().fetchUsers({ page: page - 1 })
    } else {
      get().fetchUsers({ page })
    }
  },
  resetFilters() {
    set({ filters: { ...initialFilters }, page: 1 })
    get().fetchUsers({ page: 1 })
  }
}))
