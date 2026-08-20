<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Manage Roles</h1>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>

    <template v-else-if="user">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">
          Roles for {{ user.name }}
        </h2>
        <p class="text-sm text-gray-500 mb-4">{{ user.email }}</p>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
            <label
              v-for="role in roles"
              :key="role.id"
              class="flex items-center gap-3 text-sm"
            >
              <input
                v-model="selectedRoleIds"
                type="checkbox"
                :value="role.id"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span class="font-medium text-gray-900">{{ role.display_name }}</span>
                <span v-if="role.description" class="text-gray-500 ml-2">- {{ role.description }}</span>
              </div>
            </label>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? 'Saving...' : 'Save Roles' }}
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
    </template>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types/user'
import type { Role } from '~/types/role'
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Assign Roles', meta: [{ name: 'robots', content: 'noindex' }] })

const route = useRoute()
const toast = useToast()
const userService = useUserService()
const roleService = useRoleService()

const user = ref<User | null>(null)
const roles = ref<Role[]>([])
const selectedRoleIds = ref<string[]>([])
const loading = ref(true)
const submitting = ref(false)

async function loadData() {
  loading.value = true
  try {
    const [userRes, rolesRes] = await Promise.all([
      userService.getUser(route.params.id as string),
      roleService.getRoles(),
    ])
    user.value = userRes.data
    roles.value = rolesRes.data
    selectedRoleIds.value = userRes.data.roles.map((r) => r.id)
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
  try {
    await userService.assignRoles(user.value.id, selectedRoleIds.value)
    toast.success('Roles updated successfully.')
  } catch (e) {
    const err = handleApiError(e)
    toast.error(err.message)
  } finally {
    submitting.value = false
  }
}

await loadData()
</script>
