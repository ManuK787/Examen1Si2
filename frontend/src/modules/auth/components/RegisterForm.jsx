import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../app/store/authStore'
import { authService } from '../services/authService'
import { useNavigate, Link } from 'react-router-dom'

const initial = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirm: '',
  accept: false
}

function passwordStrength(pw){
  if(!pw) return { score:0, label:'Vacía', color:'#c3b199' }
  let score = 0
  if(pw.length >= 8) score++
  if(/[A-Z]/.test(pw)) score++
  if(/[a-z]/.test(pw)) score++
  if(/[0-9]/.test(pw)) score++
  if(/[^A-Za-z0-9]/.test(pw)) score++
  const labels = ['Muy débil','Débil','Regular','Buena','Fuerte','Excelente']
  const colors = ['#e8373e','#e05a3a','#d1a134','#8aac3a','#3a8a5a','#2d6f3a']
  return { score, label: labels[score], color: colors[score] }
}

export default function RegisterForm(){
  const login = useAuthStore(s=>s.login)
  const navigate = useNavigate()
  const [form,setForm] = useState(initial)
  const [errors,setErrors] = useState({})
  const [loading,setLoading] = useState(false)
  const [touched,setTouched] = useState({})
  const strength = passwordStrength(form.password)

  const validate = (f = form) => {
    const e = {}
    if(!f.fullName.trim()) e.fullName = 'Requerido'
    if(!f.email) e.email = 'Requerido'
    else if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) e.email = 'Email inválido'
    if(f.phone && !/^\+?[0-9\-\s]{7,20}$/.test(f.phone)) e.phone = 'Teléfono inválido'
    if(!f.password) e.password = 'Requerido'
    else if(f.password.length < 8) e.password = 'Mínimo 8 caracteres'
    if(!f.confirm) e.confirm = 'Requerido'
    else if(f.confirm !== f.password) e.confirm = 'No coincide'
    if(!f.accept) e.accept = 'Debes aceptar' // placeholder semántico
    return e
  }

  useEffect(()=>{ setErrors(validate(form)) }, [form.password, form.confirm, form.email, form.fullName, form.phone, form.accept])

  const onChange = e => {
    const { name, type, checked, value } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }
  const onBlur = e => setTouched(t => ({ ...t, [e.target.name]: true }))

  const canSubmit = Object.keys(validate()).length === 0 && !loading

  const onSubmit = async e => {
    e.preventDefault()
    const currentErrors = validate()
    setErrors(currentErrors)
    setTouched({ fullName:true, email:true, phone:true, password:true, confirm:true, accept:true })
    if(Object.keys(currentErrors).length) return
    setLoading(true)
    try {
      const { user, token } = await authService.register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password
      })
      login(user, token)
      navigate('/dashboard')
    } catch (err) {
      setErrors(prev => ({ ...prev, global: err.message || 'Error al registrar' }))
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {errors.global && <div className="text-red-600 text-sm" role="alert">{errors.global}</div>}
      <div className="grid gap-4">
        <div className="space-y-1">
          <label htmlFor="fullName" className="text-sm font-medium text-slate-600">Nombre completo *</label>
          <input id="fullName" name="fullName" value={form.fullName} onChange={onChange} onBlur={onBlur} placeholder="Juan Pérez"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-brand-dark border-slate-300" />
          {touched.fullName && errors.fullName && <p className="text-xs text-red-600">{errors.fullName}</p>}
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-slate-600">Email *</label>
          <input id="email" type="email" name="email" value={form.email} onChange={onChange} onBlur={onBlur} placeholder="correo@dominio.com"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-brand-dark border-slate-300" />
          {touched.email && errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
        </div>
        <div className="space-y-1">
          <label htmlFor="phone" className="text-sm font-medium text-slate-600">Teléfono</label>
          <input id="phone" name="phone" value={form.phone} onChange={onChange} onBlur={onBlur} placeholder="Ej: +591 70000000"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-brand-dark border-slate-300" />
          {touched.phone && errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-slate-600">Contraseña *</label>
          <input id="password" type="password" name="password" value={form.password} onChange={onChange} onBlur={onBlur} placeholder="••••••••"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-brand-dark border-slate-300" />
          <div className="flex items-center gap-2 mt-1">
            <div className="h-2 flex-1 rounded bg-slate-200 overflow-hidden">
              <div className="h-full transition-all" style={{ width: `${(strength.score/5)*100}%`, background: strength.color }} />
            </div>
            <span className="text-[10px] font-medium" style={{ color: strength.color }}>{strength.label}</span>
          </div>
          {touched.password && errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
        </div>
        <div className="space-y-1">
          <label htmlFor="confirm" className="text-sm font-medium text-slate-600">Confirmar contraseña *</label>
          <input id="confirm" type="password" name="confirm" value={form.confirm} onChange={onChange} onBlur={onBlur} placeholder="Repite la contraseña"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-brand-dark border-slate-300" />
          {touched.confirm && errors.confirm && <p className="text-xs text-red-600">{errors.confirm}</p>}
        </div>
        <div className="flex items-center gap-2 pt-2">
          <input id="accept" name="accept" type="checkbox" checked={form.accept} onChange={onChange} onBlur={onBlur}
            className="w-4 h-4 border-slate-300 rounded focus:ring-brand-dark text-brand-dark" />
          <label htmlFor="accept" className="text-xs text-slate-600 select-none">Acepto <span className="underline">términos y condiciones</span> *</label>
        </div>
        {touched.accept && errors.accept && <p className="text-xs text-red-600 -mt-2">{errors.accept}</p>}
      </div>
      <button type="submit" disabled={!canSubmit} className="btn w-full disabled:opacity-60 disabled:cursor-not-allowed relative">
        {loading && <span className="absolute left-3 inline-block w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>
      <p className="text-xs text-center text-slate-600">¿Ya tienes cuenta? <Link to="/login" className="text-brand-dark hover:text-brand-accent underline">Inicia sesión</Link></p>
    </form>
  )
}
