import { create } from 'zustand'
import { listCommonAreas, createCommonArea, updateCommonArea, deleteCommonArea, extractCommonAreaError } from '../services/commonAreasService'

export const useCommonAreasStore = create((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  search: '',
  typeFilter: '',
  statusFilter: '',
  loading: false,
  error: null,
  // Modal state
  isModalOpen: false,
  editingItem: null,

  openNewModal: () => set({ isModalOpen: true, editingItem: null }),
  openEditModal: (item) => set({ isModalOpen: true, editingItem: item }),
  closeModal: () => set({ isModalOpen: false, editingItem: null }),

  setSearch: (search) => set({ search, page: 1 }),
  setTypeFilter: (typeFilter) => set({ typeFilter, page: 1 }),
  setStatusFilter: (statusFilter) => set({ statusFilter, page: 1 }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),

  fetch: async () => {
    const { page, pageSize, search, typeFilter, statusFilter } = get()
    set({ loading: true, error: null })
    try {
      const res = await listCommonAreas({
        page,
        pageSize,
        search,
        type: typeFilter,
        status: statusFilter
      })
      set({ items: res.items, total: res.total, page: res.page, pageSize: res.pageSize })
    } catch (err) {
      set({ error: extractCommonAreaError(err) })
    } finally {
      set({ loading: false })
    }
  },

  createItem: async (data) => {
    set({ loading: true, error: null })
    try {
      const created = await createCommonArea(data)
      // Después de crear reiniciamos a la primera página para ver el nuevo elemento
      set({ page: 1 })
      await get().fetch()
      return created
    } catch (err) {
      const msg = extractCommonAreaError(err)
      set({ error: msg })
      throw new Error(msg)
    } finally {
      set({ loading: false })
    }
  },

  updateItem: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const updated = await updateCommonArea(id, data)
      // Actualizamos en memoria sin refetch completo para optimizar
      set(state => ({
        items: state.items.map(it => it.id === id ? updated : it)
      }))
      return updated
    } catch (err) {
      const msg = extractCommonAreaError(err)
      set({ error: msg })
      throw new Error(msg)
    } finally {
      set({ loading: false })
    }
  },

  deleteItem: async (id) => {
    set({ loading: true, error: null })
    try {
      await deleteCommonArea(id)
      // Si eliminamos el último de la página actual y no es la primera, retrocedemos una página
      const { items, page } = get()
      const remaining = items.filter(it => it.id !== id)
      if (remaining.length === 0 && page > 1) {
        set({ page: page - 1 })
      }
      await get().fetch()
    } catch (err) {
      const msg = extractCommonAreaError(err)
      set({ error: msg })
      throw new Error(msg)
    } finally {
      set({ loading: false })
    }
  }
}))
