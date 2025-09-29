import { useEffect } from 'react'
import { useFinancialConceptsStore } from '../store/financialConceptsStore'
import ConceptsToolbar from '../components/ConceptsToolbar'
import ConceptsTable from '../components/ConceptsTable'
import ConceptModal from '../components/ConceptModal'
import ScheduleVersionModal from '../components/ScheduleVersionModal'

export default function FinancePage() {
  // Primitive selectors only (no objects) to avoid re-renders causing loops
  const page = useFinancialConceptsStore(s=>s.page)
  const pageSize = useFinancialConceptsStore(s=>s.pageSize)
  const filters = useFinancialConceptsStore(s=>s.filters)
  const dirty = useFinancialConceptsStore(s=>s.dirty)
  const fetchList = useFinancialConceptsStore(s=>s.fetchList)
  const loading = useFinancialConceptsStore(s=>s.loading)
  const error = useFinancialConceptsStore(s=>s.error)

  // Single effect for data fetching
  useEffect(()=>{
    fetchList()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[page, pageSize, filters.status, filters.periodicity, filters.conceptType, filters.search, dirty])

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-800">Gestión Financiera</h1>
        <p className="text-sm text-slate-500">Configuración de conceptos (expensas, multas, otros) y sus versiones.</p>
      </header>

      <section className="space-y-4">
        <ConceptsToolbar />
        {error && <div className="text-sm text-red-600">{error}</div>}
        <ConceptsTable />
        {loading && <div className="text-xs text-slate-500">Cargando...</div>}
      </section>

      {/* Modals */}
      <ConceptModal />
      <ScheduleVersionModal />
    </div>
  )
}
