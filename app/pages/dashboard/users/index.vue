<template>
  <div @click="activeDropdown = null">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Users</h1>
        <p class="text-sm text-gray-500 mt-1">Manage user accounts and permissions.</p>
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
          v-if="viewMode === 'active' && (isSuperAdmin || hasPermission('user.create'))"
          to="/dashboard/users/create"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Add User
        </NuxtLink>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b border-gray-200 flex flex-wrap gap-4">
        <input
          v-model="search"
          type="text"
          placeholder="Search users..."
          class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        
      <div class="flex gap-2 w-full sm:w-auto">
        <select
          v-model="roleFilter"
          @change="currentPage = 1; loadUsers()"
          class="block w-full sm:w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="">All Roles</option>
          <option value="superadmin">Superadmin</option>
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
        </select>
        <select
          v-model="statusFilter"

          class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
      </div>


      
      <div v-if="selectedUsers.length > 0" class="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center justify-between">
        <span class="text-sm text-blue-800 font-medium">{{ selectedUsers.length }} users selected</span>
        <div class="flex gap-2 items-center">
          <template v-if="viewMode === 'active'">
            <div class="flex items-center gap-2 mr-4 border-r border-blue-200 pr-4">
              <select v-model="bulkStatusTarget" class="text-sm border-gray-300 rounded-md py-1.5 pl-3 pr-8">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
              <button @click="showBulkStatusModal = true" class="px-3 py-1.5 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded hover:bg-blue-50">Update Status</button>
            </div>
            <button @click="showBulkDeleteModal = true" class="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded hover:bg-red-50">Delete Selected</button>
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
              <th class="px-4 py-3 cursor-pointer hover:bg-gray-100" @click="toggleSort('email')">Email <span v-if="sortBy==='email'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span></th>
              <th class="px-4 py-3">Phone</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Roles</th>
              <th class="px-4 py-3 cursor-pointer hover:bg-gray-100" @click="toggleSort('created_at')">Created At <span v-if="sortBy==='created_at'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span></th>
              <th class="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="py-12 text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </td>
            </tr>
            <tr v-else-if="!users || users.length === 0">
              <td colspan="8" class="py-12 text-center text-gray-500">
                No users found.
              </td>
            </tr>
            <template v-else>
              <tr v-for="u in users" :key="u.id" class="border-b hover:bg-gray-50">
              <td class="px-4 py-3"><input type="checkbox" :value="u.id" v-model="selectedUsers" :disabled="!isSuperAdmin && !canManageTarget(u)" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"></td>
                <td class="px-4 py-3 font-medium text-gray-900">{{ u.name }}</td>
              <td class="px-4 py-3 text-gray-600">{{ u.email }}</td>
              <td class="px-4 py-3 text-gray-600">{{ u.phone ?? '-' }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="statusClass(u.status)"
                >
                  {{ u.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="role in u.roles"
                    :key="role.id"
                    class="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {{ role.display_name }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-gray-600">{{ new Date(u.created_at).toLocaleDateString() }}</td>
              <td class="px-4 py-3 text-center relative">
                
                <div v-if="viewMode === 'trash'" class="flex justify-center gap-2">
                  <button
                    v-if="canManageTarget(u)"
                    @click.stop="confirmRestore(u)"
                    class="p-1 rounded text-green-600 hover:bg-green-100"
                    title="Restore User"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                  </button>
                  <button
                    v-if="canManageTarget(u)"
                    @click.stop="confirmForceDelete(u)"
                    class="p-1 rounded text-red-600 hover:bg-red-100"
                    title="Force Delete"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
                
                <template v-else>
                  <button
                    @click.stop="activeDropdown = activeDropdown === u.id ? null : u.id"
                    class="p-1 rounded hover:bg-gray-200 text-gray-500"
                  >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                
                <div
                  v-show="activeDropdown === u.id"
                  class="absolute right-8 top-10 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden text-left"
                >
                  <NuxtLink
                    v-if="isSuperAdmin || hasPermission('user.view')"
                    :to="`/dashboard/users/${u.id}`"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    View
                  </NuxtLink>
                  <NuxtLink
                    v-if="isSuperAdmin || hasPermission('user.update')"
                    :to="`/dashboard/users/${u.id}/edit`"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Edit
                  </NuxtLink>
                  <button
                    v-if="canManageTarget(u)"
                    class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    @click.stop="confirmDelete(u); activeDropdown = null"
                  >
                    Delete
                  </button>
                </div>
                </template>
              </td>
            </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div v-if="meta && meta.last_page > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <span class="text-sm text-gray-500">
          Showing {{ (meta.page - 1) * meta.per_page + 1 }} to
          {{ Math.min(meta.page * meta.per_page, meta.total) }} of {{ meta.total }}
        </span>
        <div class="flex gap-1">
          <button
            :disabled="meta.page <= 1"
            class="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
            @click="goToPage(meta.page - 1)"
          >
            Previous
          </button>
          <button
            v-for="p in visiblePages"
            :key="p"
            class="px-3 py-1 text-sm rounded border text-sm font-medium"
            :class="p === meta.page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50'"
            @click="goToPage(p)"
          >
            {{ p }}
          </button>
          <button
            :disabled="meta.page >= meta.last_page"
            class="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
            @click="goToPage(meta.page + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    
    <UiConfirmModal
      v-if="showDeleteModal && userToDelete && !isForceDelete"
      title="Delete User"
      :message="`Are you sure you want to delete ${userToDelete.name}? They will be moved to trash.`"
      confirm-text="Delete"
      :danger="true"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />

    <UiConfirmModal
      v-if="showDeleteModal && userToDelete && isForceDelete"
      title="Force Delete User"
      :message="`Are you sure you want to permanently delete ${userToDelete.name}? This action cannot be undone!`"
      confirm-text="Force Delete"
      :danger="true" require-input="DELETE"
      @confirm="handleForceDelete"
      @cancel="showDeleteModal = false"
    />

    <UiConfirmModal
      v-if="showRestoreModal && userToRestore"
      title="Restore User"
      :message="`Are you sure you want to restore ${userToRestore.name}?`"
      confirm-text="Restore"
      :danger="false"
      @confirm="handleRestore"
      @cancel="showRestoreModal = false"
    />

  
    <UiConfirmModal
      v-if="showBulkDeleteModal"
      title="Delete Selected Users"
      :message="`Are you sure you want to delete ${selectedUsers.length} users? They will be moved to trash.`"
      confirm-text="Delete"
      :danger="true"
      @confirm="handleBulkDelete"
      @cancel="showBulkDeleteModal = false"
    />

    <UiConfirmModal
      v-if="showBulkRestoreModal"
      title="Restore Selected Users"
      :message="`Are you sure you want to restore ${selectedUsers.length} users?`"
      confirm-text="Restore"
      @confirm="handleBulkRestore"
      @cancel="showBulkRestoreModal = false"
    />

    <UiConfirmModal
      v-if="showBulkForceDeleteModal"
      title="Force Delete Selected Users"
      :message="`Are you sure you want to permanently delete ${selectedUsers.length} users? This action cannot be undone.`"
      confirm-text="Force Delete"
      :danger="true" require-input="DELETE"
      @confirm="handleBulkForceDelete"
      @cancel="showBulkForceDeleteModal = false"
    />

    <UiConfirmModal
      v-if="showBulkStatusModal"
      title="Update Status"
      :message="`Are you sure you want to update the status of ${selectedUsers.length} users to '${bulkStatusTarget}'?`"
      confirm-text="Update Status"
      @confirm="handleBulkStatus"
      @cancel="showBulkStatusModal = false"
    />

  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types/user'
import type { ApiPaginationMeta } from '~/types/api'
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Users', meta: [{ name: 'robots', content: 'noindex' }] })

const { hasPermission } = usePermission()
const toast = useToast()

const userService = useUserService()

const authStore = useAuthStore()
const isSuperAdmin = computed(() => authStore.user?.roles?.some(r => r.name.toLowerCase().includes('super')))
const isAdmin = computed(() => authStore.user?.roles?.some(r => r.name.toLowerCase().includes('admin') && !r.name.toLowerCase().includes('super')))
const canViewTrash = computed(() => isSuperAdmin.value)

function canManageTarget(target: User) {
  if (isSuperAdmin.value) return true
  if (isAdmin.value) {
    // Admin can ONLY manage customers
    return target.roles?.some(r => r.name.toLowerCase().includes('customer')) || false
  }
  return false
}


const users = ref<User[]>([])
const meta = ref<ApiPaginationMeta | null>(null)
const loading = ref(true)
const search = ref('')

const statusFilter = ref('')
const roleFilter = ref('')

const currentPage = ref(1)

const activeDropdown = ref<string | null>(null)
const showDeleteModal = ref(false)
const userToDelete = ref<User | null>(null)

const viewMode = ref<'active' | 'trash'>('active')
const isForceDelete = ref(false)
const showRestoreModal = ref(false)
const userToRestore = ref<User | null>(null)

function toggleViewMode() {
  viewMode.value = viewMode.value === 'active' ? 'trash' : 'active'
  currentPage.value = 1
  loadUsers()
}

function confirmForceDelete(user: User) {
  userToDelete.value = user
  isForceDelete.value = true
  showDeleteModal.value = true
}

function confirmRestore(user: User) {
  userToRestore.value = user
  showRestoreModal.value = true
}

async function handleForceDelete() {
  if (!userToDelete.value) return
  try {
    await userService.forceDeleteUser(userToDelete.value.id)
    toast.success('User permanently deleted.')
    showDeleteModal.value = false
    userToDelete.value = null
    loadUsers()
  } catch (e) {
    const err = handleApiError(e)
    toast.error(err.message)
  }
}

async function handleRestore() {
  if (!userToRestore.value) return
  try {
    await userService.restoreUser(userToRestore.value.id)
    toast.success('User restored successfully.')
    showRestoreModal.value = false
    userToRestore.value = null
    loadUsers()
  } catch (e) {
    const err = handleApiError(e)
    toast.error(err.message)
  }
}


let searchTimeout: ReturnType<typeof setTimeout>

const visiblePages = computed(() => {
  if (!meta.value) return []
  const pages: number[] = []
  const start = Math.max(1, meta.value.page - 2)
  const end = Math.min(meta.value.last_page, meta.value.page + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function statusClass(status: string) {
  if (status === 'active') return 'bg-green-100 text-green-800'
  if (status === 'inactive') return 'bg-gray-100 text-gray-800'
  if (status === 'suspended') return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}


const selectedUsers = ref<string[]>([])

const selectAll = computed({
  get: () => {
    if (!users.value || users.value.length === 0) return false;
    return selectedUsers.value.length === users.value.length;
  },
  set: (val) => {
    if (val) {
      // If admin, they can only select users they can manage
      if (!users.value) return;
      selectedUsers.value = users.value.filter(u => isSuperAdmin.value || canManageTarget(u)).map(u => u.id)
    } else {
      selectedUsers.value = []
    }
  }
})

const showBulkDeleteModal = ref(false)
const showBulkRestoreModal = ref(false)
const showBulkForceDeleteModal = ref(false)
const showBulkStatusModal = ref(false)
const bulkStatusTarget = ref('active')

async function handleBulkDelete() {
  try {
    await userService.bulkDeleteUsers(selectedUsers.value)
    toast.success('Selected users deleted successfully')
    showBulkDeleteModal.value = false
    loadUsers()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  }
}

async function handleBulkRestore() {
  try {
    await userService.bulkRestoreUsers(selectedUsers.value)
    toast.success('Selected users restored successfully')
    showBulkRestoreModal.value = false
    loadUsers()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  }
}

async function handleBulkForceDelete() {
  try {
    await userService.bulkForceDeleteUsers(selectedUsers.value)
    toast.success('Selected users permanently deleted')
    showBulkForceDeleteModal.value = false
    loadUsers()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  }
}

async function handleBulkStatus() {
  try {
    await userService.bulkUpdateUserStatus(selectedUsers.value, bulkStatusTarget.value)
    toast.success('Selected users status updated')
    showBulkStatusModal.value = false
    loadUsers()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  }
}

// Watch viewMode to reset selection
watch(viewMode, () => {
  selectedUsers.value = []
})

const sortBy = ref('created_at')
const sortOrder = ref('desc')

function toggleSort(field: string) {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
  loadUsers()
}


async function loadUsers() {
  selectedUsers.value = []

  loading.value = true
  users.value = []
  meta.value = null
  try {
    
    const response = viewMode.value === 'active' 
      ? await userService.getUsers({
          page: currentPage.value,
          per_page: 15,
          search: search.value || undefined,
          sort: sortBy.value,
          order: sortOrder.value,
          status: statusFilter.value || undefined,
          role: roleFilter.value || undefined,
        })
      : await userService.getTrashedUsers({
          page: currentPage.value,
          per_page: 15,
          search: search.value || undefined,
          sort: sortBy.value,
          order: sortOrder.value,
        })

    users.value = response?.data || []
    meta.value = response?.meta || null
  } catch (e) {
    const err = handleApiError(e)
    toast.error(err.message)
  } finally {
    loading.value = false
  }
}

function goToPage(page: number) {
  currentPage.value = page
  loadUsers()
}

function confirmDelete(user: User) {
  isForceDelete.value = false
  userToDelete.value = user
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!userToDelete.value) return
  try {
    await userService.deleteUser(userToDelete.value.id)
    toast.success('User deleted successfully.')
    showDeleteModal.value = false
    userToDelete.value = null
    loadUsers()
  } catch (e) {
    const err = handleApiError(e)
    toast.error(err.message)
  }
}

watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadUsers()
  }, 300)
})

watch(statusFilter, () => {
  currentPage.value = 1
  loadUsers()
})

await loadUsers()
</script>
