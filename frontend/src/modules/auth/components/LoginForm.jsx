import { useState } from 'react'
import { useAuthStore } from '../../../app/store/authStore'
import { authService } from '../services/authService'
import { useNavigate, Link } from 'react-router-dom'

export default function LoginForm(){
  const login = useAuthStore(s=>s.login)
  const navigate = useNavigate()
  const [form, setForm] = useState({ identifier: '', password: '' }) // identifier = email o usuario
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const disabled = !form.identifier || !form.password || loading

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const onSubmit = async e => {
    e.preventDefault()
    // Validación simple: permitir email o usuario (si contiene @ lo tratamos como email)
    if (form.identifier.includes('@') && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.identifier)) {
      setError('Email inválido'); return
    }
    setError(''); setLoading(true)
    try {
      // Adaptar al backend en futuro: authService.login({ identifier, password })
      const { user, token } = await authService.login({ email: form.identifier, password: form.password })
      login(user, token)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Error de autenticación')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" autoComplete="off" noValidate>
      <div className="space-y-1">
        <label htmlFor="identifier" className="block text-sm font-medium text-slate-600">Email o Usuario</label>
        <input
          id="identifier"
          name="identifier"
          value={form.identifier}
          onChange={onChange}
          placeholder="usuario o correo@dominio.com"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-brand-dark"
          autoComplete="username"
          aria-required="true"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium text-slate-600">Contraseña</label>
        <div className="relative">
          <input
            id="password"
            type={showPwd ? 'text' : 'password'}
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="••••••"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-brand-dark"
            autoComplete="current-password"
            aria-required="true"
          />
          <button
            type="button"
            onClick={() => setShowPwd(p => !p)}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-xs text-slate-500 hover:text-brand-dark"
            aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPwd ? 'Ocultar' : 'Ver'}
          </button>
        </div>
      </div>
      {error && (
        <div className="text-red-600 text-xs" role="alert" aria-live="assertive">{error}</div>
      )}
      <div className="flex items-center justify-between text-xs">
        <Link to="/forgot" className="text-brand-dark hover:text-brand-accent underline underline-offset-2">¿Olvidaste tu contraseña?</Link>
        <Link to="/register" className="text-brand-dark hover:text-brand-accent underline underline-offset-2">Registrarse</Link>
      </div>
      <button
        type="submit"
        disabled={disabled}
        aria-disabled={disabled}
        className="btn w-full disabled:cursor-not-allowed relative"
      >
        {loading && (
          <span className="absolute left-3 inline-block w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" aria-hidden="true" />
        )}
        {loading ? 'Procesando...' : 'Iniciar Sesión'}
      </button>
    </form>
  )
}
