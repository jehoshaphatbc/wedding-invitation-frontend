export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.isInitialized) {
    await authStore.initialize()
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
