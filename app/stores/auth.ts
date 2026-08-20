import { defineStore } from 'pinia'
import type { User } from '~/types/user'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
  }),

  actions: {
    async login(email: string, password: string) {
      this.isLoading = true
      try {
        const authService = useAuthService()
        const response = await authService.login({ email, password })
        this.accessToken = response.data.access_token
        this.user = response.data.user
        this.isAuthenticated = true
        return response
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        const authService = useAuthService()
        await authService.logout()
      } catch {
        // Continue clearing state even if API fails
      } finally {
        this.clearAuth()
      }
    },

    async logoutAll() {
      try {
        const authService = useAuthService()
        await authService.logoutAll()
      } catch {
        // Continue clearing state even if API fails
      } finally {
        this.clearAuth()
      }
    },

    async refresh() {
      try {
        const authService = useAuthService()
        const response = await authService.refresh()
        this.accessToken = response.data.access_token
        return response
      } catch (error) {
        this.clearAuth()
        throw error
      }
    },

    async fetchMe() {
      try {
        const authService = useAuthService()
        const response = await authService.getMe()
        this.user = response.data
        this.isAuthenticated = true
        return response
      } catch (error) {
        this.clearAuth()
        throw error
      }
    },

    async initialize() {
      if (this.isInitialized) return

      this.isLoading = true
      try {
        await this.fetchMe()
      } catch {
        this.clearAuth()
      } finally {
        this.isLoading = false
        this.isInitialized = true
      }
    },

    clearAuth() {
      this.user = null
      this.accessToken = null
      this.isAuthenticated = false
    },
  },
})
