import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

// Breakpoint helper: match md (Tailwind md = 768px)
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = e => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

export default function MainLayout() {
  const isDesktop = useIsDesktop()
  const [collapsed, setCollapsed] = useState(false) // sólo para escritorio
  const [mobileOpen, setMobileOpen] = useState(false)

  // Cerrar sidebar móvil al pasar a desktop
  useEffect(() => { if (isDesktop) setMobileOpen(false) }, [isDesktop])

  const toggleCollapse = () => setCollapsed(c => !c)
  const toggleMobile = () => setMobileOpen(o => !o)
  const closeMobile = () => setMobileOpen(false)

  // Body scroll lock para sidebar móvil
  useEffect(() => {
    if (mobileOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = originalOverflow }
    }
  }, [mobileOpen])

  return (
    <div className="flex min-h-screen relative">
      {/* Sidebar escritorio fijo (para que no se corte al hacer scroll del contenido) */}
      <div className="hidden md:block sticky top-0 h-screen">
        <Sidebar collapsed={collapsed} onToggle={toggleCollapse} />
      </div>

      {/* Sidebar móvil (off-canvas) */}
  <div className={`md:hidden fixed inset-0 z-40 transition pointer-events-${mobileOpen ? 'auto' : 'none'}`}>        
        {/* Backdrop */}
        <div
          onClick={closeMobile}
          className={`absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        {/* Panel */}
        <div className={`absolute left-0 top-0 h-full transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full">
            <Sidebar collapsed={false} onToggle={closeMobile} />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar onMenuClick={toggleMobile} isSidebarOpen={mobileOpen} />
        <main className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
