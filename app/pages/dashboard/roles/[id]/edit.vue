<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Edit Role</h1>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>

    <template v-else-if="role">
      <div
        v-if="role.is_system"
        class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm text-yellow-800"
      >
        This is a system role. Some fields may be restricted from modification.
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <form @submit.prevent="handleSubmit" class="space-y-4 max-w-lg">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              :value="role.name"
              type="text"
              disabled
              class="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label for="display_name" class="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              id="display_name"
              v-model="form.display_name"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.display_name }"
            />
            <p v-if="errors.display_name" class="mt-1 text-sm text-red-600">{{ errors.display_name[0] }}</p>
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.description }"
            />
            <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description[0] }}</p>
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
              to="/dashboard/roles"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </NuxtLink>
          </div>
        </form>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Role } from '~/types/role'
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Edit Role', meta: [{ name: 'robots', content: 'noindex' }] })

const { isSuperAdmin } = usePermission()

if (!isSuperAdmin.value) {
  await navigateTo('/dashboard')
}

const route = useRoute()
const toast = useToast()
const roleService = useRoleService()

const role = ref<Role | null>(null)
const loading = ref(true)
const submitting = ref(false)
const errors = reactive<Record<string, string[]>>({})

const form = reactive({
  display_name: '',
  description: '',
})

async function loadRole() {
  loading.value = true
  try {
    const response = await roleService.getRole(route.params.id as string)
    role.value = response.data
    form.display_name = response.data.display_name
    form.description = response.data.description ?? ''
  } catch (e) {
    const err = handleApiError(e)
    toast.error(err.message)
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!role.value) return
  submitting.value = true
  Object.keys(errors).forEach((k) => delete errors[k])

  try {
    await roleService.updateRole(role.value.id, {
      display_name: form.display_name,
      description: form.description || undefined,
    })
    toast.success('Role updated successfully.')
  } catch (e) {
    const err = handleApiError(e)
    if (err.errors) Object.assign(errors, err.errors)
    toast.error(err.message)
  } finally {
    submitting.value = false
  }
}

await loadRole()
</script>
