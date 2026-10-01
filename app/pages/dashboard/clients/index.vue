<template>
  <div @click="activeDropdown = null">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Clients</h1>
        <p class="text-sm text-gray-500 mt-1">Manage client profiles, WhatsApp contacts, and membership details.</p>
      </div>
      <div class="flex gap-2">
        <button
          v-if="canViewTrash"
          @click="toggleViewMode"
          class="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          :class="viewMode === 'trash' ? 'bg-red-50 text-red-600 border-red-200' : 'text-gray-700 bg-white'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          {{ viewMode === 'trash' ? 'View Active' : 'Trash' }}
        </button>
        <button
          v-if="viewMode === 'active'"
          @click="openCreateModal"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Client
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow">
      <!-- Bulk Actions Bar -->
      <div v-if="selectedClients.length > 0" class="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center justify-between">
        <span class="text-sm text-blue-800 font-medium">{{ selectedClients.length }} clients selected</span>
        <div class="flex gap-2">
          <template v-if="viewMode === 'active'">
            <button
              @click="showBulkDeleteModal = true"
              class="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded hover:bg-red-50"
            >
              Delete Selected
            </button>
          </template>
          <template v-else>
            <button
              v-if="isSuperAdmin"
              @click="showBulkRestoreModal = true"
              class="px-3 py-1.5 text-sm font-medium text-green-600 bg-white border border-green-200 rounded hover:bg-green-50"
            >
              Restore Selected
            </button>
            <button
              v-if="isSuperAdmin"
              @click="showBulkForceDeleteModal = true"
              class="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded hover:bg-red-50"
            >
              Force Delete Selected
            </button>
          </template>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="p-4 border-b border-gray-200">
        <div class="relative w-full sm:w-80">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Search by name or email..."
            class="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-visible">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th class="px-4 py-3 w-4">
                <input type="checkbox" v-model="selectAll" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
              </th>
              <th class="px-4 py-3 cursor-pointer hover:bg-gray-100" @click="toggleSort('name')">
                Name <span v-if="sortBy === 'name'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-4 py-3 cursor-pointer hover:bg-gray-100" @click="toggleSort('email')">
                Email <span v-if="sortBy === 'email'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-4 py-3">WhatsApp</th>
              <th class="px-4 py-3 cursor-pointer hover:bg-gray-100" @click="toggleSort('created_at')">
                Joined Date <span v-if="sortBy === 'created_at'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="py-12 text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </td>
            </tr>
            <tr v-else-if="!clients || clients.length === 0">
              <td colspan="6" class="py-12 text-center text-gray-500">
                No clients found.
              </td>
            </tr>
            <template v-else>
              <tr v-for="client in clients" :key="client.id" class="border-b hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3">
                  <input type="checkbox" :value="client.id" v-model="selectedClients" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                </td>
                <td class="px-4 py-3">
                  <div class="font-medium text-gray-900">{{ client.name }}</div>
                </td>
                <td class="px-4 py-3 text-gray-600">
                  <a :href="`mailto:${client.email}`" class="hover:underline hover:text-blue-600">
                    {{ client.email }}
                  </a>
                </td>
                <td class="px-4 py-3 text-gray-600">
                  <template v-if="client.whatsapp || client.phone">
                    <a
                      :href="formatWaUrl(client.whatsapp || client.phone)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                    >
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.585 1.961.947 3.24.947 3.181 0 5.767-2.587 5.768-5.766.001-3.182-2.585-5.768-5.768-5.768zm0 10.366c-1.116 0-2.02-.345-2.85-.929l-.204-.144-1.579.414.422-1.54-.15-.238c-.627-.996-.957-1.87-.956-2.909.001-2.48 2.019-4.498 4.5-4.498 2.48 0 4.498 2.018 4.498 4.498 0 2.48-2.018 4.498-4.498 4.498z"/>
                      </svg>
                      {{ client.whatsapp || client.phone }}
                    </a>
                  </template>
                  <span v-else class="text-gray-400 italic">-</span>
                </td>
                <td class="px-4 py-3 text-gray-600">
                  {{ client.created_at ? new Date(client.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' }}
                </td>
                <td class="px-4 py-3 text-center relative">
                  <button
                    @click.stop="activeDropdown = activeDropdown === client.id ? null : client.id"
                    class="p-1 rounded hover:bg-gray-200 text-gray-500"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  <div
                    v-show="activeDropdown === client.id"
                    class="absolute right-8 top-10 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden text-left"
                  >
                    <template v-if="viewMode === 'active'">
                      <button
                        class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-gray-700"
                        @click.stop="openEditModal(client); activeDropdown = null"
                      >
                        <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                        Edit
                      </button>
                      <button
                        class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600"
                        @click.stop="confirmDelete(client); activeDropdown = null"
                      >
                        <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Delete
                      </button>
                    </template>
                    <template v-else>
                      <button
                        v-if="isSuperAdmin"
                        class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-green-600"
                        @click.stop="confirmRestore(client); activeDropdown = null"
                      >
                        <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                        </svg>
                        Restore
                      </button>
                      <button
                        v-if="isSuperAdmin"
                        class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600"
                        @click.stop="confirmForceDelete(client); activeDropdown = null"
                      >
                        <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Force Delete
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="meta && meta.last_page > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <span class="text-sm text-gray-500">
          Showing {{ (meta.page - 1) * meta.per_page + 1 }} to
          {{ Math.min(meta.page * meta.per_page, meta.total) }} of {{ meta.total }} clients
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
            class="px-3 py-1 text-sm rounded border font-medium"
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

    <!-- Modal Form Client -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          {{ editingId ? 'Edit Client' : 'Add New Client' }}
        </h3>

        <form @submit.prevent="saveClient" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="e.g. Jessica & Robert"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              v-model="form.email"
              type="email"
              required
              placeholder="client@example.com"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number *</label>
            <input
              v-model="form.whatsapp"
              type="tel"
              required
              placeholder="081234567890"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-400 mt-1">Use local (08...) or international format (628...).</p>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <div v-if="saving" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Save
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirmation Modals -->
    <UiConfirmModal
      v-if="showDeleteModal && clientToDelete"
      title="Delete Client"
      :message="`Are you sure you want to move client '${clientToDelete.name}' to trash?`"
      confirm-text="Delete"
      :danger="true"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />

    <UiConfirmModal
      v-if="showRestoreModal && clientToRestore"
      title="Restore Client"
      :message="`Are you sure you want to restore client '${clientToRestore.name}' from trash?`"
      confirm-text="Restore"
      @confirm="handleRestore"
      @cancel="showRestoreModal = false"
    />

    <UiConfirmModal
      v-if="showForceDeleteModal && clientToForceDelete"
      title="Force Delete Client"
      :message="`Are you sure you want to PERMANENTLY delete client '${clientToForceDelete.name}'? This action cannot be undone.`"
      confirm-text="Force Delete"
      :danger="true"
      require-input="DELETE"
      @confirm="handleForceDelete"
      @cancel="showForceDeleteModal = false"
    />

    <UiConfirmModal
      v-if="showBulkDeleteModal"
      title="Bulk Delete Clients"
      :message="`Are you sure you want to move ${selectedClients.length} selected clients to trash?`"
      confirm-text="Delete All"
      :danger="true"
      @confirm="handleBulkDelete"
      @cancel="showBulkDeleteModal = false"
    />

    <UiConfirmModal
      v-if="showBulkRestoreModal"
      title="Bulk Restore Clients"
      :message="`Are you sure you want to restore ${selectedClients.length} selected clients from trash?`"
      confirm-text="Restore All"
      @confirm="handleBulkRestore"
      @cancel="showBulkRestoreModal = false"
    />

    <UiConfirmModal
      v-if="showBulkForceDeleteModal"
      title="Bulk Force Delete Clients"
      :message="`Are you sure you want to PERMANENTLY delete ${selectedClients.length} selected clients?`"
      confirm-text="Force Delete All"
      :danger="true"
      require-input="DELETE"
      @confirm="handleBulkForceDelete"
      @cancel="showBulkForceDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { Client, ClientFormData } from '~/types/client'
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Clients', meta: [{ name: 'robots', content: 'noindex' }] })

const toast = useToast()
const clientService = useClientService()
const authStore = useAuthStore()

const isSuperAdmin = computed(() => authStore.user?.roles?.some(r => r.name.toLowerCase().includes('super')))
const canViewTrash = computed(() => isSuperAdmin.value)
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
  loadClients()
}

const clients = ref<Client[]>([])
const meta = ref<any>(null)
const loading = ref(true)
const search = ref('')
const currentPage = ref(1)
let searchTimeout: any

const selectedClients = ref<string[]>([])
const selectAll = computed({
  get: () => {
    if (!clients.value || clients.value.length === 0) return false
    return selectedClients.value.length === clients.value.length
  },
  set: (val) => {
    if (val && clients.value) {
      selectedClients.value = clients.value.map(c => c.id)
    } else {
      selectedClients.value = []
    }
  }
})

// Modal & Form State
const showModal = ref(false)
const saving = ref(false)
const editingId = ref<string | null>(null)
const form = ref<ClientFormData>({
  name: '',
  email: '',
  whatsapp: ''
})

// Modals Confirmation State
const clientToDelete = ref<Client | null>(null)
const clientToRestore = ref<Client | null>(null)
const clientToForceDelete = ref<Client | null>(null)
const showDeleteModal = ref(false)
const showRestoreModal = ref(false)
const showForceDeleteModal = ref(false)
const showBulkDeleteModal = ref(false)
const showBulkRestoreModal = ref(false)
const showBulkForceDeleteModal = ref(false)

function formatWaUrl(wa?: string | null): string {
  if (!wa) return '#'
  let digits = wa.replace(/\D/g, '')
  if (digits.startsWith('0')) {
    digits = '62' + digits.slice(1)
  }
  return `https://wa.me/${digits}`
}

async function loadClients() {
  selectedClients.value = []
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      per_page: 15,
      search: search.value || undefined,
      sort: sortBy.value,
      order: sortOrder.value
    }
    const response = viewMode.value === 'active'
      ? await clientService.getClients(params)
      : await clientService.getTrashedClients(params)
    
    clients.value = response?.data || (Array.isArray(response) ? response : [])
    meta.value = response?.meta || null
  } catch (e) {
    if (import.meta.client) {
      toast.error(handleApiError(e).message)
    }
  } finally {
    loading.value = false
  }
}

