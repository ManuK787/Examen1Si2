import React, { useState, useEffect } from 'react'
import { X, RefreshCw, Copy } from 'lucide-react'
import { useUsersStore } from '../store/usersStore'
import { validateEmail, validateFullName, validatePhone, validateCI, validateUnit, passwordScore } from '../services/validation'

// Util simple para generar contraseña
function generatePassword(len=10){
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#%&!'
  return Array.from({length:len}).map(()=>chars[Math.floor(Math.random()*chars.length)]).join('')
}

export function UserModal({ open, onClose, user }) {
  const creating = !user
  const { createUser, updateUser, roles, fetchRoles } = useUsersStore()
  const [loading, setLoading] = useState(false)
  const [autoPassword, setAutoPassword] = useState(true)
  const [generated, setGenerated] = useState(generatePassword())
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    ci: user?.ci || '',
    bloque: user?.bloque || 'B1',
    casa: user?.casa || '',
    residencyType: user?.residencyType || 'propietario',
    role: user?.role || 'Residente',
    status: user?.status || 'Activo',
    password: ''
  })

  // Cargar roles si no están
  useEffect(() => { if (open && roles.length === 0) fetchRoles() }, [open])
  // Generar password si crea
  useEffect(() => { if (open && creating) setGenerated(generatePassword()) }, [open, creating])
  // Reset completo al abrir o cambiar de usuario (crear/editar)
  useEffect(() => {
    if (open) {
      setForm({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        ci: user?.ci || '',
        bloque: user?.bloque || 'B1',
        casa: user?.casa || '',
        residencyType: user?.residencyType || 'propietario',
        role: user?.role || 'Residente',
        status: user?.status || 'Activo',
        password: ''
      })
      setTouched({})
      setFieldErrors({})
      setError(null)
      setAutoPassword(true)
      setGenerated(generatePassword())
    }
  }, [open, user])

  const runFieldValidation = (name, value) => {
    let err = null
    if (name === 'fullName') err = validateFullName(value)
    if (name === 'email') err = validateEmail(value)
    if (name === 'casa') {
      if (form.role === 'Residente') {
        err = validateUnit(value)
      } else {
        err = null
      }
    }
    if (name === 'phone') err = validatePhone(value)
    if (name === 'ci') err = validateCI(value)
    if (name === 'password' && !autoPassword) {
      if (creating && (!value || value.length < 6)) err = 'Contraseña mínimo 6 caracteres'
      if (!creating && value && value.length < 6) err = 'Mínimo 6 caracteres'
    }
    setFieldErrors(fe => ({ ...fe, [name]: err }))
    return err
  }

  const onChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    // Marcar touched para fullName de inmediato si se escribe algo para mostrar feedback tempranamente
    if (name === 'fullName' && !touched.fullName) {
      setTouched(t => ({ ...t, fullName: true }))
    }
    if (touched[name] || name === 'fullName') runFieldValidation(name, value)
  }

  const onBlur = e => {
    const { name, value } = e.target
    setTouched(t => ({ ...t, [name]: true }))
    runFieldValidation(name, value)
  }

  const copyPassword = () => {
    navigator.clipboard.writeText(autoPassword ? generated : form.password)
    setCopied(true)
    setTimeout(()=>setCopied(false), 1500)
  }

  const regenerate = () => {
    setGenerated(generatePassword())
    setCopied(false)
  }

  const validateForm = () => {
    const names = ['fullName','email','ci','phone']
    if (form.role === 'Residente') names.push('casa')
    if (!autoPassword) names.push('password')
    const results = names.map(n => runFieldValidation(n, form[n]))
    const firstError = results.find(e => e)
    return firstError || null
  }

  const submit = async (e) => {
    e.preventDefault()
  const v = validateForm()
    if (v){ setError(v); return }
    setError(null)
    setLoading(true)
    try {
      if (creating) {
        await createUser({ ...form, password: autoPassword ? generated : form.password })
      } else {
        await updateUser(user.id, { ...form, password: undefined })
      }
      onClose()
    } catch (err) {
      setError(err.message || 'Error en la operación')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => !loading && onClose()} />
      <div className="relative w-full max-w-2xl mt-6 md:mt-0 mb-10 md:mb-0 rounded-2xl border border-slate-700/70 bg-slate-900/90 backdrop-blur p-6 shadow-xl space-y-6 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">{creating ? 'Registrar usuario' : 'Editar usuario'}</h2>
          <button onClick={()=>!loading && onClose()} className="text-slate-400 hover:text-slate-200" aria-label="Cerrar"><X size={20}/></button>
        </div>
  <form onSubmit={submit} className="space-y-6 text-sm overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">Nombre completo *</label>
              <input name="fullName" value={form.fullName} onChange={onChange} onBlur={onBlur} className={`bg-slate-800/70 rounded-md px-3 py-2 text-slate-100 border ${fieldErrors.fullName && touched.fullName ? 'border-rose-500 focus:ring-rose-500/50' : 'border-slate-600 focus:ring-emerald-500/50'} focus:outline-none focus:ring-2`} />
              {fieldErrors.fullName && touched.fullName && <p className="text-[11px] text-rose-400">{fieldErrors.fullName}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">Email *</label>
              <input name="email" value={form.email} onChange={onChange} onBlur={onBlur} type="email" className={`bg-slate-800/70 rounded-md px-3 py-2 text-slate-100 border ${fieldErrors.email && touched.email ? 'border-rose-500 focus:ring-rose-500/50' : 'border-slate-600 focus:ring-emerald-500/50'} focus:outline-none focus:ring-2`} />
              {fieldErrors.email && touched.email && <p className="text-[11px] text-rose-400">{fieldErrors.email}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">Teléfono (8 dígitos)</label>
              <input name="phone" value={form.phone} onChange={e=>{
                const v = e.target.value.replace(/[^0-9]/g,'').slice(0,8)
                onChange({ target: { name:'phone', value: v } })
              }} onBlur={onBlur} inputMode="numeric" pattern="\\d{8}" placeholder="Ej: 71234567" className={`bg-slate-800/70 rounded-md px-3 py-2 text-slate-100 border ${fieldErrors.phone && touched.phone ? 'border-rose-500 focus:ring-rose-500/50' : 'border-slate-600 focus:ring-emerald-500/50'} focus:outline-none focus:ring-2`} />
              {fieldErrors.phone && touched.phone && <p className="text-[11px] text-rose-400">{fieldErrors.phone}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">CI *</label>
              <input name="ci" value={form.ci} onChange={e=>{
                const v = e.target.value.replace(/[^0-9]/g,'').slice(0,9)
                onChange({ target: { name:'ci', value: v } })
              }} onBlur={onBlur} inputMode="numeric" pattern="\\d{5,9}" placeholder="5-9 dígitos" className={`bg-slate-800/70 rounded-md px-3 py-2 text-slate-100 border ${fieldErrors.ci && touched.ci ? 'border-rose-500 focus:ring-rose-500/50' : 'border-slate-600 focus:ring-emerald-500/50'} focus:outline-none focus:ring-2`} />
              {fieldErrors.ci && touched.ci && <p className="text-[11px] text-rose-400">{fieldErrors.ci}</p>}
            </div>
            {form.role === 'Residente' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300">Bloque</label>
                  <select name="bloque" value={form.bloque} onChange={onChange} className="bg-slate-800/70 rounded-md px-3 py-2 text-slate-100 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                    {['B1','B2','B3','B4','B5'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300">Nro Casa / Terreno *</label>
                  <input name="casa" value={form.casa} onChange={e=>{
                    const v = e.target.value.replace(/[^0-9]/g,'').slice(0,3)
                    onChange({ target: { name:'casa', value: v } })
                  }} onBlur={onBlur} inputMode="numeric" pattern="\\d{3}" placeholder="Ej: 105" className={`bg-slate-800/70 rounded-md px-3 py-2 text-slate-100 border ${fieldErrors.casa && touched.casa ? 'border-rose-500 focus:ring-rose-500/50' : 'border-slate-600 focus:ring-emerald-500/50'} focus:outline-none focus:ring-2`} />
                  {fieldErrors.casa && touched.casa && <p className="text-[11px] text-rose-400">{fieldErrors.casa}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300">Tipo</label>
                  <select name="residencyType" value={form.residencyType} onChange={onChange} className="bg-slate-800/70 rounded-md px-3 py-2 text-slate-100 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                    <option value="propietario">Propietario</option>
                    <option value="inquilino">Inquilino</option>
                  </select>
                </div>
              </>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">Rol *</label>
              <select name="role" value={form.role} onChange={onChange} className="bg-slate-800/70 rounded-md px-3 py-2 text-slate-100 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">Estado *</label>
              <select name="status" value={form.status} onChange={onChange} className="bg-slate-800/70 rounded-md px-3 py-2 text-slate-100 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                {['Activo','Inactivo'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Datos de acceso</p>
              <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer select-none">
                <input type="checkbox" checked={autoPassword} onChange={e=>setAutoPassword(e.target.checked)} /> Generar automáticamente
              </label>
            </div>
            {autoPassword ? (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-mono bg-slate-800/70 border border-slate-600 rounded-md px-3 py-2 text-emerald-300 select-all overflow-x-auto">{generated}</div>
                  <p className="text-[11px] text-slate-500 mt-1">Se asignará al crear. Recomienda al usuario cambiarla en su primer ingreso.</p>
                </div>
                <div className="flex flex-col gap-2 w-28">
                  <button type="button" onClick={regenerate} className="text-xs inline-flex items-center justify-center gap-1 px-2 py-2 rounded-md bg-slate-700/60 hover:bg-slate-600/60 text-slate-200"><RefreshCw size={14}/> Nueva</button>
                  <button type="button" onClick={copyPassword} className="text-xs inline-flex items-center justify-center gap-1 px-2 py-2 rounded-md bg-slate-700/60 hover:bg-slate-600/60 text-slate-200"><Copy size={14}/>{copied? 'Copiado' : 'Copiar'}</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 max-w-sm">
                <label className="text-xs font-medium text-slate-300">Contraseña {creating && '*'}</label>
                <input name="password" type="password" value={form.password} onChange={onChange} onBlur={onBlur} className={`bg-slate-800/70 rounded-md px-3 py-2 text-slate-100 border ${fieldErrors.password && touched.password ? 'border-rose-500 focus:ring-rose-500/50' : 'border-slate-600 focus:ring-emerald-500/50'} focus:outline-none focus:ring-2`} placeholder="••••••" />
                {(!autoPassword && form.password) && (() => { const ps = passwordScore(form.password); return (
                  <div className="space-y-1">
                    <div className="h-1 w-full bg-slate-700/50 rounded overflow-hidden">
                      <div className={`${ps.score>=4?'bg-emerald-500':ps.score>=3?'bg-emerald-600/70':ps.score>=2?'bg-amber-500':'bg-rose-500'} h-full transition-all`} style={{width: `${(ps.score/5)*100}%`}} />
                    </div>
                    <p className="text-[11px] text-slate-400">Fuerza: <span className="font-medium text-slate-300">{ps.label}</span></p>
                  </div>
                ) })()}
                {fieldErrors.password && touched.password && <p className="text-[11px] text-rose-400">{fieldErrors.password}</p>}
                <p className="text-[11px] text-slate-500">Mínimo 6 caracteres. Usa mayúsculas, números y símbolos para más seguridad.</p>
              </div>
            )}
          </div>

          {error && <div className="text-xs text-rose-400 bg-rose-900/30 border border-rose-600/40 px-3 py-2 rounded-md">{error}</div>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" disabled={loading} onClick={onClose} className="px-4 py-2 text-xs rounded-md bg-slate-700/60 hover:bg-slate-600 text-slate-200 disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={loading || Object.values(fieldErrors).some(e=>e) || !form.fullName || !form.email || !form.ci || (form.role==='Residente' && !form.casa)} className="px-4 py-2 text-xs rounded-md bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 font-semibold">{loading ? 'Guardando...' : (creating ? 'Crear usuario' : 'Guardar cambios')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
