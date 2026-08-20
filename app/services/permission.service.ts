import type { ApiResponse } from '~/types/api'
import type { Permission } from '~/types/permission'

export function usePermissionService() {
  const api = useApi()

  return {
    getPermissions() {
      return api.get<ApiResponse<Permission[]>>('/admin/permissions')
    },
  }
}
