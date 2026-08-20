import type { User } from '~/types/user'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isLoading = computed(() => authStore.isLoading)
  const isInitialized = computed(() => authStore.isInitialized)

  async function login(email: string, password: string) {
    return authStore.login(email, password)
  }

  async function logout() {
    await authStore.logout()
    router.push('/login')
  }

  async function logoutAll() {
    await authStore.logoutAll()
    router.push('/login')
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    login,
    logout,
    logoutAll,
  }
}
