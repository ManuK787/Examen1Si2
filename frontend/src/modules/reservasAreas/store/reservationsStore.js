import { create } from 'zustand'
import { listReservations, createReservation, updateReservation, deleteReservation, changeReservationStatus, extractReservationError, markReservationPaid } from '../services/reservationsService'

const initialFilters = {
  status: '',
  dateFrom: '',
  dateTo: '',
  search: ''
}

export const useReservationsStore = create((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  loading: false,
  error: null,
  filters: { ...initialFilters },

  modalOpen: false,
  editing: null,
  statusDialog: { open: false, target: null, action: null },

  setPage: (page) => set({ page }, () => get().fetch()),
  setPageSize: (pageSize) => set({ pageSize, page:1 }, () => get().fetch()),

  setFilter: (key, value) => set(state => ({ filters: { ...state.filters, [key]: value }, page:1 })),
  applyFilters: () => get().fetch(),
  resetFilters: () => set({ filters: { ...initialFilters }, page:1 }, () => get().fetch()),

  openCreate: () => set({ modalOpen: true, editing: null }),
  openEdit: (item) => set({ modalOpen: true, editing: item }),
  closeModal: () => set({ modalOpen: false, editing: null }),

  openStatusDialog: (item, action) => set({ statusDialog: { open: true, target: item, action } }),
  closeStatusDialog: () => set({ statusDialog: { open: false, target: null, action: null } }),

  fetch: async () => {
    const { page, pageSize, filters } = get()
    set({ loading: true, error: null })
    try {
      const res = await listReservations({ page, pageSize, ...filters })
      set({ items: res.items, total: res.total, loading:false })
    } catch (err) {
      set({ error: extractReservationError(err), loading:false })
    }
  },

  createItem: async (data) => {
    set({ loading:true, error:null })
    try {
      await createReservation(data)
      set({ modalOpen:false })
      await get().fetch()
    } catch (err){
      set({ error: extractReservationError(err) })
    } finally { set({ loading:false }) }
  },

  updateItem: async (id, data) => {
    set({ loading:true, error:null })
    try {
      await updateReservation(id, data)
      set({ modalOpen:false, editing:null })
      await get().fetch()
    } catch (err){
      set({ error: extractReservationError(err) })
    } finally { set({ loading:false }) }
  },

  deleteItem: async (id) => {
    set({ loading:true, error:null })
    try {
      await deleteReservation(id)
      await get().fetch()
    } catch (err){
      set({ error: extractReservationError(err) })
    } finally { set({ loading:false }) }
  },

  changeStatus: async (id, uiStatus, reason='') => {
    set({ loading:true, error:null })
    try {
      await changeReservationStatus(id, uiStatus, reason)
      set({ statusDialog: { open:false, target:null, action:null } })
      await get().fetch()
    } catch (err){
      set({ error: extractReservationError(err) })
    } finally { set({ loading:false }) }
  },

  markPaid: async (id) => {
    set({ loading:true, error:null })
    try {
      await markReservationPaid(id)
      await get().fetch()
    } catch (err){
      set({ error: extractReservationError(err) })
    } finally { set({ loading:false }) }
  }
}))
