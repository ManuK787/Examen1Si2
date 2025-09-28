import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import MainLayout from '../layout/MainLayout'
import HomePage from '../../modules/auth/pages/HomePage'
import LoginPage from '../../modules/auth/pages/LoginPage'
import RegisterPage from '../../modules/auth/pages/RegisterPage'
import DashboardPage from '../../modules/dashboard/pages/DashboardPage'
import ProfilePage from '../../modules/profile/pages/ProfilePage'
import UsersPage from '../../modules/users/pages/UsersPage'
import FinancePage from '../../modules/finance/pages/FinancePage'
import AreasComunesPage from '../../modules/areasComunes/pages/AreasComunesPage'
import SeguridadPage from '../../modules/seguridad/pages/SeguridadPage'
import MantenimientoPage from '../../modules/mantenimiento/pages/MantenimientoPage'
import ReportesPage from '../../modules/reportes/pages/ReportesPage'
import ComunicacionPage from '../../modules/comunicacion/pages/ComunicacionPage'
import ConfiguracionPage from '../../modules/configuracion/pages/ConfiguracionPage'
import VehiclesPage from '../../modules/vehiculos/pages/VehiclesPage'
import PropertiesPage from '../../modules/propiedades/pages/PropertiesPage'
import ReservasAreasPage from '../../modules/reservasAreas/pages/ReservasAreasPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}> 
        <Route element={<MainLayout />}> 
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/areas-comunes" element={<AreasComunesPage />} />
          <Route path="/seguridad" element={<SeguridadPage />} />
          <Route path="/mantenimiento" element={<MantenimientoPage />} />
          <Route path="/reportes" element={<ReportesPage />} />
          <Route path="/comunicacion" element={<ComunicacionPage />} />
          <Route path="/configuracion" element={<ConfiguracionPage />} />
          <Route path="/vehiculos" element={<VehiclesPage />} />
          <Route path="/propiedades" element={<PropertiesPage />} />
          <Route path="/reservas-areas" element={<ReservasAreasPage />} />
        </Route>
      </Route>
      <Route path="*" element={<div style={{padding:40}}>404 - No encontrado</div>} />
    </Routes>
  )
}