function toggleViewMode() {
  viewMode.value = viewMode.value === 'active' ? 'trash' : 'active'
  currentPage.value = 1
  loadClients()
}

function openCreateModal() {
  editingId.value = null
  form.value = {
    name: '',
    email: '',
    whatsapp: ''
  }
  showModal.value = true
}

function openEditModal(client: Client) {
  editingId.value = client.id
  form.value = {
    name: client.name,
    email: client.email,
    whatsapp: client.whatsapp || client.phone || ''
  }
  showModal.value = true
}

async function saveClient() {
  saving.value = true
  try {
    if (editingId.value) {
      await clientService.updateClient(editingId.value, form.value)
      toast.success('Client updated successfully')
    } else {
      await clientService.createClient(form.value)
      toast.success('Client added successfully')
    }
    showModal.value = false
    await loadClients()
  } catch (e) {
    toast.error(handleApiError(e).message)
  } finally {
    saving.value = false
  }
}

function confirmDelete(client: Client) {
  clientToDelete.value = client
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!clientToDelete.value) return
  try {
    await clientService.deleteClient(clientToDelete.value.id)
    toast.success('Client moved to trash')
    showDeleteModal.value = false
    clientToDelete.value = null
    loadClients()
  } catch (e) {
    toast.error(handleApiError(e).message)
  }
}

