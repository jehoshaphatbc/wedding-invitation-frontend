<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Manage Permissions</h1>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>

    <template v-else-if="role">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">
          Permissions for {{ role.display_name }}
        </h2>
        <p class="text-sm text-gray-500 mb-6">{{ role.description }}</p>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-for="(perms, group) in groupedPermissions" :key="group" class="border border-gray-200 rounded-lg p-4">
            <h3 class="text-sm font-semibold text-gray-700 uppercase mb-3">{{ group }}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <label
                v-for="perm in perms"
                :key="perm.id"
                class="flex items-center gap-2 text-sm"
              >
                <input
                  v-model="selectedPermissionIds"
                  type="checkbox"
                  :value="perm.id"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span class="text-gray-900">{{ perm.name }}</span>
                  <span v-if="perm.description" class="block text-xs text-gray-500">{{ perm.description }}</span>
                </div>
              </label>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? 'Saving...' : 'Save Permissions' }}
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
import type { Permission } from '~/types/permission'
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Assign Permissions', meta: [{ name: 'robots', content: 'noindex' }] })

const route = useRoute()
const toast = useToast()
const roleService = useRoleService()
const permissionService = usePermissionService()

const role = ref<Role | null>(null)
const allPermissions = ref<Permission[]>([])
const selectedPermissionIds = ref<string[]>([])
const loading = ref(true)
const submitting = ref(false)

const groupedPermissions = computed(() => {
  const groups: Record<string, Permission[]> = {}
  for (const perm of allPermissions.value) {
    const dotIndex = perm.name.indexOf('.')
    const group = dotIndex > -1 ? perm.name.substring(0, dotIndex) : 'other'
    if (!groups[group]) groups[group] = []
    groups[group].push(perm)
  }
  return groups
})

async function loadData() {
  loading.value = true
  try {
    const [roleRes, permsRes] = await Promise.all([
      roleService.getRole(route.params.id as string),
      permissionService.getPermissions(),
    ])
    role.value = roleRes.data
    allPermissions.value = permsRes.data
    selectedPermissionIds.value = roleRes.data.permissions?.map((p) => p.id) ?? []
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
  try {
    await roleService.assignPermissions(role.value.id, selectedPermissionIds.value)
    toast.success('Permissions updated successfully.')
  } catch (e) {
    const err = handleApiError(e)
    toast.error(err.message)
  } finally {
    submitting.value = false
  }
}

await loadData()
</script>
