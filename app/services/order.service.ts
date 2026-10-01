import type { ApiResponse } from '~/types/api'
import type { Order, OrderStatus } from '~/types/order'

export function useOrderService() {
  const api = useApi()

  return {
    getOrders(params?: {
      page?: number
      per_page?: number
      limit?: number
      search?: string
      status?: string
      is_trashed?: boolean
      sort?: string
      order?: string
    }) {
      const cleanParams: any = { ...params }
      if (cleanParams.per_page && !cleanParams.limit) {
        cleanParams.limit = cleanParams.per_page
      }
      return api.get<any>('/admin/orders', cleanParams).catch(async (err) => {
        if (err?.response?.status === 404) {
          return await api.get<any>('/orders', cleanParams)
        }
        throw err
      })
    },

    getTrashedOrders(params?: {
      page?: number
      per_page?: number
      limit?: number
      search?: string
      status?: string
      sort?: string
      order?: string
    }) {
      const cleanParams: any = { ...params, is_trashed: true }
      return api.get<any>('/admin/orders/trash', cleanParams).catch(async (err) => {
        if (err?.response?.status === 404) {
          return await api.get<any>('/orders', cleanParams)
        }
        throw err
      })
    },

    getOrder(id: string) {
      return api.get<ApiResponse<Order>>(`/admin/orders/${id}`).catch(async (err) => {
        if (err?.response?.status === 404) {
          return await api.get<ApiResponse<Order>>(`/orders/${id}`)
        }
        throw err
      })
    },

    updateOrder(id: string, data: { status?: OrderStatus; total_amount?: number }) {
      return api.put<ApiResponse<Order>>(`/admin/orders/${id}`, data).catch(async (err) => {
        if (err?.response?.status === 405 || err?.response?.status === 404) {
          return await api.patch<ApiResponse<Order>>(`/admin/orders/${id}`, data)
        }
        throw err
      })
    },

    updateStatus(id: string, status: OrderStatus) {
      return api.put<ApiResponse<Order>>(`/admin/orders/${id}`, { status }).catch(async (err) => {
        if (err?.response?.status === 405 || err?.response?.status === 404) {
          return await api.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, { status }).catch(async () => {
            return await api.patch<ApiResponse<Order>>(`/admin/orders/${id}`, { status })
          })
        }
        throw err
      })
    },

    deleteOrder(id: string) {
      return api.delete<ApiResponse<null>>(`/admin/orders/${id}`)
    },

    restoreOrder(id: string) {
      return api.post<ApiResponse<null>>(`/admin/orders/${id}/restore`).catch(async (err) => {
        if (err?.response?.status === 404) {
          return await api.post<ApiResponse<null>>('/admin/orders/restore', { id })
        }
        throw err
      })
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
