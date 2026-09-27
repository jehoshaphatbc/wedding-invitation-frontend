<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Edit User</h1>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>

    <template v-else-if="user">
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <form @submit.prevent="handleSubmit" class="space-y-4 max-w-lg">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
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

          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              v-model="form.status"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? 'Saving...' : 'Save Changes' }}
            </button>
            <NuxtLink
              :to="`/dashboard/users/${route.params.id}`"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </NuxtLink>
          </div>
        </form>
      </div>

      <!-- Force Change Password Section -->
      <div class="bg-white rounded-lg shadow p-6 border-t-4 border-red-500">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">Force Change Password</h2>
        <p class="text-sm text-gray-500 mb-4">
          As a Super Admin, you can force change this user's password. They will be logged out of all active sessions.
        </p>
        
        <form @submit.prevent="promptPasswordChange" class="space-y-4 max-w-lg">
          <div>
            <label for="new_password" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              id="new_password"
              v-model="passwordForm.new_password"
              type="password"
              required
              minlength="8"
              placeholder="At least 8 characters"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              :class="{ 'border-red-500': passwordErrors.new_password }"
            />
            <p v-if="passwordErrors.new_password" class="mt-1 text-sm text-red-600">{{ passwordErrors.new_password[0] }}</p>
          </div>
          
          <button
            type="submit"
            :disabled="changingPassword"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ changingPassword ? 'Changing...' : 'Force Change Password' }}
          </button>
        </form>
      </div>
    </template>

    <UiConfirmModal
      v-if="showPasswordModal"
      title="Force Change Password"
      :message="`Are you sure you want to change the password for ${user?.name}? This action cannot be undone and will revoke their active sessions.`"
      confirm-text="Yes, Change Password"
      :danger="true"
      @confirm="executePasswordChange"
      @cancel="showPasswordModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types/user'
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Edit User', meta: [{ name: 'robots', content: 'noindex' }] })

const route = useRoute()
const toast = useToast()
const userService = useUserService()

const user = ref<User | null>(null)
const loading = ref(true)
const submitting = ref(false)
const changingPassword = ref(false)
const showPasswordModal = ref(false)
const errors = reactive<Record<string, string[]>>({})
const passwordErrors = reactive<Record<string, string[]>>({})

const form = reactive({
  name: '',
  phone: '',
  status: 'active',
})

const passwordForm = reactive({
  new_password: ''
})

async function loadUser() {
  loading.value = true
  try {
    const response = await userService.getUser(route.params.id as string)
    user.value = response.data
    form.name = response.data.name
    form.phone = response.data.phone ?? ''
    form.status = response.data.status
  } catch (e) {
    const err = handleApiError(e)
    toast.error(err.message)
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!user.value) return
  submitting.value = true
  Object.keys(errors).forEach((k) => delete errors[k])

  try {
    await userService.updateUser(user.value.id, {
      name: form.name,
      phone: form.phone || undefined,
      status: form.status,
    })
    toast.success('User updated successfully.')
  } catch (e) {
    const err = handleApiError(e)
    if (err.errors) Object.assign(errors, err.errors)
    toast.error(err.message)
  } finally {
    submitting.value = false
  }
}

function promptPasswordChange() {
  if (!passwordForm.new_password || passwordForm.new_password.length < 8) {
    toast.error('Password must be at least 8 characters.')
    return
  }
  showPasswordModal.value = true
}

async function executePasswordChange() {
  if (!user.value) return
  showPasswordModal.value = false
  changingPassword.value = true
  Object.keys(passwordErrors).forEach((k) => delete passwordErrors[k])

  try {
    await userService.forceChangePassword(user.value.id, passwordForm.new_password)
    toast.success(`Password for ${user.value.name} updated successfully.`)
    passwordForm.new_password = ''
  } catch (e) {
    const err = handleApiError(e)
    if (err.errors) Object.assign(passwordErrors, err.errors)
    toast.error(err.message)
  } finally {
    changingPassword.value = false
  }
}

await loadUser()
</script>
