import type { ApiResponse } from '~/types/api'
import type { Package, PackageFeatures } from '~/types/package'

export function usePackageService() {
  const api = useApi()

  return {
    
    getTrashedPackages(params?: { page?: number; per_page?: number; search?: string; sort?: string; order?: string }) {
      return api.get<any>('/admin/packages/trash', params as any)
    },
    restorePackage(id: string) {
      return api.post<ApiResponse<null>>(`/admin/packages/${id}/restore`)
    },
    forceDeletePackage(id: string) {
      return api.delete<ApiResponse<null>>(`/admin/packages/${id}/force`)
    },
    bulkDeletePackages(ids: string[]) {
      return api.post<ApiResponse<{ success_count: number }>>('/admin/packages/bulk-delete', { ids })
    },
    bulkRestorePackages(ids: string[]) {
      return api.post<ApiResponse<{ success_count: number }>>('/admin/packages/bulk-restore', { ids })
    },
    bulkForceDeletePackages(ids: string[]) {
      return api.post<ApiResponse<{ success_count: number }>>('/admin/packages/bulk-force-delete', { ids })
    },
  
    getPackages(params?: { page?: number; per_page?: number; search?: string; sort?: string; order?: string }) {
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
