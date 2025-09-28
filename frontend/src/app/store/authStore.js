import { create } from 'zustand'

// Auth store ampliado con soporte de refresh token
export const useAuthStore = create(set => ({
  user: null,
  token: null,
  refreshToken: null,
  refreshing: false,
  login: (user, token, refreshToken = null) => set({ user, token, refreshToken }),
  setTokens: (token, refreshToken) => set(state => ({ token, refreshToken: refreshToken || state.refreshToken })),
  setRefreshing: (refreshing) => set({ refreshing }),
  logout: () => set({ user: null, token: null, refreshToken: null, refreshing: false }),
  updateUser: (partial) => set(state => ({ user: state.user ? { ...state.user, ...partial } : state.user }))
}))

// Export default (defensivo) en caso de que algún import existente use `import useAuthStore from ...`
export default useAuthStore
