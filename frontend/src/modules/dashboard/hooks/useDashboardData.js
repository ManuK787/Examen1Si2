import { useEffect, useState, useCallback } from 'react'
import {
  fetchSummary,
  fetchIncidents,
  fetchMaintenance,
  fetchReservations,
  fetchIncomeExpense,
  fetchOccupancy
} from '../services/dashboardService'

const initialState = {
  summary: {
    residents: 0,
    delinquencyPercent: 0,
    delinquencyAmount: 0,
    incomeMonth: 0,
    reservationsToday: 0
  },
  incidents: [],
  maintenance: [],
  reservations: [],
  incomeExpense: { months: [], income: [], expense: [] },
  occupancy: { areas: [] }
}

export function useDashboardData() {
  const [data, setData] = useState(initialState)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [summary, incidents, maintenance, reservations, incomeExpense, occupancy] = await Promise.all([
        fetchSummary(),
        fetchIncidents(),
        fetchMaintenance(),
        fetchReservations(),
        fetchIncomeExpense(),
        fetchOccupancy()
      ])
      setData({ summary, incidents, maintenance, reservations, incomeExpense, occupancy })
    } catch (e) {
      setError(e.message || 'Error cargando dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const occupancyAreas = data.occupancy?.areas || []
  const occupancyAverage = occupancyAreas.length
    ? Math.round(occupancyAreas.reduce((acc, a) => acc + (a.percent || 0), 0) / occupancyAreas.length)
    : 0

  return { ...data, occupancyAverage, loading, error, reload: load }
}
