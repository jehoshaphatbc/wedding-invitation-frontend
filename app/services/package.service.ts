import type { ApiResponse } from '~/types/api'
import type { Package, PackageFeatures } from '~/types/package'

export function usePackageService() {
  const api = useApi()

  return {
    getPackages(params?: { page?: number; per_page?: number; search?: string }) {
      return api.get<any>('/admin/packages', params as any)
    },
    getPackage(id: string) {
      return api.get<ApiResponse<Package>>(`/admin/packages/${id}`)
    },
    createPackage(data: { name: string; price: number; features_config: PackageFeatures }) {
      return api.post<ApiResponse<Package>>('/admin/packages', data)
    },
    updatePackage(id: string, data: { name?: string; price?: number; features_config?: PackageFeatures }) {
      return api.patch<ApiResponse<Package>>(`/admin/packages/${id}`, data)
    },
    deletePackage(id: string) {
      return api.delete<ApiResponse<null>>(`/admin/packages/${id}`)
    }
  }
}
