import { useAuthStore } from '../store/authStore'
import { useLocation, Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

// Mapeo sencillo de segmento raíz -> título legible
const SECTION_TITLES = {
  dashboard: 'Dashboard',
  profile: 'Mi Perfil',
  users: 'Gestión de Usuarios',
  finance: 'Gestión Financiera',
  'areas-comunes': 'Áreas Comunes',
  seguridad: 'Seguridad (IA)',
  mantenimiento: 'Mantenimiento',
  reportes: 'Reportes y Analítica',
  comunicacion: 'Comunicación',
  configuracion: 'Configuración'
}

// (Se elimina RoleBadge según nueva especificación)

export default function TopBar({ onMenuClick, isSidebarOpen }) {
  const user = useAuthStore(s => s.user)
  const location = useLocation()
  // Tomar primer segmento (después de /)
  const segment = location.pathname.split('/').filter(Boolean)[0] || 'dashboard'
  const sectionTitle = SECTION_TITLES[segment] || 'Dashboard'

  // Derivar iniciales para avatar simple
  const initials = (user?.name || 'Invitado')
    .split(/\s+/)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('')

  // Rol forzado ya no se muestra visualmente
  return (
    <header className="sticky top-0 z-30 h-14 backdrop-blur bg-white/70 border-b border-slate-200/70 flex items-center px-2 sm:px-4">
      {/* Botón menú móvil */}
      <div className="md:hidden pr-2">
        <button
          type="button"
          aria-label="Abrir menú"
            onClick={onMenuClick}
          className="w-10 h-10 inline-flex items-center justify-center rounded-md bg-slate-900 text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400/50 transition shadow-sm"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {/* Logo + título de sección */}
      <div className="flex items-center gap-3 min-w-0">
  <Link to="/dashboard" aria-label="Ir al Dashboard" className="focus:outline-none focus:ring-0 rounded">
          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center font-bold text-white text-sm shadow-sm">
            SC
          </div>
        </Link>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-xs font-medium tracking-wider text-slate-500 uppercase">Sección</span>
          <h1 className="text-sm sm:text-base font-semibold text-slate-800 truncate">{sectionTitle}</h1>
        </div>
      </div>

      {/* Lado derecho: usuario + rol */}
      <div className="ml-auto flex items-center">
  <Link to="/profile" className="group flex items-center gap-2 focus:outline-none focus:ring-0 rounded-sm pr-0">
          <span className="text-sm font-medium text-slate-700 max-w-[160px] truncate group-hover:text-slate-900 transition-colors hidden sm:inline">{user?.name || 'Invitado'}</span>
          <div className="w-9 h-9 rounded-full bg-slate-800 group-hover:bg-slate-700 text-white flex items-center justify-center text-[11px] font-semibold ring-2 ring-white shadow-sm select-none transition-colors" title={user?.name || 'Invitado'}>
            {initials}
          </div>
        </Link>
      </div>
    </header>
  )
}
