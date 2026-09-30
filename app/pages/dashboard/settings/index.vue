<template>
  <div class="pb-10 max-w-4xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Company Settings</h1>
      <p class="text-sm text-gray-500 mt-1">Manage public company profile and branding assets.</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>

    <div v-else class="bg-white rounded-lg shadow">
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        
        <!-- Text Info -->
        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-gray-900 border-b pb-2">Profile Information</h2>
          
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Brief Description</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            ></textarea>
          </div>

          <div>
            <label for="address" class="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
            <textarea
              id="address"
              v-model="form.address"
              rows="3"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>

        <!-- Branding / Images -->
        <div class="space-y-6 pt-4">
          <h2 class="text-lg font-semibold text-gray-900 border-b pb-2">Branding Assets</h2>

          <!-- Favicon -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
            <div class="flex items-start gap-6">
              <div class="w-16 h-16 border rounded bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img v-if="faviconPreview" :src="faviconPreview" class="w-full h-full object-contain" />
                <svg v-else class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div class="flex-1">
                <input type="file" accept="image/*" @change="handleFileChange($event, 'favicon')" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                <p class="mt-1 text-xs text-gray-500">Recommended size: 32x32px or 64x64px (ICO or PNG).</p>
              </div>
            </div>
          </div>

          <!-- Logo Square -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Square Logo</label>
            <div class="flex items-start gap-6">
              <div class="w-24 h-24 border rounded bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img v-if="logoSquarePreview" :src="logoSquarePreview" class="w-full h-full object-contain" />
                <svg v-else class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div class="flex-1">
                <input type="file" accept="image/*" @change="handleFileChange($event, 'logo_square')" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                <p class="mt-1 text-xs text-gray-500">Square format. Recommended size: 512x512px.</p>
              </div>
            </div>
          </div>

          <!-- Logo Long -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Long Logo (Horizontal)</label>
            <div class="flex items-start gap-6">
              <div class="w-48 h-16 border rounded bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img v-if="logoLongPreview" :src="logoLongPreview" class="w-full h-full object-contain" />
                <svg v-else class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div class="flex-1">
                <input type="file" accept="image/*" @change="handleFileChange($event, 'logo_long')" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                <p class="mt-1 text-xs text-gray-500">Horizontal format for top navigation bars.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-6 border-t flex justify-end">
          <button
            type="submit"
            :disabled="saving"
            class="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ saving ? 'Saving Changes...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Company Settings', meta: [{ name: 'robots', content: 'noindex' }] })

const toast = useToast()
const { isSuperAdmin } = usePermission()

if (!isSuperAdmin.value) {
  await navigateTo('/dashboard')
}

const companyService = useCompanyService()
const companyStore = useCompanyStore()
const config = useRuntimeConfig()

// Helper to resolve API relative paths to absolute URLs
const apiBase = (config.public.apiBase as string || '').replace(/\/api\/v1\/?$/, '')

function resolveImageUrl(path?: string) {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('data:')) return path
  return `${apiBase}${path.startsWith('/') ? '' : '/'}${path}`
}

const loading = ref(true)
const saving = ref(false)

const form = reactive({
  name: '',
  description: '',
  address: '',
})

// File state
const files = reactive<{
  favicon: File | null
  logo_square: File | null
  logo_long: File | null
}>({
  favicon: null,
  logo_square: null,
  logo_long: null,
})

// Preview state
const faviconPreview = ref('')
const logoSquarePreview = ref('')
const logoLongPreview = ref('')

async function loadSettings(showLoader = true) {
  if (showLoader) loading.value = true
  try {
    const response = await companyService.getSettings()
    const data = response.data
    form.name = data.name || ''
    form.description = data.description || ''
    form.address = data.address || ''

    faviconPreview.value = resolveImageUrl(data.favicon_url)
    logoSquarePreview.value = resolveImageUrl(data.logo_square_url)
    logoLongPreview.value = resolveImageUrl(data.logo_long_url)
  } catch (error) {
    const err = handleApiError(error)
    toast.error(err.message)
  } finally {
    loading.value = false
  }
}

function handleFileChange(event: Event, type: 'favicon' | 'logo_square' | 'logo_long') {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const file = input.files[0]
  files[type] = file

  // Create preview URL
  const objectUrl = URL.createObjectURL(file)
  if (type === 'favicon') faviconPreview.value = objectUrl
  if (type === 'logo_square') logoSquarePreview.value = objectUrl
  if (type === 'logo_long') logoLongPreview.value = objectUrl
}

async function handleSubmit() {
  saving.value = true
  
  const formData = new globalThis.FormData()
  formData.append('name', form.name)
  formData.append('description', form.description)
  formData.append('address', form.address)

  if (files.favicon) formData.append('favicon', files.favicon)
  if (files.logo_square) formData.append('logo_square', files.logo_square)
  if (files.logo_long) formData.append('logo_long', files.logo_long)

  try {
    const response = await companyService.updateSettings(formData) as any
    toast.success('Company settings updated successfully.')
    
    // Clear file inputs so we don't re-upload if clicked again without changing
    files.favicon = null
    files.logo_square = null
    files.logo_long = null
    
    // Handle both response.data and response.data.data just in case of wrapper
    const data = response?.data?.data || response?.data || {}
    
    // Append cache buster to force browser to reload the image (if the backend uses the same filename)
    const timestamp = Date.now()
    if (data.favicon_url) data.favicon_url = `${data.favicon_url}?t=${timestamp}`
    if (data.logo_square_url) data.logo_square_url = `${data.logo_square_url}?t=${timestamp}`
    if (data.logo_long_url) data.logo_long_url = `${data.logo_long_url}?t=${timestamp}`
    
    // Update previews with the new URLs returned by backend
    if (data.favicon_url) faviconPreview.value = resolveImageUrl(data.favicon_url)
    if (data.logo_square_url) logoSquarePreview.value = resolveImageUrl(data.logo_square_url)
    if (data.logo_long_url) logoLongPreview.value = resolveImageUrl(data.logo_long_url)
    
    // Update global store
    if (Object.keys(data).length > 0) {
      companyStore.settings = { ...(companyStore.settings || {}), ...data }
    }
    
  } catch (error) {
    const err = handleApiError(error)
    toast.error(err.message)
  } finally {
    saving.value = false
  }
}

// Cleanup object URLs on unmount to avoid memory leaks
onUnmounted(() => {
  if (faviconPreview.value.startsWith('blob:')) URL.revokeObjectURL(faviconPreview.value)
  if (logoSquarePreview.value.startsWith('blob:')) URL.revokeObjectURL(logoSquarePreview.value)
  if (logoLongPreview.value.startsWith('blob:')) URL.revokeObjectURL(logoLongPreview.value)
})

onMounted(() => {
  loadSettings()
})
</script>
