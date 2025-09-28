import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { RoleBadge, StatusBadge } from './Badges'

export function UserDetailModal({ open, user, onClose }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open || !user) return null

  const rows = [
    { label: 'Nombre completo', value: user.fullName },
    { label: 'Email', value: user.email },
    { label: 'Teléfono', value: user.phone || '—' },
    { label: 'CI', value: user.ci },
    { label: 'Rol', value: <RoleBadge role={user.role} /> },
    { label: 'Estado', value: <StatusBadge status={user.status} /> },
    ...(user.role === 'Residente' ? [
      { label: 'Bloque', value: user.bloque || '—' },
      { label: 'Nro Casa / Terreno', value: user.casa || '—' },
      { label: 'Tipo', value: user.residencyType ? (user.residencyType === 'propietario' ? 'Propietario' : 'Inquilino') : '—' }
    ] : []),
    { label: 'Registrado', value: new Date(user.registeredAt).toLocaleString() },
    { label: 'Último acceso', value: user.lastAccessAt ? new Date(user.lastAccessAt).toLocaleString() : '—' }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mt-8 md:mt-0 mb-10 md:mb-0 rounded-2xl border border-slate-700/70 bg-slate-900/90 backdrop-blur p-6 shadow-xl flex flex-col max-h-[85vh]" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between mb-4 flex-none">
          <h2 className="text-lg font-semibold text-slate-100">Detalle de Usuario</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200" aria-label="Cerrar"><X size={20}/></button>
        </div>
        <div className="space-y-4 text-sm overflow-y-auto pr-2 custom-scrollbar flex-1">
          {rows.map(r => (
            <div key={r.label} className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">{r.label}</span>
              <div className="text-slate-100 font-medium break-all">{r.value}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4 flex-none border-t border-slate-700/60 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-xs rounded-md bg-slate-700/60 hover:bg-slate-600 text-slate-200">Cerrar</button>
        </div>
      </div>
    </div>
  )
}
