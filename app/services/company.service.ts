import type { ApiResponse } from '~/types/api'

export interface CompanySettings {
  name: string
  address?: string
  description?: string
  favicon_url?: string
  logo_long_url?: string
  logo_square_url?: string
}

export function useCompanyService() {
  const api = useApi()

  return {
    getSettings() {
      return api.get<ApiResponse<CompanySettings>>('/company-settings')
    },
    updateSettings(data: FormData) {
      return api.put<ApiResponse<CompanySettings>>('/admin/company-settings', data)
    }
  }
}
