<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>

    <template v-else-if="profile">
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="flex items-center gap-6 mb-6">
          <img
            v-if="profile.avatar_url"
            :src="profile.avatar_url"
            :alt="profile.name"
            class="h-20 w-20 rounded-full object-cover"
          />
          <div
            v-else
            class="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500"
          >
            {{ profile.name.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h2 class="text-xl font-semibold text-gray-900">{{ profile.name }}</h2>
            <p class="text-gray-500">{{ profile.email }}</p>
            <p v-if="profile.phone" class="text-gray-500 text-sm">{{ profile.phone }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h2>
        <form @submit.prevent="handleUpdate" class="space-y-4 max-w-lg">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.name }"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name[0] }}</p>
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              id="phone"
              v-model="form.phone"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.phone }"
            />
            <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone[0] }}</p>
          </div>

          <button
            type="submit"
            :disabled="saving"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </form>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types/user'
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Profile', meta: [{ name: 'robots', content: 'noindex' }] })

const toast = useToast()
const authService = useAuthService()

const profile = ref<User | null>(null)
const loading = ref(true)
const saving = ref(false)
const form = reactive({ name: '', phone: '' })
const errors = reactive<Record<string, string[]>>({})

async function loadProfile() {
  loading.value = true
  try {
    const response = await authService.getMe()
    profile.value = response.data
    form.name = response.data.name
    form.phone = response.data.phone ?? ''
  } catch (e) {
    const err = handleApiError(e)
    toast.error(err.message)
  } finally {
    loading.value = false
  }
}

async function handleUpdate() {
  saving.value = true
  Object.keys(errors).forEach((k) => delete errors[k])

  const api = useApi()
  try {
    const response = await api.patch<{ success: boolean; data: User }>('/me', {
      name: form.name,
      phone: form.phone || undefined,
    })
    profile.value = response.data
    toast.success('Profile updated successfully.')
  } catch (e) {
    const err = handleApiError(e)
    if (err.errors) Object.assign(errors, err.errors)
    toast.error(err.message)
  } finally {
    saving.value = false
  }
}

await loadProfile()
</script>
