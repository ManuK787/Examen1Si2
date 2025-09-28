import { create } from 'zustand'
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  publishAnnouncement,
  scheduleAnnouncement,
  archiveAnnouncement,
  cancelAnnouncement,
  listActiveAnnouncements,
  markAnnouncementRead,
  getUnreadCount,
  extractAnnouncementError
} from '../services/announcementsService'

const initialFilters = { status:'', priority:'', search:'', tag:'' }

export const useAnnouncementsStore = create((set,get)=>({
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  loading: false,
  error: null,
  filters: { ...initialFilters },
  dialog: { open:false, editing:null }, // singular (dialog)
  detail: { open:false, item:null },
  dirty: true,
  unreadCount: 0,
  active: [],

  setFilter(key,value){ set(state=>({ filters:{...state.filters,[key]:value}, page:1, dirty:true })) },
  resetFilters(){ set({ filters:{...initialFilters}, page:1, dirty:true }) },
  setPage(page){ set({ page, dirty:true }) },
  setPageSize(pageSize){ set({ pageSize, page:1, dirty:true }) },
  forceReload(){ set({ dirty:true }) },

  openCreate(){ set(state=>({ dialog:{ ...state.dialog, open:true, editing:null }})) },
  openEdit(item){ set(state=>({ dialog:{ ...state.dialog, open:true, editing:item }})) },
  closeDialog(){ set(state=>({ dialog:{ ...state.dialog, open:false, editing:null }})) },

  openDetail(item){ set({ detail:{ open:true, item }}) },
  closeDetail(){ set({ detail:{ open:false, item:null }}) },

  async fetchList(){
    const { page, pageSize, filters, loading } = get()
    if (loading) return
    set({ loading:true, error:null, dirty:false })
    try {
      const res = await listAnnouncements({
        page, pageSize,
        status: filters.status,
        priority: filters.priority,
        search: filters.search,
        tag: filters.tag
      })
      set({ items: res.items, total: res.total, loading:false })
    } catch (e){
      set({ error: extractAnnouncementError(e), loading:false })
    }
  },

  async fetchActive(){
    try {
      const data = await listActiveAnnouncements()
      set({ active: data })
    } catch(e){ /* silent */ }
  },

  async refreshUnread(){
    try { const r = await getUnreadCount(); set({ unreadCount: r.count }) } catch(e){ /* silent */ }
  },

  async create(data){
    set({ loading:true, error:null })
    try {
      const rec = await createAnnouncement(data)
      set(state=>({ items:[rec, ...state.items], loading:false, dirty:true }))
      get().closeDialog()
      return rec
    } catch(e){ set({ error: extractAnnouncementError(e), loading:false }); throw e }
  },

  async update(id,data){
    set({ loading:true, error:null })
    try {
      const upd = await updateAnnouncement(id,data)
      set(state=>({ items: state.items.map(a=>a.id===id?upd:a), loading:false, dirty:true }))
      get().closeDialog()
      return upd
    } catch(e){ set({ error: extractAnnouncementError(e), loading:false }); throw e }
  },

  async publish(id){
    set({ loading:true, error:null })
    try {
      const upd = await publishAnnouncement(id)
      set(state=>({ items: state.items.map(a=>a.id===id?upd:a), loading:false, dirty:true }))
      return upd
    } catch(e){ set({ error: extractAnnouncementError(e), loading:false }); throw e }
  },

  async schedule(id, publishAt){
    set({ loading:true, error:null })
    try {
      const upd = await scheduleAnnouncement(id, publishAt)
      set(state=>({ items: state.items.map(a=>a.id===id?upd:a), loading:false, dirty:true }))
      return upd
    } catch(e){ set({ error: extractAnnouncementError(e), loading:false }); throw e }
  },

  async archive(id){
    set({ loading:true, error:null })
    try {
      const upd = await archiveAnnouncement(id)
      set(state=>({ items: state.items.map(a=>a.id===id?upd:a), loading:false, dirty:true }))
      return upd
    } catch(e){ set({ error: extractAnnouncementError(e), loading:false }); throw e }
  },

  async cancel(id){
    set({ loading:true, error:null })
    try {
      const upd = await cancelAnnouncement(id)
      set(state=>({ items: state.items.map(a=>a.id===id?upd:a), loading:false, dirty:true }))
      return upd
    } catch(e){ set({ error: extractAnnouncementError(e), loading:false }); throw e }
  },

  async markRead(id, userId){
    try { await markAnnouncementRead(id,userId); set(state=>({ active: state.active.map(a=>a.id===id?{...a,isRead:true}:a) })) } catch(e){ /* silent */ }
  }
}))
