import { useEffect } from 'react'
import AnnouncementsToolbar from '../components/AnnouncementsToolbar'
import AnnouncementsTable from '../components/AnnouncementsTable'
import AnnouncementModal from '../components/AnnouncementModal'
import { useAnnouncementsStore } from '../store/announcementsStore'

export default function ComunicacionPage(){
  const dirty = useAnnouncementsStore(s=>s.dirty)
  const fetchList = useAnnouncementsStore(s=>s.fetchList)
  const statusFilter = useAnnouncementsStore(s=>s.filters.status)
  const priorityFilter = useAnnouncementsStore(s=>s.filters.priority)
  const searchFilter = useAnnouncementsStore(s=>s.filters.search)
  const tagFilter = useAnnouncementsStore(s=>s.filters.tag)
  const page = useAnnouncementsStore(s=>s.page)
  const pageSize = useAnnouncementsStore(s=>s.pageSize)

  // Efecto único: si dirty es true dispara fetch; también re-fetch cuando cambian filtros/paginación
  useEffect(()=>{
    if (dirty || statusFilter || priorityFilter || searchFilter || tagFilter || page || pageSize){
      fetchList()
    }
  },[dirty, statusFilter, priorityFilter, searchFilter, tagFilter, page, pageSize, fetchList])

  return (
    <div className="p-6 space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-800">Comunicados</h1>
        <p className="text-sm text-slate-500">Gestione comunicados internos: creación, programación, publicación y archivo.</p>
      </header>
      <AnnouncementsToolbar />
      <AnnouncementsTable />
      <AnnouncementModal />
    </div>
  )
}
