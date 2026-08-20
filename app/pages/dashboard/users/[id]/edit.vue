<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Edit User</h1>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>

    <div v-else-if="user" class="bg-white rounded-lg shadow p-6">
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
const errors = reactive<Record<string, string[]>>({})

const form = reactive({
  name: '',
  phone: '',
  status: 'active',
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

await loadUser()
</script>
