import type { ApiResponse, ApiPaginatedResponse } from '~/types/api'
import type { User } from '~/types/user'

export function useUserService() {
  const api = useApi()

  return {
    getUsers(params?: {
      page?: number
      per_page?: number
      search?: string
      status?: string
      role?: string
      sort?: string
      order?: string
    }) {
      return api.get<ApiPaginatedResponse<User>>('/admin/users', params as any)
    },

    getUser(id: string) {
      return api.get<ApiResponse<User>>(`/admin/users/${id}`)
    },

    createUser(data: {
      name: string
      email: string
      phone?: string
      password: string
      status?: string
      role_ids?: string[]
    }) {
      return api.post<ApiResponse<User>>('/admin/users', data as any)
    },

    updateUser(id: string, data: {
      name?: string
      phone?: string
      status?: string
    }) {
      return api.patch<ApiResponse<User>>(`/admin/users/${id}`, data as any)
    },

    deleteUser(id: string) {
      return api.delete<ApiResponse<null>>(`/admin/users/${id}`)
    },

    assignRoles(id: string, roleIds: string[]) {
      return api.put<ApiResponse<null>>(`/admin/users/${id}/roles`, { role_ids: roleIds })
    },
  }
}
