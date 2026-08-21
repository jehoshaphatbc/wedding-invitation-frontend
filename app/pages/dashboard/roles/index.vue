<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Roles</h1>
      <NuxtLink
        v-if="hasPermission('role.create')"
        to="/dashboard/roles/create"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        Create Role
      </NuxtLink>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>

      <div v-else-if="roles.length === 0" class="py-12 text-center text-gray-500">
        No roles found.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th class="px-4 py-3">Name</th>
              <th class="px-4 py-3">Display Name</th>
              <th class="px-4 py-3">Description</th>
              <th class="px-4 py-3">System Role</th>
              <th class="px-4 py-3">Permissions</th>
              <th class="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in roles" :key="role.id" class="border-b hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-900">{{ role.name }}</td>
              <td class="px-4 py-3 text-gray-600">{{ role.display_name }}</td>
              <td class="px-4 py-3 text-gray-600">{{ role.description ?? '-' }}</td>
              <td class="px-4 py-3">
                <span
                  v-if="role.is_system"
                  class="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                >
                  System
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-gray-600">{{ role.permissions?.length ?? 0 }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <NuxtLink
                    v-if="hasPermission('role.update')"
                    :to="`/dashboard/roles/${role.id}/edit`"
                    class="text-green-600 hover:text-green-800 text-xs font-medium"
                  >
                    Edit
                  </NuxtLink>
                  <NuxtLink
                    v-if="hasPermission('permission.assign')"
                    :to="`/dashboard/roles/${role.id}/permissions`"
                    class="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                  >
                    Permissions
                  </NuxtLink>
                  <button
                    v-if="hasPermission('role.delete') && !role.is_system"
                    class="text-red-600 hover:text-red-800 text-xs font-medium"
                    @click="confirmDelete(role)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <UiConfirmModal
      v-if="showDeleteModal && roleToDelete"
      title="Delete Role"
      :message="`Are you sure you want to delete the role '${roleToDelete.display_name}'? This action cannot be undone.`"
      confirm-text="Delete"
      :danger="true"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { Role } from '~/types/role'
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Roles', meta: [{ name: 'robots', content: 'noindex' }] })

const { hasPermission } = usePermission()
const toast = useToast()
const roleService = useRoleService()

const roles = ref<Role[]>([])
const loading = ref(true)
const showDeleteModal = ref(false)
const roleToDelete = ref<Role | null>(null)

async function loadRoles() {
  loading.value = true
  try {
    const response = await roleService.getRoles()
    roles.value = response.data
  } catch (e) {
    const err = handleApiError(e)
    toast.error(err.message)
  } finally {
    loading.value = false
  }
}

function confirmDelete(role: Role) {
  roleToDelete.value = role
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!roleToDelete.value) return
  try {
    await roleService.deleteRole(roleToDelete.value.id)
    toast.success('Role deleted successfully.')
    showDeleteModal.value = false
    roleToDelete.value = null
    loadRoles()
  } catch (e) {
    const err = handleApiError(e)
    toast.error(err.message)
  }
}

await loadRoles()
</script>
