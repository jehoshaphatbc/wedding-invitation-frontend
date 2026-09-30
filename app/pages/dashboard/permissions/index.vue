<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">System Capabilities (Permissions)</h1>
        <p class="text-sm text-gray-500 mt-1">Daftar seluruh permission sistem yang dapat dialokasikan ke masing-masing role.</p>
      </div>
      <NuxtLink
        to="/dashboard/roles"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
        Atur Permission di Roles
      </NuxtLink>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>

    <div v-else-if="permissions.length === 0" class="bg-white rounded-lg shadow py-12 text-center text-gray-500">
      No permissions found.
    </div>

    <div v-else class="space-y-6">
      <div v-for="(perms, group) in groupedPermissions" :key="group" class="bg-white rounded-lg shadow">
        <div class="px-4 py-3 border-b border-gray-200">
          <h2 class="text-sm font-semibold text-gray-700 uppercase">{{ group }}</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th class="px-4 py-3">Name</th>
                <th class="px-4 py-3">Display Name</th>
                <th class="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="perm in perms" :key="perm.id" class="border-b hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900">{{ perm.name }}</td>
                <td class="px-4 py-3 text-gray-600">{{ perm.display_name }}</td>
                <td class="px-4 py-3 text-gray-600">{{ perm.description ?? '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Permission } from '~/types/permission'
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Permissions', meta: [{ name: 'robots', content: 'noindex' }] })

const toast = useToast()
const { isSuperAdmin } = usePermission()

if (!isSuperAdmin.value) {
  await navigateTo('/dashboard')
}

const permissionService = usePermissionService()

const permissions = ref<Permission[]>([])
const loading = ref(true)

const groupedPermissions = computed(() => {
  const groups: Record<string, Permission[]> = {}
  for (const perm of permissions.value) {
    const dotIndex = perm.name.indexOf('.')
    const group = dotIndex > -1 ? perm.name.substring(0, dotIndex) : 'other'
    if (!groups[group]) groups[group] = []
    groups[group].push(perm)
  }
  return groups
})

async function loadPermissions() {
  loading.value = true
  try {
    const response = await permissionService.getPermissions()
    permissions.value = response.data
  } catch (e) {
    const err = handleApiError(e)
    toast.error(err.message)
  } finally {
    loading.value = false
  }
}

await loadPermissions()
</script>
