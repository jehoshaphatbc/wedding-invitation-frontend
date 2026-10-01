let activeRequests = 0

export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const baseURL = (config.public.apiBase as string || '').replace(/\/$/, '')

  async function request<T>(
    method: string,
    path: string,
    options: {
      body?: Record<string, unknown> | any
      query?: Record<string, string | number | boolean | undefined>
      headers?: Record<string, string>
    } = {},
  ): Promise<T> {
    let indicator: any = null
    if (import.meta.client) {
      try {
        indicator = useLoadingIndicator()
        if (activeRequests === 0) {
          indicator.start()
        }
        activeRequests++
      } catch {}
    }

    const cleanPath = path.startsWith('/') ? path : `/${path}`
    const url = `${baseURL}${cleanPath}`

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...options.headers,
    }

    if (options.body && typeof globalThis.FormData !== 'undefined' && options.body instanceof globalThis.FormData) {
      // Do not set Content-Type for FormData, fetch will set it automatically with boundary
    } else {
      headers['Content-Type'] = 'application/json'
    }

    if (authStore.accessToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`
    }

    try {
      return await $fetch<T>(url, {
        method: method as any,
        body: options.body,
        query: options.query,
        headers,
        credentials: 'omit',
      })
    } catch (error: any) {
      if (
        error?.response?.status === 401 && 
        authStore.accessToken && 
        !path.includes('/auth/refresh') && 
        !path.includes('/auth/login')
      ) {
        try {
          await authStore.refresh()
          headers['Authorization'] = `Bearer ${authStore.accessToken}`
          return await $fetch<T>(url, {
            method: method as any,
            body: options.body,
            query: options.query,
            headers,
            credentials: 'omit',
          })
        } catch {
          authStore.clearAuth()
          if (import.meta.client) {
            navigateTo('/login')
          }
          throw error
        }
      }
      throw error
    } finally {
      if (import.meta.client && indicator) {
        try {
          activeRequests = Math.max(0, activeRequests - 1)
          if (activeRequests === 0) {
            indicator.finish()
          }
        } catch {}
      }
    }
  }

  return {
    get: <T>(path: string, query?: Record<string, string | number | boolean | undefined>, options?: { headers?: Record<string, string> }) =>
      request<T>('GET', path, { query, headers: options?.headers }),
    post: <T>(path: string, body?: Record<string, unknown> | any, options?: { headers?: Record<string, string>; query?: any }) =>
      request<T>('POST', path, { body, headers: options?.headers, query: options?.query }),
    patch: <T>(path: string, body?: Record<string, unknown> | any, options?: { headers?: Record<string, string>; query?: any }) =>
      request<T>('PATCH', path, { body, headers: options?.headers, query: options?.query }),
    put: <T>(path: string, body?: Record<string, unknown> | any, options?: { headers?: Record<string, string>; query?: any }) =>
      request<T>('PUT', path, { body, headers: options?.headers, query: options?.query }),
    delete: <T>(path: string, options?: { headers?: Record<string, string>; query?: any }) =>
      request<T>('DELETE', path, { headers: options?.headers, query: options?.query }),
  }
}
