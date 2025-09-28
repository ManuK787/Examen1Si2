import { http } from '../../../services/httpClient'
import { USE_MOCK, ENDPOINTS, normalizeUser } from '../../../services/apiConfig'

export const authService = {
  async login({ email, password }) {
    if (USE_MOCK) {
      if (email === 'admin@test.com' && password === '123') {
        // Datos extendidos para vista de perfil
        return { 
          user: { 
            id: 1, 
            name: 'Administrador', 
            roles: ['ADMIN'], 
            email: 'admin@test.com', 
            phone: '+59170000000', 
            registeredAt: '2024-01-15T10:00:00Z'
          },
          token: 'dev-token',
          refresh: 'dev-refresh-token'
        }
      }
      throw new Error('Credenciales inválidas')
    }
    const data = await http.post(ENDPOINTS.auth.login, { email, password })
    return { user: normalizeUser(data.user), token: data.token, refresh: data.refresh }
  },
  async register({ fullName, email, phone, password }) {
    if (USE_MOCK) {
      // Simulamos retardo
      await new Promise(r => setTimeout(r, 600))
      if (!email.includes('@')) throw new Error('Email inválido')
      return { user: { id: Date.now(), name: fullName || 'Usuario', roles: ['USER'], phone, email, registeredAt: new Date().toISOString() }, token: 'dev-token' }
    }
    const data = await http.post(ENDPOINTS.auth.register, { full_name: fullName, email, phone, password })
    return { user: normalizeUser(data.user), token: data.token }
  },
  async me() {
    if (USE_MOCK) {
      const token = 'dev-token'
      return { 
        user: { 
          id: 1, 
          name: 'Administrador', 
          roles: ['ADMIN'], 
          email: 'admin@test.com', 
          phone: '+59170000000', 
          registeredAt: '2024-01-15T10:00:00Z'
        }, 
        token 
      }
    }
    const data = await http.get(ENDPOINTS.auth.me)
    return { user: normalizeUser(data.user), token: data.token }
  },
  async logout() {
    if (USE_MOCK) return true
    return http.post(ENDPOINTS.auth.logout, {})
  },
  async updateProfile(partial) {
    if (USE_MOCK) {
      // Simular retardo y devolver merge superficial
      await new Promise(r => setTimeout(r, 500))
      // En un escenario real se haría request al backend
      return {
        user: {
          id: 1,
            name: partial.name || 'Administrador',
            roles: ['ADMIN'],
            email: 'admin@test.com',
            phone: partial.phone || '+59170000000',
            registeredAt: '2024-01-15T10:00:00Z'
        }
      }
    }
    const data = await http.patch('/users/me/', partial)
    return { user: normalizeUser(data.user) }
  },
  async updatePassword({ currentPassword, newPassword }) {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 600))
      if (currentPassword !== '123') throw new Error('Contraseña actual incorrecta')
      if (newPassword.length < 6) throw new Error('La nueva contraseña es muy corta')
      return { success: true }
    }
    return http.post(ENDPOINTS.auth.changePassword, { current_password: currentPassword, new_password: newPassword })
  }
}
