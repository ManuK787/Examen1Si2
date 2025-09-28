import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/authStore'

export default function HomePage() {
  const navigate = useNavigate()
  const token = useAuthStore(s => s.token)

  useEffect(() => {
    if (token) navigate('/dashboard')
  }, [token, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-slate-50">
      <div className="max-w-lg space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-slate-800">Bienvenido a <span className="text-brand-600">Smart Condominium</span></h1>
        <p className="text-slate-600">Gestión centralizada y moderna para la administración eficiente de tu condominio.</p>
        <div className="flex items-center justify-center gap-4 pt-2 flex-wrap">
          <Link to="/login" className="btn">Iniciar sesión</Link>
          <Link to="/register" className="btn-outline">Registrarse</Link>
        </div>
      </div>
    </div>
  )
}
