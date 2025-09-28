import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LayoutDashboard, User, Menu, ChevronLeft, Users, Wallet, CalendarCheck, Shield, Wrench, BarChart3, MessageSquareMore, LogOut, Car, Home } from 'lucide-react'

export default function Sidebar({ collapsed = false, onToggle }) {
  const logout = useAuthStore(s => s.logout)
  const user = useAuthStore(s => s.user)
  const linkBase = 'flex items-center gap-2 px-4 py-2 rounded transition-colors text-sm font-medium text-white hover:bg-white/10'
  const labelBase = 'whitespace-nowrap origin-left transition-all duration-200 text-white'
  // Mantener altura estable: usamos opacity + width/scale para no empujar iconos
  const labelVisible = 'opacity-100 translate-y-0 w-auto scale-100'
  const labelHidden = 'opacity-0 w-0 scale-95 pointer-events-none'
     const linkActive = 'bg-white/15 text-white'
  return (
  <aside className={`group relative ${collapsed ? 'w-16' : 'w-60'} bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white border-r border-slate-800 flex flex-col pt-4 h-screen overflow-y-auto overflow-x-hidden transition-[width] duration-300`}>
  <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-2 mb-4`}>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-wide text-white">Menú</span>
        )}
        <button
          onClick={onToggle}
          className={`rounded-md border border-slate-600 hover:bg-white/10 text-white flex items-center justify-center transition-colors ${collapsed ? 'w-10 h-10' : 'w-8 h-8'}`}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
  <nav className="flex flex-col gap-1 flex-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''} ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Dashboard' : undefined}
        >
          <LayoutDashboard size={18} className="shrink-0 text-white" />
          <span className={`${labelBase} ${collapsed ? labelHidden : labelVisible} overflow-hidden`}>Dashboard</span>
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''} ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Mi perfil' : undefined}
        >
          <User size={18} className="shrink-0 text-white" />
          <span className={`${labelBase} ${collapsed ? labelHidden : labelVisible} overflow-hidden`}>Mi perfil</span>
        </NavLink>
        <NavLink
          to="/users"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''} ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Gestión de Usuarios' : undefined}
        >
          <Users size={18} className="shrink-0 text-white" />
          <span className={`${labelBase} ${collapsed ? labelHidden : labelVisible} overflow-hidden`}>Gestión de Usuarios</span>
        </NavLink>
        <NavLink
          to="/vehiculos"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''} ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Gestión de Vehículos' : undefined}
        >
          <Car size={18} className="shrink-0 text-white" />
          <span className={`${labelBase} ${collapsed ? labelHidden : labelVisible} overflow-hidden`}>Gestión de Vehículos</span>
        </NavLink>
        <NavLink
          to="/propiedades"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''} ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Gestión de Propiedades' : undefined}
        >
          <Home size={18} className="shrink-0 text-white" />
          <span className={`${labelBase} ${collapsed ? labelHidden : labelVisible} overflow-hidden`}>Gestión de Propiedades</span>
        </NavLink>
        <NavLink
          to="/finance"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''} ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Gestión Financiera' : undefined}
        >
          <Wallet size={18} className="shrink-0 text-white" />
          <span className={`${labelBase} ${collapsed ? labelHidden : labelVisible} overflow-hidden`}>Gestión Financiera</span>
        </NavLink>
        <NavLink
          to="/areas-comunes"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''} ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Áreas Comunes' : undefined}
        >
          <CalendarCheck size={18} className="shrink-0 text-white" />
          <span className={`${labelBase} ${collapsed ? labelHidden : labelVisible} overflow-hidden`}>Gestión de Áreas Comunes</span>
        </NavLink>
        <NavLink
          to="/reservas-areas"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''} ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Reservas de Áreas' : undefined}
        >
          <CalendarCheck size={18} className="shrink-0 text-white" />
          <span className={`${labelBase} ${collapsed ? labelHidden : labelVisible} overflow-hidden`}>Reservas de Áreas</span>
        </NavLink>
        <NavLink
          to="/seguridad"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''} ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Seguridad (IA)' : undefined}
        >
          <Shield size={18} className="shrink-0 text-white" />
          <span className={`${labelBase} ${collapsed ? labelHidden : labelVisible} overflow-hidden`}>Seguridad (IA)</span>
        </NavLink>
        <NavLink
          to="/mantenimiento"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''} ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Mantenimiento' : undefined}
        >
          <Wrench size={18} className="shrink-0 text-white" />
          <span className={`${labelBase} ${collapsed ? labelHidden : labelVisible} overflow-hidden`}>Mantenimiento</span>
        </NavLink>
        <NavLink
          to="/reportes"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''} ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Reportes y Analítica' : undefined}
        >
          <BarChart3 size={18} className="shrink-0 text-white" />
          <span className={`${labelBase} ${collapsed ? labelHidden : labelVisible} overflow-hidden`}>Reportes y Analítica</span>
        </NavLink>
        <NavLink
          to="/comunicacion"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''} ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Comunicación' : undefined}
        >
          <MessageSquareMore size={18} className="shrink-0 text-white" />
          <span className={`${labelBase} ${collapsed ? labelHidden : labelVisible} overflow-hidden`}>Comunicación</span>
        </NavLink>
      </nav>
      <div className="mt-auto px-2 pb-4">
        <button
          onClick={logout}
          title={collapsed ? 'Cerrar sesión' : undefined}
          className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-2 py-2 rounded bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors`}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
        {!collapsed && user && (
          <p className="mt-2 text-[11px] text-white/60 px-1 truncate">{user.name}</p>
        )}
      </div>
    </aside>
  )
}
