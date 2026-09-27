<template>
  <div @click="activeDropdown = null">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Users</h1>
      <NuxtLink
        v-if="hasPermission('user.create')"
        to="/dashboard/users/create"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        Add User
      </NuxtLink>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b border-gray-200 flex flex-wrap gap-4">
        <input
          v-model="search"
          type="text"
          placeholder="Search users..."
          class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
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

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>

      <div v-else-if="users.length === 0" class="py-12 text-center text-gray-500">
        No users found.
      </div>

      <div v-else class="overflow-visible">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th class="px-4 py-3">Name</th>
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3">Phone</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Roles</th>
              <th class="px-4 py-3">Created At</th>
              <th class="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id" class="border-b hover:bg-gray-50">
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
                    v-if="hasPermission('user.view')"
                    :to="`/dashboard/users/${u.id}`"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    View
                  </NuxtLink>
                  <NuxtLink
                    v-if="hasPermission('user.update')"
                    :to="`/dashboard/users/${u.id}/edit`"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Edit
                  </NuxtLink>
                  <button
                    v-if="hasPermission('user.delete')"
                    class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    @click.stop="confirmDelete(u); activeDropdown = null"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
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
      v-if="showDeleteModal && userToDelete"
      title="Delete User"
      :message="`Are you sure you want to delete ${userToDelete.name}? This action cannot be undone.`"
      confirm-text="Delete"
      :danger="true" require-input="DELETE"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
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

const users = ref<User[]>([])
const meta = ref<ApiPaginationMeta | null>(null)
const loading = ref(true)
const search = ref('')
const statusFilter = ref('')
const currentPage = ref(1)

const activeDropdown = ref<string | null>(null)
const showDeleteModal = ref(false)
const userToDelete = ref<User | null>(null)

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

async function loadUsers() {
  loading.value = true
  try {
    const response = await userService.getUsers({
      page: currentPage.value,
      per_page: 15,
      search: search.value || undefined,
      status: statusFilter.value || undefined,
    })
    users.value = response.data
    meta.value = response.meta
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
