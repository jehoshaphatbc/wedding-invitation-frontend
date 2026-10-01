import type { ApiResponse } from '~/types/api'
import type { Client, ClientFormData } from '~/types/client'

export function useClientService() {
  const api = useApi()

  return {
    getClients(params?: { page?: number; per_page?: number; search?: string; sort?: string; order?: string }) {
      return api.get<any>('/admin/clients', params as any).catch(async (err) => {
        if (err?.response?.status === 404) {
          return await api.get<any>('/clients', params as any)
        }
        throw err
      })
    },

    getTrashedClients(params?: { page?: number; per_page?: number; search?: string; sort?: string; order?: string }) {
      return api.get<any>('/admin/clients/trash', params as any)
    },

    getClient(id: string) {
      return api.get<ApiResponse<Client>>(`/admin/clients/${id}`).catch(async (err) => {
        if (err?.response?.status === 404) {
          return await api.get<ApiResponse<Client>>(`/clients/${id}`)
        }
        throw err
      })
    },

    createClient(data: ClientFormData) {
      return api.post<ApiResponse<Client>>('/admin/clients', data).catch(async (err) => {
        if (err?.response?.status === 404) {
          return await api.post<ApiResponse<Client>>('/clients', data)
        }
        throw err
      })
    },

    updateClient(id: string, data: Partial<ClientFormData>) {
      return api.patch<ApiResponse<Client>>(`/admin/clients/${id}`, data).catch(async (err) => {
        if (err?.response?.status === 405 || err?.response?.status === 404) {
          return await api.put<ApiResponse<Client>>(`/admin/clients/${id}`, data)
        }
        throw err
      })
    },

    deleteClient(id: string) {
      return api.delete<ApiResponse<null>>(`/admin/clients/${id}`)
    },

    restoreClient(id: string) {
      return api.post<ApiResponse<null>>(`/admin/clients/${id}/restore`)
    },

    forceDeleteClient(id: string) {
      return api.delete<ApiResponse<null>>(`/admin/clients/${id}/force`)
    },

    bulkDeleteClients(ids: string[]) {
      return api.post<ApiResponse<{ success_count: number }>>('/admin/clients/bulk-delete', { ids })
    },

    bulkRestoreClients(ids: string[]) {
      return api.post<ApiResponse<{ success_count: number }>>('/admin/clients/bulk-restore', { ids })
    },

    bulkForceDeleteClients(ids: string[]) {
      return api.post<ApiResponse<{ success_count: number }>>('/admin/clients/bulk-force-delete', { ids })
    }
  }
}
