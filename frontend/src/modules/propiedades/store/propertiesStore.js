import { create } from 'zustand'
import { propertiesService } from '../services/propertiesService'

const initialFilters = { block:'ALL', search:'' }

export const usePropertiesStore = create((set,get)=>({
  properties: [],
  total: 0,
  page: 1,
  pageSize: 10,
  loading: false,
  error: null,
  filters: { ...initialFilters },
  async fetchProperties(params={}){
    const page = params.page || get().page
    const pageSize = get().pageSize
    const filters = { ...get().filters, ...params.filters }
    set({ loading:true, error:null, page, filters })
    try {
      const { properties, total } = await propertiesService.listProperties({ ...filters, page, pageSize })
      set({ properties, total })
    } catch(e){
      set({ error: e.message || 'Error al cargar propiedades' })
    } finally { set({ loading:false }) }
  },
  setFilters(newFilters){
    set(state=>({ filters: { ...state.filters, ...newFilters }, page:1 }))
    get().fetchProperties({ page:1 })
  },
  setPage(page){
    set({ page })
    get().fetchProperties({ page })
  },
  resetFilters(){
    set({ filters: { ...initialFilters }, page:1 })
    get().fetchProperties({ page:1 })
  },
  distinctBlocks(){
    return propertiesService.distinctBlocks()
  },
  async createProperty(data){
    set({ loading:true, error:null })
    try {
      await propertiesService.createProperty(data)
      // Volver a primera página para ver el nuevo al inicio
      set({ page:1 })
      await get().fetchProperties({ page:1 })
      return true
    } catch(e){
      set({ error: e.message || 'Error al crear propiedad' })
      return false
    } finally { set({ loading:false }) }
  },
  async updateProperty(id,data){
    set({ loading:true, error:null })
    try {
      await propertiesService.updateProperty(id,data)
      await get().fetchProperties({})
      return true
    } catch(e){
      set({ error: e.message || 'Error al actualizar propiedad' })
      return false
    } finally { set({ loading:false }) }
  },
  async deleteProperty(id){
    set({ loading:true, error:null })
    try {
      await propertiesService.deleteProperty(id)
      // Si eliminamos la última de la página y no es la primera, retroceder página
      const { properties, page } = get()
      if (properties.length === 1 && page > 1){
        const newPage = page - 1
        set({ page: newPage })
        await get().fetchProperties({ page:newPage })
      } else {
        await get().fetchProperties({})
      }
      return true
    } catch(e){
      set({ error: e.message || 'Error al eliminar propiedad' })
      return false
    } finally { set({ loading:false }) }
  }
}))
