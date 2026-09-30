<template>
  <div @click="activeDropdown = null">
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
      
      <div v-if="selectedRoles.length > 0" class="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center justify-between">
        <span class="text-sm text-blue-800 font-medium">{{ selectedRoles.length }} roles selected</span>
        <div class="flex gap-2">
          <template v-if="viewMode === 'active'">
            <button v-if="isSuperAdmin || hasPermission('role.delete')" @click="showBulkDeleteModal = true" class="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded hover:bg-red-50">Delete Selected</button>
          </template>
          <template v-else>
            <button v-if="isSuperAdmin" @click="showBulkRestoreModal = true" class="px-3 py-1.5 text-sm font-medium text-green-600 bg-white border border-green-200 rounded hover:bg-green-50">Restore Selected</button>
            <button v-if="isSuperAdmin" @click="showBulkForceDeleteModal = true" class="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded hover:bg-red-50">Force Delete Selected</button>
          </template>
        </div>
      </div>

      <div class="overflow-visible">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th class="px-4 py-3 w-4"><input type="checkbox" v-model="selectAll" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"></th>
              <th class="px-4 py-3 cursor-pointer hover:bg-gray-100" @click="toggleSort('name')">Name <span v-if="sortBy==='name'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span></th>
              <th class="px-4 py-3">Display Name</th>
              <th class="px-4 py-3">Description</th>
              <th class="px-4 py-3">System Role</th>
              <th class="px-4 py-3">Permissions</th>
              <th class="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="py-12 text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </td>
            </tr>
            <tr v-else-if="!roles || roles.length === 0">
              <td colspan="7" class="py-12 text-center text-gray-500">
                No roles found.
              </td>
            </tr>
            <template v-else>
              <tr v-for="role in roles" :key="role.id" class="border-b hover:bg-gray-50">
                <td class="px-4 py-3"><input type="checkbox" :value="role.id" v-model="selectedRoles" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"></td>
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
              <td class="px-4 py-3 text-center relative">
                <button
                  @click.stop="activeDropdown = activeDropdown === role.id ? null : role.id"
                  class="p-1 rounded hover:bg-gray-200 text-gray-500"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                
                <div
                  v-show="activeDropdown === role.id"
                  class="absolute right-8 top-10 mt-1 w-44 bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden text-left"
                >
                  <template v-if="viewMode === 'active'">
                    <NuxtLink
                      v-if="isSuperAdmin || hasPermission('role.update')"
                      :to="`/dashboard/roles/${role.id}/edit`"
                      class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 text-gray-700">
                      <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>Edit
                    </NuxtLink>
                    <NuxtLink
                      v-if="isSuperAdmin || hasPermission('permission.assign')"
                      :to="`/dashboard/roles/${role.id}/permissions`"
                      class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 text-indigo-600">
                    <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>Permissions
                    </NuxtLink>
                    <button
                      v-if="(isSuperAdmin || hasPermission('role.delete')) && !role.is_system"
                      class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600" @click.stop="confirmDelete(role); activeDropdown = null">
                      <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>Delete
                    </button>
                  </template>
                  <template v-else>
                    <button
                      class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-green-600" @click.stop="confirmRestore(role); activeDropdown = null">
                      <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>Restore
                    </button>
                    <button
                      class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600" @click.stop="confirmForceDelete(role); activeDropdown = null">
                      <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>Force Delete
                    </button>
                  </template>
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

  
    <UiConfirmModal
      v-if="showBulkDeleteModal"
      title="Delete Selected Roles"
      :message="`Are you sure you want to delete ${selectedRoles.length} roles? They will be moved to trash.`"
      confirm-text="Delete"
      :danger="true"
      @confirm="handleBulkDelete"
      @cancel="showBulkDeleteModal = false"
    />

    <UiConfirmModal
      v-if="showBulkRestoreModal"
      title="Restore Selected Roles"
      :message="`Are you sure you want to restore ${selectedRoles.length} roles?`"
      confirm-text="Restore"
      @confirm="handleBulkRestore"
      @cancel="showBulkRestoreModal = false"
    />

    <UiConfirmModal
      v-if="showBulkForceDeleteModal"
      title="Force Delete Selected Roles"
      :message="`Are you sure you want to permanently delete ${selectedRoles.length} roles? This action cannot be undone.`"
      confirm-text="Force Delete"
      :danger="true" require-input="DELETE"
      @confirm="handleBulkForceDelete"
      @cancel="showBulkForceDeleteModal = false"
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
const activeDropdown = ref<string | null>(null)

const sortBy = ref('created_at')
const sortOrder = ref('desc')

function toggleSort(field: string) {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
  loadRoles()
}
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



const selectedRoles = ref<string[]>([])

const selectAll = computed({
  get: () => {
    if (!roles.value || roles.value.length === 0) return false;
    return selectedRoles.value.length === roles.value.length;
  },
  set: (val) => {
    if (val) {
      if (!roles.value) return;
      selectedRoles.value = roles.value.map(r => r.id)
    } else {
      selectedRoles.value = []
    }
  }
})

const showBulkDeleteModal = ref(false)
const showBulkRestoreModal = ref(false)
const showBulkForceDeleteModal = ref(false)

async function handleBulkDelete() {
  try {
    await roleService.bulkDeleteRoles(selectedRoles.value)
    toast.success('Selected roles deleted successfully')
    showBulkDeleteModal.value = false
    loadRoles()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  }
}

async function handleBulkRestore() {
  try {
    await roleService.bulkRestoreRoles(selectedRoles.value)
    toast.success('Selected roles restored successfully')
    showBulkRestoreModal.value = false
    loadRoles()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  }
}

async function handleBulkForceDelete() {
  try {
    await roleService.bulkForceDeleteRoles(selectedRoles.value)
    toast.success('Selected roles permanently deleted')
    showBulkForceDeleteModal.value = false
    loadRoles()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  }
}

// Watch viewMode to reset selection
watch(viewMode, () => {
  selectedRoles.value = []
})


async function loadRoles() {
  selectedRoles.value = []

  loading.value = true
  roles.value = []
  try {
    
    const params = { sort: sortBy.value, order: sortOrder.value }
    const response = viewMode.value === 'active' 
      ? await roleService.getRoles(params as any)
      : await roleService.getTrashedRoles(params)
    roles.value = response?.data || [] || response // Handle both cases if response structure differs

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
