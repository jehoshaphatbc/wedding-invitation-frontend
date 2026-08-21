export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const baseURL = (config.public.apiBase as string || '').replace(/\/$/, '')

  async function request<T>(
    method: string,
    path: string,
    options: {
      body?: Record<string, unknown>
      query?: Record<string, string | number | boolean | undefined>
      headers?: Record<string, string>
    } = {},
  ): Promise<T> {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    const url = `${baseURL}${cleanPath}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    }

    if (authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`
    }

    try {
      const response = await $fetch<T>(url, {
        method: method as any,
        body: options.body,
        query: options.query,
        headers,
      })
      return response
    } catch (error: any) {
      if (error?.response?.status === 401 && authStore.accessToken) {
        try {
          await authStore.refresh()
          headers['Authorization'] = `Bearer ${authStore.accessToken}`
          const retryResponse = await $fetch<T>(url, {
            method: method as any,
            body: options.body,
            query: options.query,
            headers,
          })
          return retryResponse
        } catch {
          authStore.clearAuth()
          if (import.meta.client) {
            navigateTo('/login')
          }
          throw error
        }
      }
      throw error
    }
  }

  return {
    get: <T>(path: string, query?: Record<string, string | number | boolean | undefined>) =>
      request<T>('GET', path, { query }),
    post: <T>(path: string, body?: Record<string, unknown>) =>
      request<T>('POST', path, { body }),
    patch: <T>(path: string, body?: Record<string, unknown>) =>
      request<T>('PATCH', path, { body }),
    put: <T>(path: string, body?: Record<string, unknown>) =>
      request<T>('PUT', path, { body }),
    delete: <T>(path: string) =>
      request<T>('DELETE', path),
  }
}
