import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/authStore'
import RegisterForm from '../components/RegisterForm'

export default function RegisterPage() {
  const navigate = useNavigate()
  const token = useAuthStore(s => s.token)

  useEffect(() => {
    if (token) navigate('/dashboard')
  }, [token, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-50">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-2 text-slate-800">Crear cuenta</h1>
        <p className="text-xs text-center text-slate-500 mb-6">Completa los datos para comenzar</p>
        <RegisterForm />
      </div>
    </div>
  )
}
