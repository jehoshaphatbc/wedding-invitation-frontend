<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Account Settings</h1>
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex gap-6">
          <NuxtLink
            to="/dashboard/profile"
            class="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Profile Information
          </NuxtLink>
          <NuxtLink
            to="/dashboard/profile/security"
            class="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm border-blue-500 text-blue-600"
          >
            Security & Password
          </NuxtLink>
        </nav>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
      <form @submit.prevent="handleChangePassword" class="space-y-4 max-w-lg">
        <div>
          <label for="current_password" class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <input
            id="current_password"
            v-model="passwordForm.current_password"
            type="password"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.current_password }"
          />
          <p v-if="errors.current_password" class="mt-1 text-sm text-red-600">{{ errors.current_password[0] }}</p>
        </div>

        <div>
          <label for="new_password" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            id="new_password"
            v-model="passwordForm.new_password"
            type="password"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.new_password }"
          />
          <p v-if="errors.new_password" class="mt-1 text-sm text-red-600">{{ errors.new_password[0] }}</p>
        </div>

        <div>
          <label for="new_password_confirmation" class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            id="new_password_confirmation"
            v-model="passwordForm.new_password_confirmation"
            type="password"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          :disabled="changingPassword"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ changingPassword ? 'Changing...' : 'Change Password' }}
        </button>
      </form>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">Session Management</h2>
      <p class="text-sm text-gray-500 mb-4">
        This will log you out from all devices, including this one.
      </p>
      <button
        class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
        @click="showLogoutAllModal = true"
      >
        Logout All Devices
      </button>
    </div>

    <UiConfirmModal
      v-if="showLogoutAllModal"
      title="Logout All Devices"
      message="Are you sure you want to log out from all devices? You will need to sign in again."
      confirm-text="Logout All"
      :danger="true"
      @confirm="handleLogoutAll"
      @cancel="showLogoutAllModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Security', meta: [{ name: 'robots', content: 'noindex' }] })

const toast = useToast()
const authService = useAuthService()
const { logoutAll } = useAuth()

const changingPassword = ref(false)
const showLogoutAllModal = ref(false)

const passwordForm = reactive({
  current_password: '',
  new_password: '',
  new_password_confirmation: '',
})
const errors = reactive<Record<string, string[]>>({})

async function handleChangePassword() {
  changingPassword.value = true
  Object.keys(errors).forEach((k) => delete errors[k])

  try {
    await authService.changePassword({
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
    })
    toast.success('Password changed successfully.')
    passwordForm.current_password = ''
    passwordForm.new_password = ''
    passwordForm.new_password_confirmation = ''
  } catch (e) {
    const err = handleApiError(e)
    if (err.errors) Object.assign(errors, err.errors)
    toast.error(err.message)
  } finally {
    changingPassword.value = false
  }
}

async function handleLogoutAll() {
  showLogoutAllModal.value = false
  try {
    await logoutAll()
    toast.success('Logged out from all devices.')
  } catch {
    toast.error('Failed to logout from all devices.')
  }
}
</script>
