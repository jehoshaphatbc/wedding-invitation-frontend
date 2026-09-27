import { defineStore } from 'pinia'
import type { User } from '~/types/user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = useCookie<string | null>('access_token', { maxAge: 60 * 60 * 24 * 7 })
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const isInitialized = ref(false)
  
  const authService = useAuthService()

  async function login(email: string, password: string) {
    isLoading.value = true
    try {
      const response = await authService.login({ email, password })
      accessToken.value = response.data.access_token
      user.value = response.data.user
      isAuthenticated.value = true
      return response
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await authService.logout()
    } catch {
      // Continue clearing state even if API fails
    } finally {
      clearAuth()
    }
  }

  async function logoutAll() {
    try {
      await authService.logoutAll()
    } catch {
      // Continue clearing state even if API fails
    } finally {
      clearAuth()
    }
  }

  async function refresh() {
    try {
      const response = await authService.refresh()
      accessToken.value = response.data.access_token
      return response
    } catch (error) {
      clearAuth()
      throw error
    }
  }

  async function fetchMe() {
    try {
      const response = await authService.getMe()
      user.value = response.data
      isAuthenticated.value = true
      return response
    } catch (error) {
      clearAuth()
      throw error
    }
  }

  async function initialize() {
    if (isInitialized.value) return

    isLoading.value = true
    try {
      if (accessToken.value) {
        await fetchMe()
      } else {
        clearAuth()
      }
    } catch {
      clearAuth()
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  function clearAuth() {
    user.value = null
    accessToken.value = null
    isAuthenticated.value = false
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    isInitialized,
    login,
    logout,
    logoutAll,
    refresh,
    fetchMe,
    initialize,
    clearAuth,
  }
})
