<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Roles</h1>
        <p class="text-sm text-gray-500 mt-1">Manage system roles and permissions.</p>
      </div>
      <div class="flex gap-2">
        <button
          v-if="canViewTrash"
          @click="toggleViewMode"
          class="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          :class="viewMode === 'trash' ? 'bg-red-50 text-red-600 border-red-200' : 'text-gray-700 bg-white'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          {{ viewMode === 'trash' ? 'View Active' : 'Trash' }}
        </button>
        <NuxtLink
          v-if="viewMode === 'active' && (isSuperAdmin || hasPermission('role.create'))"
          to="/dashboard/roles/create"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Create Role
        </NuxtLink>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div class="overflow-x-auto">
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
            <tr v-if="loading">
              <td colspan="6" class="py-12 text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </td>
            </tr>
            <tr v-else-if="!roles || roles.length === 0">
              <td colspan="6" class="py-12 text-center text-gray-500">
                No roles found.
              </td>
            </tr>
            <template v-else>
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
                <div v-if="viewMode === 'trash'" class="flex gap-2">
                  <button
                    @click.stop="confirmRestore(role)"
                    class="text-green-600 hover:text-green-800 text-xs font-medium"
                    title="Restore Role"
                  >
                    Restore
                  </button>
                  <button
                    @click.stop="confirmForceDelete(role)"
                    class="text-red-600 hover:text-red-800 text-xs font-medium"
                    title="Force Delete"
                  >
                    Force Delete
                  </button>
                </div>
                <div v-else class="flex gap-2">
                  <NuxtLink
                    v-if="isSuperAdmin || hasPermission('role.update')"
                    :to="`/dashboard/roles/${role.id}/edit`"
                    class="text-green-600 hover:text-green-800 text-xs font-medium"
                  >
                    Edit
                  </NuxtLink>
                  <NuxtLink
                    v-if="isSuperAdmin || hasPermission('permission.assign')"
                    :to="`/dashboard/roles/${role.id}/permissions`"
                    class="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                  >
                    Permissions
                  </NuxtLink>
                  <button
                    v-if="(isSuperAdmin || hasPermission('role.delete')) && !role.is_system"
                    class="text-red-600 hover:text-red-800 text-xs font-medium"
                    @click="confirmDelete(role)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    
    <UiConfirmModal
      v-if="showDeleteModal && roleToDelete && !isForceDelete"
      title="Delete Role"
      :message="`Are you sure you want to delete the '${roleToDelete.display_name}' role? Users with this role might lose access.`"
      confirm-text="Delete"
      :danger="true"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />

    <UiConfirmModal
      v-if="showDeleteModal && roleToDelete && isForceDelete"
      title="Force Delete Role"
      :message="`Are you sure you want to permanently delete '${roleToDelete.display_name}'? This action cannot be undone!`"
      confirm-text="Force Delete"
      :danger="true" require-input="DELETE"
      @confirm="handleForceDelete"
      @cancel="showDeleteModal = false"
    />

    <UiConfirmModal
      v-if="showRestoreModal && roleToRestore"
      title="Restore Role"
      :message="`Are you sure you want to restore '${roleToRestore.display_name}'?`"
      confirm-text="Restore"
      :danger="false"
      @confirm="handleRestore"
      @cancel="showRestoreModal = false"
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

const authStore = useAuthStore()
const isSuperAdmin = computed(() => authStore.user?.roles?.some(r => r.name.toLowerCase().includes('super')))
const isAdmin = computed(() => authStore.user?.roles?.some(r => r.name.toLowerCase().includes('admin') && !r.name.toLowerCase().includes('super')))
const canViewTrash = computed(() => isSuperAdmin.value)


const roles = ref<Role[]>([])
const loading = ref(true)
const showDeleteModal = ref(false)
const roleToDelete = ref<Role | null>(null)

const viewMode = ref<'active' | 'trash'>('active')
const isForceDelete = ref(false)
const showRestoreModal = ref(false)
const roleToRestore = ref<Role | null>(null)

function toggleViewMode() {
  viewMode.value = viewMode.value === 'active' ? 'trash' : 'active'
  loadRoles()
}

function confirmForceDelete(role: Role) {
  roleToDelete.value = role
  isForceDelete.value = true
  showDeleteModal.value = true
}

function confirmRestore(role: Role) {
  roleToRestore.value = role
  showRestoreModal.value = true
}

async function handleForceDelete() {
  if (!roleToDelete.value) return
  try {
    await roleService.forceDeleteRole(roleToDelete.value.id)
    toast.success('Role permanently deleted.')
    showDeleteModal.value = false
    roleToDelete.value = null
    loadRoles()
  } catch (e) {
    const err = handleApiError(e)
    toast.error(err.message)
  }
}

async function handleRestore() {
  if (!roleToRestore.value) return
  try {
    await roleService.restoreRole(roleToRestore.value.id)
    toast.success('Role restored successfully.')
    showRestoreModal.value = false
    roleToRestore.value = null
    loadRoles()
  } catch (e) {
    const err = handleApiError(e)
    toast.error(err.message)
  }
}


async function loadRoles() {
  loading.value = true
  roles.value = []
  try {
    
    const response = viewMode.value === 'active' 
      ? await roleService.getRoles()
      : await roleService.getTrashedRoles()
    roles.value = response.data || response // Handle both cases if response structure differs

  } catch (e) {
    const err = handleApiError(e)
    toast.error(err.message)
  } finally {
    loading.value = false
  }
}

function confirmDelete(role: Role) {
  isForceDelete.value = false
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
