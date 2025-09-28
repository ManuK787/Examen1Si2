import { useState } from 'react'
import { useAuthStore } from '../../../app/store/authStore'
import { authService } from '../../auth/services/authService'
import { User, Mail, Phone, CalendarClock, Shield, Edit3, X, Save, KeyRound } from 'lucide-react'

function InfoItem({ icon:Icon, label, value }){
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-800/10 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">{label}</p>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{value || '—'}</p>
      </div>
    </div>
  )
}

export default function ProfilePage(){
  const { user, updateUser } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  const onPwChange = e => {
    const { name, value } = e.target
    setPwForm(f => ({ ...f, [name]: value }))
  }

  const submitPassword = async (e) => {
    e.preventDefault()
    setPwError(null)
    setPwSuccess(false)
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError('La confirmación no coincide')
      return
    }
    setPwSaving(true)
    try {
      await authService.updatePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      setPwSuccess(true)
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
      setTimeout(() => setShowPasswordModal(false), 1200)
    } catch (err) {
      setPwError(err.message || 'Error al cambiar contraseña')
    } finally {
      setPwSaving(false)
    }
  }

  const onChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const cancel = () => {
    setForm({ name: user?.name || '', phone: user?.phone || '' })
    setError(null)
    setEditing(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const { user: updated } = await authService.updateProfile({ name: form.name.trim(), phone: form.phone.trim() })
      updateUser(updated)
      setEditing(false)
    } catch (err) {
      setError(err.message || 'Error al guardar cambios')
    } finally {
      setSaving(false)
    }
  }

  // Derivaciones seguras
  const registeredDate = user?.registeredAt ? new Date(user.registeredAt) : null
  const registeredStr = registeredDate ? registeredDate.toLocaleDateString() : '—'

  return (
  <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-end sm:justify-between gap-6 pb-2">
        <div className="space-y-2 pt-2 sm:pt-0">
          <p className="inline-block text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-wide bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-md border border-slate-300 dark:border-slate-600 shadow-sm">
            Gestión de tu información personal.
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white leading-tight">
            {user?.name || 'Usuario'}
          </p>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ID #{user?.id ?? '—'}</p>
        </div>
        <div className="flex items-center justify-start sm:justify-end">
          <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-gradient-to-br from-slate-700 via-slate-900 to-black flex items-center justify-center text-slate-200 shadow-lg ring-2 ring-slate-800/60 overflow-hidden">
            <span className="text-4xl sm:text-5xl font-bold select-none tracking-tight">{(user?.name || 'A')[0]}</span>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Col principal info */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-300/60 dark:border-slate-700/70 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 dark:from-slate-900/90 dark:via-slate-800/80 dark:to-black/90 backdrop-blur-md shadow-sm p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2"><User size={16}/> Información básica</h3>
              <div className="flex gap-2">
                {!editing && (
                  <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-slate-700/60 hover:bg-slate-600 text-slate-100 transition">
                    <Edit3 size={14}/> Editar
                  </button>
                )}
                {editing && (
                  <>
                    <button onClick={cancel} type="button" className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-slate-600/60 hover:bg-slate-500 text-slate-100 transition">
                      <X size={14}/> Cancelar
                    </button>
                    <button form="profile-edit-form" type="submit" disabled={saving} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition">
                      <Save size={14}/> {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                  </>
                )}
              </div>
            </div>
            {!editing && (
              <div className="grid sm:grid-cols-2 gap-x-6">
                <InfoItem icon={User} label="Nombre completo" value={user?.name} />
                <InfoItem icon={Mail} label="Correo" value={user?.email} />
                <InfoItem icon={Phone} label="Teléfono" value={user?.phone} />
                <InfoItem icon={CalendarClock} label="Fecha de registro" value={registeredStr} />
                <InfoItem icon={Shield} label="Roles" value={user?.roles?.join(', ')} />
              </div>
            )}
            {editing && (
              <form id="profile-edit-form" onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300">Nombre completo</label>
                  <input name="name" value={form.name} onChange={onChange} className="bg-slate-800/70 rounded-md px-3 py-2 text-sm text-slate-100 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/60" placeholder="Tu nombre" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300">Teléfono</label>
                  <input name="phone" value={form.phone} onChange={onChange} className="bg-slate-800/70 rounded-md px-3 py-2 text-sm text-slate-100 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/60" placeholder="+591..." />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300">Correo (solo lectura)</label>
                  <input value={user?.email || ''} disabled className="bg-slate-800/40 rounded-md px-3 py-2 text-sm text-slate-400 border border-slate-700/70" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300">Roles</label>
                  <input value={user?.roles?.join(', ') || ''} disabled className="bg-slate-800/40 rounded-md px-3 py-2 text-sm text-slate-400 border border-slate-700/70" />
                </div>
                {error && <div className="sm:col-span-2 text-xs text-rose-400 bg-rose-900/30 border border-rose-600/50 px-3 py-2 rounded-md">{error}</div>}
              </form>
            )}
          </div>

          {/* Bloque informativo removido según solicitud */}
        </div>

        {/* Aside / resumen */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-700/70 bg-slate-900/80 backdrop-blur-md shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">Resumen</h3>
            <ul className="space-y-2 text-xs text-slate-300/90">
              <li><span className="font-medium text-slate-200">Estado:</span> Activo</li>
              <li><span className="font-medium text-slate-200">Rol principal:</span> {user?.roles?.[0] || '—'}</li>
              <li><span className="font-medium text-slate-200">Email verificado:</span> Sí (mock)</li>
              <li><span className="font-medium text-slate-200">Último acceso:</span> Hace 5 min (mock)</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-700/70 bg-gradient-to-br from-slate-800 via-slate-900 to-black text-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">Acciones rápidas</h3>
            <div className="flex flex-col gap-2">
              <button onClick={() => setEditing(true)} className="group inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-700/40 hover:bg-slate-600/60 text-xs font-medium transition">
                <Edit3 size={14} className="text-slate-300 group-hover:text-white"/> Editar perfil
              </button>
              <button onClick={() => setShowPasswordModal(true)} className="group inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-700/40 hover:bg-slate-600/60 text-xs font-medium transition">
                <KeyRound size={14} className="text-slate-300 group-hover:text-white"/> Cambiar contraseña
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal cambio contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => !pwSaving && setShowPasswordModal(false)} />
          <div className="relative w-full max-w-sm rounded-xl border border-slate-700/70 bg-slate-900/90 p-6 space-y-5 shadow-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2"><KeyRound size={16}/> Cambiar contraseña</h4>
              <button onClick={() => !pwSaving && setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-200 transition" aria-label="Cerrar">
                <X size={16}/>
              </button>
            </div>
            <form onSubmit={submitPassword} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-slate-300">Contraseña actual</label>
                <input type="password" name="currentPassword" value={pwForm.currentPassword} onChange={onPwChange} className="w-full bg-slate-800/70 rounded-md px-3 py-2 text-slate-100 border border-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500" required />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-slate-300">Nueva contraseña</label>
                <input type="password" name="newPassword" value={pwForm.newPassword} onChange={onPwChange} className="w-full bg-slate-800/70 rounded-md px-3 py-2 text-slate-100 border border-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500" required />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-slate-300">Confirmar nueva contraseña</label>
                <input type="password" name="confirm" value={pwForm.confirm} onChange={onPwChange} className="w-full bg-slate-800/70 rounded-md px-3 py-2 text-slate-100 border border-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500" required />
              </div>
              {pwError && <div className="text-rose-400 bg-rose-900/30 border border-rose-600/40 px-3 py-2 rounded-md">{pwError}</div>}
              {pwSuccess && <div className="text-emerald-300 bg-emerald-900/30 border border-emerald-600/40 px-3 py-2 rounded-md">Contraseña actualizada</div>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" disabled={pwSaving} onClick={() => setShowPasswordModal(false)} className="px-3 py-2 text-xs rounded-md bg-slate-700/60 hover:bg-slate-600 text-slate-200 disabled:opacity-50">Cancelar</button>
                <button type="submit" disabled={pwSaving} className="px-3 py-2 text-xs rounded-md bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50">{pwSaving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
