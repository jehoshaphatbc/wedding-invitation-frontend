import type { ApiResponse } from '~/types/api'
import type { Role } from '~/types/role'

export function useRoleService() {
  const api = useApi()

  return {
    getRoles(params?: {
      page?: number
      per_page?: number
      search?: string
      sort?: string
      order?: string
    }) {
      return api.get<any>('/admin/roles', params as any)
    },

    getRole(id: string) {
      return api.get<ApiResponse<Role>>(`/admin/roles/${id}`)
    },

    createRole(data: {
      name: string
      display_name: string
      description?: string
    }) {
      return api.post<ApiResponse<Role>>('/admin/roles', data as any)
    },

    updateRole(id: string, data: {
      display_name?: string
      description?: string
    }) {
      return api.patch<ApiResponse<Role>>(`/admin/roles/${id}`, data as any)
    },

    deleteRole(id: string) {
      return api.delete<ApiResponse<null>>(`/admin/roles/${id}`)
    },

    assignPermissions(id: string, permissionIds: string[]) {
      return api.put<ApiResponse<null>>(`/admin/roles/${id}/permissions`, { permission_ids: permissionIds })
    },

    getTrashedRoles(params?: {
      page?: number
      per_page?: number
      search?: string
      sort?: string
      order?: string
    }) {
      return api.get<any>('/admin/roles/trash', params as any)
    },

    restoreRole(id: string) {
      return api.post<ApiResponse<null>>(`/admin/roles/${id}/restore`)
    },

    forceDeleteRole(id: string) {
      return api.delete<ApiResponse<null>>(`/admin/roles/${id}/force`)
    },

    bulkDeleteRoles(ids: string[]) {
      return api.post<ApiResponse<{ success_count: number }>>('/admin/roles/bulk-delete', { ids })
    },
    bulkRestoreRoles(ids: string[]) {
      return api.post<ApiResponse<{ success_count: number }>>('/admin/roles/bulk-restore', { ids })
    },
    bulkForceDeleteRoles(ids: string[]) {
      return api.post<ApiResponse<{ success_count: number }>>('/admin/roles/bulk-force-delete', { ids })
    },
  }
}
