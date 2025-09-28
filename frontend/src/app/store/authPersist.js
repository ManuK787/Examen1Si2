// Auth persistence helper (placeholder)
// Activación controlada por variable de entorno: VITE_AUTH_PERSIST=true
// No se invoca automáticamente para evitar efectos en el examen hasta que el backend esté listo.

import { useAuthStore } from './authStore'

const STORAGE_KEY = 'auth_v1'
const SHOULD_PERSIST = (import.meta.env.VITE_AUTH_PERSIST ?? 'false') === 'true'

// Decodifica un JWT simple para obtener exp (si existe). No falla si no es JWT.
function decodeJWT(token) {
  try {
    const [, payload] = token.split('.')
    return JSON.parse(atob(payload))
  } catch { return null }
}

export function loadPersistedAuth() {
  if (!SHOULD_PERSIST) return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed.token) return null
    // Validar expiración si hay claim exp en segundos
    const info = decodeJWT(parsed.token)
    if (info?.exp && info.exp * 1000 < Date.now()) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function saveAuth() {
  if (!SHOULD_PERSIST) return
  const { user, token, refreshToken } = useAuthStore.getState()
  if (!token) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  const data = { user, token, refreshToken, savedAt: Date.now() }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

export function initAuthPersistence() {
  if (!SHOULD_PERSIST) return
  const cached = loadPersistedAuth()
  if (cached) {
    const { user, token, refreshToken } = cached
    useAuthStore.getState().login(user, token, refreshToken)
  }
  // Suscripción para guardar en cada cambio relevante
  let prev = null
  useAuthStore.subscribe(state => {
    const snapshot = JSON.stringify({ user: state.user, token: state.token, refreshToken: state.refreshToken })
    if (snapshot !== prev) {
      prev = snapshot
      saveAuth()
    }
  })
}

/* Cómo activarlo cuando el backend esté listo:
1. En .env: VITE_AUTH_PERSIST=true
2. En main.jsx (después de importar estilos y antes de render):
   import { initAuthPersistence } from './app/store/authPersist'
   initAuthPersistence()
3. (Opcional) Forzar un /auth/me si deseas refrescar datos del usuario real.
*/
