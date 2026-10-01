import type { ApiResponse } from '~/types/api'
import type { Order, OrderStatus } from '~/types/order'

export function useOrderService() {
  const api = useApi()

  return {
    getOrders(params?: {
      page?: number
      per_page?: number
      search?: string
      status?: string
      sort?: string
      order?: string
    }) {
      return api.get<any>('/admin/orders', params as any).catch(async (err) => {
        if (err?.response?.status === 404) {
          return await api.get<any>('/orders', params as any)
        }
        throw err
      })
    },

    getTrashedOrders(params?: {
      page?: number
      per_page?: number
      search?: string
      status?: string
      sort?: string
      order?: string
    }) {
      return api.get<any>('/admin/orders/trash', params as any)
    },

    getOrder(id: string) {
      return api.get<ApiResponse<Order>>(`/admin/orders/${id}`).catch(async (err) => {
        if (err?.response?.status === 404) {
          return await api.get<ApiResponse<Order>>(`/orders/${id}`)
        }
        throw err
      })
    },

    updateStatus(id: string, status: OrderStatus) {
      return api.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, { status }).catch(async (err) => {
        if (err?.response?.status === 405 || err?.response?.status === 404) {
          return await api.put<ApiResponse<Order>>(`/admin/orders/${id}/status`, { status })
        }
        throw err
      })
    },

    deleteOrder(id: string) {
      return api.delete<ApiResponse<null>>(`/admin/orders/${id}`)
    },

    restoreOrder(id: string) {
      return api.post<ApiResponse<null>>(`/admin/orders/${id}/restore`)
    },

    forceDeleteOrder(id: string) {
      return api.delete<ApiResponse<null>>(`/admin/orders/${id}/force`)
    },

    bulkDeleteOrders(ids: string[]) {
      return api.post<ApiResponse<{ success_count: number }>>('/admin/orders/bulk-delete', { ids })
    },

    bulkRestoreOrders(ids: string[]) {
      return api.post<ApiResponse<{ success_count: number }>>('/admin/orders/bulk-restore', { ids })
    },

    bulkForceDeleteOrders(ids: string[]) {
      return api.post<ApiResponse<{ success_count: number }>>('/admin/orders/bulk-force-delete', { ids })
    }
  }
}
