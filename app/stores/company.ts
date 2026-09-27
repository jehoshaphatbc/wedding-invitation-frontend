import { defineStore } from 'pinia'
import type { CompanySettings } from '~/services/company.service'

export const useCompanyStore = defineStore('company', () => {
  const settings = ref<CompanySettings | null>(null)
  const isLoading = ref(false)
  
  const companyService = useCompanyService()

  async function loadSettings() {
    if (isLoading.value) return
    isLoading.value = true
    try {
      const response = await companyService.getSettings()
      settings.value = response.data
    } catch (error) {
      console.error('Failed to load company settings:', error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    settings,
    isLoading,
    loadSettings,
  }
})
