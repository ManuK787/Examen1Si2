import { http } from '../../../services/httpClient'

// Endpoints stub (ajustar cuando backend defina rutas reales)
// Se asume convención posible:
//  - /dashboard/summary  -> { residents, delinquencyPercent, delinquencyAmount, incomeMonth, reservationsToday }
//  - /dashboard/incidents -> [{ id, title, time, status }]
//  - /dashboard/maintenance -> [{ id, title, priority }]
//  - /dashboard/reservations -> [{ id, area, start, end, user }]
//  - /dashboard/income-expense -> { months: [...], income: [...], expense: [...] }
//  - /dashboard/occupancy -> { areas: [{ name, percent }] }

export async function fetchSummary() {
  try {
    return await http.get('/dashboard/summary')
  } catch (e) {
    return {
      residents: 0,
      delinquencyPercent: 0,
      delinquencyAmount: 0,
      incomeMonth: 0,
      reservationsToday: 0
    }
  }
}

export async function fetchIncidents() {
  try { return await http.get('/dashboard/incidents') } catch { return [] }
}

export async function fetchMaintenance() {
  try { return await http.get('/dashboard/maintenance') } catch { return [] }
}

export async function fetchReservations() {
  try { return await http.get('/dashboard/reservations') } catch { return [] }
}

export async function fetchIncomeExpense() {
  try { return await http.get('/dashboard/income-expense') } catch { return { months: [], income: [], expense: [] } }
}

export async function fetchOccupancy() {
  try { return await http.get('/dashboard/occupancy') } catch { return { areas: [] } }
}
