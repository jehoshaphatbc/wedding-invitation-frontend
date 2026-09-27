<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Account Settings</h1>
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex gap-6">
          <NuxtLink
            to="/dashboard/profile"
            class="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm border-blue-500 text-blue-600"
          >
            Profile Information
          </NuxtLink>
          <NuxtLink
            to="/dashboard/profile/security"
            class="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Security & Password
          </NuxtLink>
        </nav>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>

    <template v-else-if="profile">
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="flex items-center gap-6 mb-6">
          <NuxtImg
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

      <div class="bg-white rounded-lg shadow p-6 mb-6">
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

      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Change Email</h2>
        <form @submit.prevent="handleChangeEmail" class="space-y-4 max-w-lg">
          <p class="text-sm text-gray-500 mb-2">Changing your email will log you out. You will need to verify the new email address before logging in.</p>
          <div>
            <label for="new_email" class="block text-sm font-medium text-gray-700 mb-1">New Email Address</label>
            <input
              id="new_email"
              v-model="emailForm.new_email"
              type="email"
              required
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              :class="{ 'border-red-500': emailErrors.new_email }"
            />
            <p v-if="emailErrors.new_email" class="mt-1 text-sm text-red-600">{{ emailErrors.new_email[0] }}</p>
          </div>

          <button
            type="submit"
            :disabled="changingEmail"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ changingEmail ? 'Processing...' : 'Change Email' }}
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
const { logout } = useAuth()
const router = useRouter()

const profile = ref<User | null>(null)
const loading = ref(true)
const saving = ref(false)
const form = reactive({ name: '', phone: '' })
const errors = reactive<Record<string, string[]>>({})

const changingEmail = ref(false)
const emailForm = reactive({ new_email: '' })
const emailErrors = reactive<Record<string, string[]>>({})

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

async function handleChangeEmail() {
  if (!emailForm.new_email) return
  
  changingEmail.value = true
  Object.keys(emailErrors).forEach((k) => delete emailErrors[k])

  try {
    await authService.changeEmail({ new_email: emailForm.new_email })
    toast.success('Email berhasil diubah. Sesi Anda akan berakhir untuk keamanan.')
    setTimeout(async () => {
      await logout()
    }, 2000)
  } catch (e) {
    const err = handleApiError(e)
    if (err.errors) Object.assign(emailErrors, err.errors)
    toast.error(err.message)
  } finally {
    changingEmail.value = false
  }
}

await loadProfile()
</script>
