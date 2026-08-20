import type { ApiResponse } from '~/types/api'
import type { Role } from '~/types/role'

export function useRoleService() {
  const api = useApi()

  return {
    getRoles() {
      return api.get<ApiResponse<Role[]>>('/admin/roles')
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
  }
}
