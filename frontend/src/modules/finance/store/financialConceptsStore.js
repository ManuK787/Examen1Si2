import { create } from 'zustand'
import {
  listFinancialConcepts,
  createFinancialConcept,
  updateFinancialConcept,
  scheduleVersion,
  disableFinancialConcept,
  enableFinancialConcept,
  cloneFinancialConcept,
  deleteFinancialConcept,
  extractFinancialConceptError
} from '../services/financialConceptsService'

const initialFilters = { status:'', periodicity:'', conceptType:'', search:'' }

export const useFinancialConceptsStore = create((set,get)=>({
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  loading: false,
  error: null,
  filters: { ...initialFilters },
  dialog: { open:false, mode:null, editing:null }, // mode: create | edit | schedule
  dirty: true,

  setFilter(key,value){ set(state=>({ filters:{...state.filters,[key]:value}, page:1, dirty:true })) },
  resetFilters(){ set({ filters:{...initialFilters}, page:1, dirty:true }) },
  setPage(page){ set({ page, dirty:true }) },
  setPageSize(pageSize){ set({ pageSize, page:1, dirty:true }) },
  forceReload(){ set({ dirty:true }) },

  openDialog(mode, concept=null){ set({ dialog:{ open:true, mode, editing:concept }}) },
  closeDialog(){ set({ dialog:{ open:false, mode:null, editing:null }}) },

  async fetchList(){
    const { loading, page, pageSize, filters } = get()
    if (loading) return
    set({ loading:true, error:null })
    try {
      const res = await listFinancialConcepts({
        page, pageSize,
        status: filters.status,
        periodicity: filters.periodicity,
        conceptType: filters.conceptType,
        search: filters.search
      })
      set({ items: res.items, total: res.total, loading:false, dirty:false })
    } catch(e){ set({ error: extractFinancialConceptError(e), loading:false }) }
  },

  async create(data){
    set({ loading:true, error:null })
    try { const rec = await createFinancialConcept(data); set(state=>({ items:[rec,...state.items], loading:false })); get().closeDialog(); return rec }
    catch(e){ set({ error: extractFinancialConceptError(e), loading:false }); throw e }
  },

  async update(id,data){
    set({ loading:true, error:null })
    try { const upd = await updateFinancialConcept(id,data); set(state=>({ items: state.items.map(c=>c.id===id?upd:c), loading:false })); get().closeDialog(); return upd }
    catch(e){ set({ error: extractFinancialConceptError(e), loading:false }); throw e }
  },

  async schedule(id,payload){
    set({ loading:true, error:null })
    try { const upd = await scheduleVersion(id,payload); set(state=>({ items: state.items.map(c=>c.id===id?{...upd}:c), loading:false })); get().closeDialog(); return upd }
    catch(e){ set({ error: extractFinancialConceptError(e), loading:false }); throw e }
  },

  async disable(id){
    set({ loading:true, error:null })
    try { const upd = await disableFinancialConcept(id); set(state=>({ items: state.items.map(c=>c.id===id?upd:c), loading:false })) }
    catch(e){ set({ error: extractFinancialConceptError(e), loading:false }) }
  },

  async enable(id){
    set({ loading:true, error:null })
    try { const upd = await enableFinancialConcept(id); set(state=>({ items: state.items.map(c=>c.id===id?upd:c), loading:false })) }
    catch(e){ set({ error: extractFinancialConceptError(e), loading:false }) }
  },

  async clone(id){
    set({ loading:true, error:null })
    try { const rec = await cloneFinancialConcept(id); set(state=>({ items:[rec,...state.items], loading:false })) }
    catch(e){ set({ error: extractFinancialConceptError(e), loading:false }) }
  },

  async remove(id){
    set({ loading:true, error:null })
    try { await deleteFinancialConcept(id); set(state=>({ items: state.items.filter(c=>c.id!==id), loading:false })) }
    catch(e){ set({ error: extractFinancialConceptError(e), loading:false }) }
  }
}))
