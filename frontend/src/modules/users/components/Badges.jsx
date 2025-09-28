import React from 'react'

export function StatusBadge({ status }) {
  const map = {
    Activo: 'bg-emerald-600/15 text-emerald-700 border-emerald-600/30',
    Inactivo: 'bg-slate-500/15 text-slate-600 border-slate-400/30'
  }
  const cls = map[status] || map.Inactivo
  return <span className={`text-[11px] inline-flex items-center font-medium px-2 py-0.5 rounded-md border ${cls}`}>{status}</span>
}

export function RoleBadge({ role }) {
  const map = {
    Administrador: 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white',
    Residente: 'bg-slate-700 text-slate-200',
    Personal: 'bg-slate-600/60 text-slate-200'
  }
  const cls = map[role] || 'bg-slate-600/60 text-slate-200'
  return <span className={`text-[11px] inline-flex items-center font-semibold px-2 py-0.5 rounded-md ${cls}`}>{role}</span>
}
