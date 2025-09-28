import LoginForm from '../components/LoginForm'
import { useAuthStore } from '../../../app/store/authStore'
import { Navigate } from 'react-router-dom'

export default function LoginPage(){
  const token = useAuthStore(s=>s.token)
  if (token) return <Navigate to="/dashboard" replace />
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-sm card">
        <h2 className="text-xl font-semibold mb-6 text-slate-800">Ingresar</h2>
        <LoginForm />
      </div>
    </div>
  )
}
