import { create } from 'zustand'
import {
  listMaintenanceTasks,
  createMaintenanceTask,
  updateMaintenanceTask,
  changeMaintenanceTaskStatus,
  deleteMaintenanceTask,
  extractMaintenanceTaskError
} from '../services/maintenanceTasksService'

const initialFilters = {
  status: '', // '', 'pendiente', 'en progreso', 'completada', 'cancelada'
  priority: '', // '', 'low', 'medium', 'high'
  assigneeId: '',
  search: ''
}

// Nota: devtools removido para evitar incompatibilidades con Zustand v5 que pueden causar pantalla en blanco si
// la extensión / middleware no está disponible o su firma cambió.
export const useMaintenanceTasksStore = create((set, get) => ({
  tasks: [],
  total: 0,
  page: 1,
  pageSize: 10,
  loading: false,
  error: null,
  dirty: true, // indica que se requiere fetch inicial o tras cambio de filtros/paginación
  filters: { ...initialFilters },
  dialog: { open: false, editing: null },
  statusDialog: { open: false, task: null },

  setFilter(key, value){
    set(state => ({ filters: { ...state.filters, [key]: value }, page: 1, dirty: true }))
  },
  resetFilters(){
    set({ filters: { ...initialFilters }, page:1, dirty: true })
  },
  setPage(page){
    set({ page, dirty: true })
  },
  setPageSize(pageSize){
    set({ pageSize, page:1, dirty: true })
  },
  forceReload(){
    // marca dirty para que el efecto en la página haga refetch aún si filtros/paginación no cambiaron
    set({ dirty:true })
  },

  openCreateDialog(){ set({ dialog: { open:true, editing:null }}) },
  openEditDialog(task){ set({ dialog: { open:true, editing:task }}) },
  closeDialog(){ set({ dialog: { open:false, editing:null }}) },

  openStatusDialog(task){ set({ statusDialog: { open:true, task }}) },
  closeStatusDialog(){ set({ statusDialog: { open:false, task:null }}) },

  async fetchTasks(){
    const { page, pageSize, filters, loading } = get()
    if (loading) return
    set({ loading: true, error:null, dirty:false })
    try {
      const res = await listMaintenanceTasks({
        page, pageSize,
        status: filters.status,
        priority: filters.priority,
        assigneeId: filters.assigneeId,
        search: filters.search
      })
      set({ tasks: res.items, total: res.total, loading:false })
    } catch (err){
      set({ error: extractMaintenanceTaskError(err), loading:false })
    }
  },

  async createTask(data){
    set({ loading:true, error:null })
    try {
      const task = await createMaintenanceTask(data)
      set(state => ({ tasks: [task, ...state.tasks], loading:false, dirty:true }))
      get().closeDialog()
      return task
    } catch (err){
      set({ error: extractMaintenanceTaskError(err), loading:false })
      throw err
    }
  },

  async updateTask(id, data){
    set({ loading:true, error:null })
    try {
      const updated = await updateMaintenanceTask(id, data)
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? updated : t),
        loading:false,
        dirty:true
      }))
      get().closeDialog()
      return updated
    } catch (err){
      set({ error: extractMaintenanceTaskError(err), loading:false })
      throw err
    }
  },

  async changeStatus(id, uiStatus, progressPercent=null, reason=''){
    set({ loading:true, error:null })
    try {
      const updated = await changeMaintenanceTaskStatus(id, uiStatus, progressPercent, reason)
      set(state => ({ tasks: state.tasks.map(t => t.id === id ? updated : t), loading:false, dirty:true }))
      get().closeStatusDialog()
      return updated
    } catch (err){
      set({ error: extractMaintenanceTaskError(err), loading:false })
      throw err
    }
  },

  async removeTask(id){
    set({ loading:true, error:null })
    try {
      await deleteMaintenanceTask(id)
      set(state => ({ tasks: state.tasks.filter(t => t.id !== id), total: Math.max(0, state.total-1), loading:false, dirty:true }))
    } catch (err){
      set({ error: extractMaintenanceTaskError(err), loading:false })
      throw err
    }
  }
}))
