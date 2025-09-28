import { create } from 'zustand'
import { vehiclesService } from '../services/vehiclesService'

const initialFilters = { search:'', color:'ALL' }

export const useVehiclesStore = create((set,get)=>({
  vehicles: [],
  total: 0,
  page: 1,
  pageSize: 10,
  loading: false,
  error: null,
  filters: { ...initialFilters },
  // Helper para validar unicidad de placa (case-insensitive)
  plateExists(plate, excludeId){
    const norm = plate.trim().toUpperCase().replace(/\s+/g,'')
    return get().vehicles.some(v=> v.plate.toUpperCase() === norm && v.id !== excludeId)
  },
  async fetchVehicles(params={}) {
    const { page = get().page } = params
    const pageSize = 10
    const filters = { ...get().filters, ...params.filters }
    set({ loading:true, error:null, page, pageSize, filters })
    try {
      const { vehicles, total } = await vehiclesService.listVehicles({ ...filters, page, pageSize })
      set({ vehicles, total })
    } catch(e){
      set({ error: e.message || 'Error al cargar vehículos' })
    } finally {
      set({ loading:false })
    }
  },
  setFilters(newFilters){
    set(state=>({ filters: { ...state.filters, ...newFilters }, page:1 }))
    get().fetchVehicles({ page:1 })
  },
  setPage(page){
    set({ page })
    get().fetchVehicles({ page })
  },
  resetFilters(){
    set({ filters:{ ...initialFilters }, page:1 })
    get().fetchVehicles({ page:1 })
  },
  async createVehicle(data){
    if (get().plateExists(data.plate)) throw new Error('La placa ya existe en la página actual')
    const { vehicle } = await vehiclesService.createVehicle(data)
    // Refrescar primera página para verlo arriba
    get().fetchVehicles({ page:1 })
    return vehicle
  },
  async updateVehicle(id,data){
    if (data.plate && get().plateExists(data.plate, id)) throw new Error('Otra fila ya tiene esa placa')
    const { vehicle } = await vehiclesService.updateVehicle(id,data)
    set({ vehicles: get().vehicles.map(v=> v.id===id? vehicle : v) })
    return vehicle
  },
  async deleteVehicle(id){
    await vehiclesService.deleteVehicle(id)
    const { vehicles, page } = get()
    if (vehicles.length === 1 && page > 1) {
      get().fetchVehicles({ page: page-1 })
    } else {
      get().fetchVehicles({ page })
    }
  },
  distinctColors(){
    return vehiclesService.distinctColors()
  }
}))