function confirmRestore(client: Client) {
  clientToRestore.value = client
  showRestoreModal.value = true
}

async function handleRestore() {
  if (!clientToRestore.value) return
  try {
    await clientService.restoreClient(clientToRestore.value.id)
    toast.success('Client restored successfully')
    showRestoreModal.value = false
    clientToRestore.value = null
    loadClients()
  } catch (e) {
    try {
      await clientService.bulkRestoreClients([clientToRestore.value.id])
      toast.success('Client restored successfully')
      showRestoreModal.value = false
      clientToRestore.value = null
      loadClients()
    } catch (bulkErr) {
      toast.error(handleApiError(e).message)
    }
  }
}

function confirmForceDelete(client: Client) {
  clientToForceDelete.value = client
  showForceDeleteModal.value = true
}

async function handleForceDelete() {
  if (!clientToForceDelete.value) return
  try {
    await clientService.forceDeleteClient(clientToForceDelete.value.id)
    toast.success('Client permanently deleted')
    showForceDeleteModal.value = false
    clientToForceDelete.value = null
    loadClients()
  } catch (e) {
    try {
      await clientService.bulkForceDeleteClients([clientToForceDelete.value.id])
      toast.success('Client permanently deleted')
      showForceDeleteModal.value = false
      clientToForceDelete.value = null
      loadClients()
    } catch (bulkErr) {
      toast.error(handleApiError(e).message)
    }
  }
}

async function handleBulkDelete() {
  try {
    await clientService.bulkDeleteClients(selectedClients.value)
    toast.success('Selected clients moved to trash')
    showBulkDeleteModal.value = false
    loadClients()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  }
}

async function handleBulkRestore() {
  try {
    await clientService.bulkRestoreClients(selectedClients.value)
    toast.success('Selected clients restored successfully')
    showBulkRestoreModal.value = false
    loadClients()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  }
}

async function handleBulkForceDelete() {
  try {
    await clientService.bulkForceDeleteClients(selectedClients.value)
    toast.success('Selected clients permanently deleted')
    showBulkForceDeleteModal.value = false
    loadClients()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  }
}

const visiblePages = computed(() => {
  if (!meta.value) return []
  const pages: number[] = []
  const currentPageVal = meta.value.page || meta.value.current_page || 1
  const lastPageVal = meta.value.last_page || 1
  const start = Math.max(1, currentPageVal - 2)
  const end = Math.min(lastPageVal, currentPageVal + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function goToPage(page: number) {
  currentPage.value = page
  loadClients()
}

watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadClients()
  }, 300)
})

watch(viewMode, () => {
  selectedClients.value = []
})

if (import.meta.server) {
  try {
    await loadClients()
  } catch (err) {
    console.error('SSR fetch error in clients/index.vue:', err)
  }
}

onMounted(() => {
  if (clients.value.length === 0) {
    loadClients()
  }
})
</script>
