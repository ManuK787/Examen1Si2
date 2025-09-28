import { useAuthStore } from '../app/store/authStore'
import { API_BASE_URL, API_TIMEOUT, ENDPOINTS } from './apiConfig'

function buildError(message, info) {
  const err = new Error(message)
  if (info) err.info = info
  return err
}

// Single-flight refresh support
let refreshPromise = null

async function performRefresh() {
  const auth = useAuthStore.getState()
  if (!auth.refreshToken) {
    auth.logout(); throw buildError('Sin refresh token')
  }
  if (!refreshPromise) {
    auth.setRefreshing(true)
    refreshPromise = (async () => {
      try {
        const res = await fetch(API_BASE_URL + ENDPOINTS.auth.refresh, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: auth.refreshToken }),
          credentials: 'include'
        })
        if (!res.ok) throw new Error('Refresh failed')
        const data = await res.json().catch(() => ({}))
        if (!data.token) throw new Error('Refresh sin nuevo token')
        useAuthStore.getState().setTokens(data.token, data.refresh || auth.refreshToken)
      } catch (e) {
        useAuthStore.getState().logout()
        throw e
      } finally {
        useAuthStore.getState().setRefreshing(false)
        // liberar promise
        const p = refreshPromise
        refreshPromise = null
        return p
      }
    })()
  }
  return refreshPromise
}

function waitForRefresh() {
  return refreshPromise || Promise.resolve()
}

async function request(path, { method = 'GET', body, headers, auth = true, timeout = API_TIMEOUT, signal } = {}) {
  const token = useAuthStore.getState().token
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  const finalHeaders = {
    'Content-Type': 'application/json',
    ...headers,
    ...(auth && token ? { Authorization: `Bearer ${token}` } : {})
  }
  try {
    const res = await fetch(API_BASE_URL + path, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
      signal: signal || controller.signal
    })

    if (res.status === 401) {
      // Intento de refresh SINGLE FLIGHT
      const authState = useAuthStore.getState()
      // Si no hay refresh token o ya estamos refrescando y falló, salir
      if (!authState.refreshToken) {
        authState.logout()
        throw buildError('No autorizado (401). Sesión finalizada.')
      }
      // Single-flight: si ya refrescando, esperar a que termine
      if (authState.refreshing) {
        await waitForRefresh()
      } else {
        await performRefresh()
      }
      // Reintentar una vez la petición original con nuevo token
      const newToken = useAuthStore.getState().token
      const retryHeaders = { ...finalHeaders, ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}) }
      const retryRes = await fetch(API_BASE_URL + path, {
        method,
        headers: retryHeaders,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include'
      })
      if (!retryRes.ok) {
        if (retryRes.status === 401) {
          useAuthStore.getState().logout()
          throw buildError('Sesión expirada')
        }
        let message = 'HTTP ' + retryRes.status
        let payload = null
        try { payload = await retryRes.json(); message = payload.detail || payload.message || message } catch {}
        throw buildError(message, payload)
      }
      if (retryRes.status === 204) return null
      try { return await retryRes.json() } catch { return null }
    }

    if (!res.ok) {
      let message = 'HTTP ' + res.status
      let payload = null
      try { payload = await res.json(); message = payload.detail || payload.message || message } catch {}
      throw buildError(message, payload)
    }
    if (res.status === 204) return null
    // Intentar JSON, fallback texto
    try { return await res.json() } catch { return null }
  } catch (e) {
    if (e.name === 'AbortError') {
      throw buildError('Timeout de petición excedido')
    }
    throw e
  } finally {
    clearTimeout(timer)
  }
}

export const http = {
  get: (p, opts) => request(p, { ...opts, method: 'GET' }),
  post: (p, body, opts) => request(p, { ...opts, method: 'POST', body }),
  put: (p, body, opts) => request(p, { ...opts, method: 'PUT', body }),
  patch: (p, body, opts) => request(p, { ...opts, method: 'PATCH', body }),
  delete: (p, opts) => request(p, { ...opts, method: 'DELETE' })
}
