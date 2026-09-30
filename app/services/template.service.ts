import type { ApiResponse } from '~/types/api'
import type { Template } from '~/types/template'

export function useTemplateService() {
  const api = useApi()

  return {
    
    getTrashedTemplates(params?: { page?: number; per_page?: number; search?: string; sort?: string; order?: string }) {
      return api.get<any>('/admin/templates/trash', params as any)
    },
    restoreTemplate(id: string) {
      return api.post<ApiResponse<null>>(`/admin/templates/${id}/restore`)
    },
    forceDeleteTemplate(id: string) {
      return api.delete<ApiResponse<null>>(`/admin/templates/${id}/force`)
    },
    bulkDeleteTemplates(ids: string[]) {
      return api.post<ApiResponse<{ success_count: number }>>('/admin/templates/bulk-delete', { ids })
    },
    bulkRestoreTemplates(ids: string[]) {
      return api.post<ApiResponse<{ success_count: number }>>('/admin/templates/bulk-restore', { ids })
    },
    bulkForceDeleteTemplates(ids: string[]) {
      return api.post<ApiResponse<{ success_count: number }>>('/admin/templates/bulk-force-delete', { ids })
    },
  
    getTemplates(params?: { page?: number; per_page?: number; search?: string; sort?: string; order?: string }) {
      return api.get<any>('/admin/templates', params as any)
    },
    getTemplate(id: string) {
      return api.get<ApiResponse<Template>>(`/admin/templates/${id}`)
    },
    createTemplate(data: { name: string; nuxt_component: string; thumbnail_url: string }) {
      return api.post<ApiResponse<Template>>('/admin/templates', data)
    },
    updateTemplate(id: string, data: { name?: string; nuxt_component?: string; thumbnail_url?: string }) {
      return api.patch<ApiResponse<Template>>(`/admin/templates/${id}`, data)
    },
    deleteTemplate(id: string) {
      return api.delete<ApiResponse<null>>(`/admin/templates/${id}`)
    },
    uploadImage(file: File) {
      const formData = new globalThis.FormData()
      formData.append('file', file)
      formData.append('image', file)
      return api.post<any>('/upload', formData)
    }
  }
}
