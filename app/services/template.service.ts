import type { ApiResponse } from '~/types/api'
import type { Template } from '~/types/template'

export function useTemplateService() {
  const api = useApi()

  return {
    getTemplates(params?: { page?: number; per_page?: number; search?: string }) {
      return api.get<any>('/admin/templates', params as any)
    },
    getTemplate(id: string) {
      return api.get<ApiResponse<Template>>(`/admin/templates/${id}`)
    },
    createTemplate(data: { name: string; component_name: string; thumbnail_url: string }) {
      return api.post<ApiResponse<Template>>('/admin/templates', data)
    },
    updateTemplate(id: string, data: { name?: string; component_name?: string; thumbnail_url?: string }) {
      return api.patch<ApiResponse<Template>>(`/admin/templates/${id}`, data)
    },
    deleteTemplate(id: string) {
      return api.delete<ApiResponse<null>>(`/admin/templates/${id}`)
    }
  }
}
