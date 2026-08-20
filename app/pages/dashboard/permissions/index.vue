<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Permissions</h1>

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
