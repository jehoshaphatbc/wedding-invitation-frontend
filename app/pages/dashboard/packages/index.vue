<template>
  <div @click="activeDropdown = null">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Packages</h1>
        <p class="text-sm text-gray-500 mt-1">Manage subscription packages and feature limits.</p>
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
        <button
          v-if="viewMode === 'active'"
          @click="openCreateModal"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Tambah Baru
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow">
      
      <!-- Bulk Actions Bar -->
      <div v-if="selectedPackages.length > 0" class="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center justify-between">
        <span class="text-sm text-blue-800 font-medium">{{ selectedPackages.length }} packages selected</span>
        <div class="flex gap-2">
          <template v-if="viewMode === 'active'">
            <button @click="showBulkDeleteModal = true" class="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded hover:bg-red-50">Delete Selected</button>
          </template>
          <template v-else>
            <button v-if="isSuperAdmin" @click="showBulkRestoreModal = true" class="px-3 py-1.5 text-sm font-medium text-green-600 bg-white border border-green-200 rounded hover:bg-green-50">Restore Selected</button>
            <button v-if="isSuperAdmin" @click="showBulkForceDeleteModal = true" class="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded hover:bg-red-50">Force Delete Selected</button>
          </template>
        </div>
      </div>

      <div class="p-4 border-b border-gray-200">
        <input
          v-model="search"
          type="text"
          placeholder="Search packages..."
          class="w-full sm:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div class="overflow-visible">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th class="px-4 py-3 w-4"><input type="checkbox" v-model="selectAll" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"></th>
              <th class="px-4 py-3 cursor-pointer hover:bg-gray-100" @click="toggleSort('name')">Nama Paket <span v-if="sortBy==='name'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span></th>
              <th class="px-4 py-3 cursor-pointer hover:bg-gray-100" @click="toggleSort('price')">Harga <span v-if="sortBy==='price'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span></th>
              <th class="px-4 py-3">Fitur</th>
              <th class="px-4 py-3 cursor-pointer hover:bg-gray-100" @click="toggleSort('created_at')">Created At <span v-if="sortBy==='created_at'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span></th>
              <th class="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="py-12 text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </td>
            </tr>
            <tr v-else-if="!packages || packages.length === 0">
              <td colspan="6" class="py-12 text-center text-gray-500">
                No packages found.
              </td>
            </tr>
            <template v-else>
              <tr v-for="pkg in packages" :key="pkg.id" class="border-b hover:bg-gray-50">
                <td class="px-4 py-3"><input type="checkbox" :value="pkg.id" v-model="selectedPackages" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"></td>
                <td class="px-4 py-3 font-medium text-gray-900">{{ pkg.name }}</td>
                <td class="px-4 py-3 text-gray-600">Rp {{ pkg.price.toLocaleString('id-ID') }}</td>
                <td class="px-4 py-3 text-gray-500 text-xs">
                  <div class="flex flex-wrap gap-1">
                    <span v-if="pkg.features_config?.has_gallery" class="px-2 py-0.5 bg-green-100 text-green-800 rounded">Galeri ({{ pkg.features_config.gallery_limit || '0' }})</span>
                    <span v-if="pkg.features_config?.has_story" class="px-2 py-0.5 bg-blue-100 text-blue-800 rounded">Story</span>
                    <span v-if="pkg.features_config?.has_rsvp" class="px-2 py-0.5 bg-purple-100 text-purple-800 rounded">RSVP</span>
                    <span v-if="pkg.features_config?.has_wishes" class="px-2 py-0.5 bg-pink-100 text-pink-800 rounded">Wishes</span>
                    <span v-if="pkg.features_config?.has_video" class="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded">Video</span>
                    <span v-if="pkg.features_config?.has_qr" class="px-2 py-0.5 bg-teal-100 text-teal-800 rounded">QR</span>
                    <span v-if="pkg.features_config?.max_guests" class="px-2 py-0.5 bg-gray-100 text-gray-800 rounded">Maks Tamu: {{ pkg.features_config.max_guests }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-600">{{ new Date(pkg.created_at).toLocaleDateString('id-ID') }}</td>
                <td class="px-4 py-3 text-center relative">
                <button
                  @click.stop="activeDropdown = activeDropdown === pkg.id ? null : pkg.id"
                  class="p-1 rounded hover:bg-gray-200 text-gray-500"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                
                <div
                  v-show="activeDropdown === pkg.id"
                  class="absolute right-8 top-10 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden text-left"
                >
                  <template v-if="viewMode === 'active'">
                    <button
                      class="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      @click.stop="openEditModal(pkg); activeDropdown = null"
                    >
                      Edit
                    </button>
                    <button
                      class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      @click.stop="confirmDelete(pkg); activeDropdown = null"
                    >
                      Delete
                    </button>
                  </template>
                  <template v-else>
                    <button
                      v-if="isSuperAdmin"
                      class="w-full text-left block px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                      @click.stop="confirmRestore(pkg); activeDropdown = null"
                    >
                      Restore
                    </button>
                    <button
                      v-if="isSuperAdmin"
                      class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      @click.stop="confirmForceDelete(pkg); activeDropdown = null"
                    >
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
      <div v-if="meta && meta.last_page > 1" class="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-500">
          Showing <span class="font-medium">{{ (meta.current_page - 1) * meta.per_page + 1 }}</span> to <span class="font-medium">{{ Math.min(meta.current_page * meta.per_page, meta.total) }}</span> of <span class="font-medium">{{ meta.total }}</span> results
        </div>
        <div class="flex gap-1">
          <button
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
            class="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            :disabled="currentPage === meta.last_page"
            @click="goToPage(currentPage + 1)"
            class="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form Package -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 my-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ editingId ? 'Edit Package' : 'Create Package' }}</h3>
        
        <form @submit.prevent="savePackage" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Paket</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
            <input
              v-model.number="form.price"
              type="number"
              required
              min="0"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div class="border-t border-gray-200 pt-4 mt-4">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Konfigurasi Fitur</h4>
            
            <div class="space-y-3">
              <div>
                <label class="flex items-center gap-2">
                  <input type="checkbox" v-model="form.features_config.has_gallery" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700">Gunakan Galeri</span>
                </label>
                <div v-if="form.features_config.has_gallery" class="mt-2 pl-6">
                  <label class="block text-xs text-gray-500 mb-1">Limit Foto Galeri</label>
                  <input
                    v-model.number="form.features_config.gallery_limit"
                    type="number"
                    min="1"
                    class="w-full sm:w-1/2 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <label class="flex items-center gap-2">
                  <input type="checkbox" v-model="form.features_config.has_story" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700">Love Story</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" v-model="form.features_config.has_rsvp" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700">RSVP</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" v-model="form.features_config.has_wishes" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700">Ucapan (Wishes)</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" v-model="form.features_config.has_video" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700">Video Undangan</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" v-model="form.features_config.has_qr" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700">QR Code</span>
                </label>
              </div>

              <div class="pt-2">
                <label class="block text-sm text-gray-700 mb-1">Batas Maksimal Tamu</label>
                <input
                  v-model.number="form.features_config.max_guests"
                  type="number"
                  min="0"
                  placeholder="0 untuk unlimited"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <div v-if="saving" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modals -->
    <UiConfirmModal
      v-if="showDeleteModal && packageToDelete"
      title="Hapus Paket"
      :message="`Apakah Anda yakin ingin memindahkan paket '${packageToDelete.name}' ke sampah?`"
      confirm-text="Hapus"
      :danger="true"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
    <UiConfirmModal
      v-if="showRestoreModal && packageToRestore"
      title="Restore Paket"
      :message="`Apakah Anda yakin ingin mengembalikan paket '${packageToRestore.name}' dari sampah?`"
      confirm-text="Restore"
      @confirm="handleRestore"
      @cancel="showRestoreModal = false"
    />
    <UiConfirmModal
      v-if="showForceDeleteModal && packageToForceDelete"
      title="Force Delete Paket"
      :message="`Apakah Anda yakin ingin menghapus PERMANEN paket '${packageToForceDelete.name}'? Aksi ini tidak dapat dibatalkan.`"
      confirm-text="Force Delete"
      :danger="true" require-input="DELETE"
      @confirm="handleForceDelete"
      @cancel="showForceDeleteModal = false"
    />

    <UiConfirmModal v-if="showBulkDeleteModal" title="Bulk Delete" :message="`Are you sure you want to delete ${selectedPackages.length} packages?`" confirm-text="Delete" :danger="true" @confirm="handleBulkDelete" @cancel="showBulkDeleteModal = false" />
    <UiConfirmModal v-if="showBulkRestoreModal" title="Bulk Restore" :message="`Are you sure you want to restore ${selectedPackages.length} packages?`" confirm-text="Restore" @confirm="handleBulkRestore" @cancel="showBulkRestoreModal = false" />
    <UiConfirmModal v-if="showBulkForceDeleteModal" title="Bulk Force Delete" :message="`Are you sure you want to permanently delete ${selectedPackages.length} packages?`" confirm-text="Force Delete" :danger="true" require-input="DELETE" @confirm="handleBulkForceDelete" @cancel="showBulkForceDeleteModal = false" />
  </div>
</template>

<script setup lang="ts">
import type { Package, PackageFeatures } from '~/types/package'
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Packages', meta: [{ name: 'robots', content: 'noindex' }] })

const toast = useToast()
const packageService = usePackageService()
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
  loadPackages()
}

const packages = ref<Package[]>([])
const meta = ref<any>(null)
const loading = ref(true)
const search = ref('')
const currentPage = ref(1)
let searchTimeout: any

const selectedPackages = ref<string[]>([])
const selectAll = computed({
  get: () => {
    if (!packages.value || packages.value.length === 0) return false;
    return selectedPackages.value.length === packages.value.length;
  },
  set: (val) => {
    if (val) {
      if (!packages.value) return;
      selectedPackages.value = packages.value.map(p => p.id)
    } else {
      selectedPackages.value = []
    }
  }
})

const showModal = ref(false)
const saving = ref(false)
const editingId = ref<string | null>(null)
const form = ref<{ name: string; price: number; features_config: PackageFeatures }>({
  name: '', price: 0,
  features_config: { has_gallery: false, gallery_limit: 10, has_story: false, has_rsvp: false, has_wishes: false, has_video: false, has_qr: false, max_guests: 100 }
})

const showDeleteModal = ref(false)
const packageToDelete = ref<Package | null>(null)
const showRestoreModal = ref(false)
const packageToRestore = ref<Package | null>(null)
const showForceDeleteModal = ref(false)
const packageToForceDelete = ref<Package | null>(null)

const showBulkDeleteModal = ref(false)
const showBulkRestoreModal = ref(false)
const showBulkForceDeleteModal = ref(false)

async function loadPackages() {
  selectedPackages.value = []
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
      ? await packageService.getPackages(params)
      : await packageService.getTrashedPackages(params)
    packages.value = response?.data || []
    meta.value = response?.meta || null
  } catch (e) {
    toast.error(handleApiError(e).message)
  } finally {
    loading.value = false
  }
}

function toggleViewMode() {
  viewMode.value = viewMode.value === 'active' ? 'trash' : 'active'
  currentPage.value = 1
  loadPackages()
}

function openCreateModal() {
  editingId.value = null
  form.value = {
    name: '', price: 0,
    features_config: { has_gallery: false, gallery_limit: 10, has_story: false, has_rsvp: false, has_wishes: false, has_video: false, has_qr: false, max_guests: 100 }
  }
  showModal.value = true
}

function openEditModal(pkg: Package) {
  editingId.value = pkg.id
  form.value = {
    name: pkg.name, price: pkg.price,
    features_config: {
      has_gallery: pkg.features_config?.has_gallery || false,
      gallery_limit: pkg.features_config?.gallery_limit || 10,
      has_story: pkg.features_config?.has_story || false,
      has_rsvp: pkg.features_config?.has_rsvp || false,
      has_wishes: pkg.features_config?.has_wishes || false,
      has_video: pkg.features_config?.has_video || false,
      has_qr: pkg.features_config?.has_qr || false,
      max_guests: pkg.features_config?.max_guests || 0,
    }
  }
  showModal.value = true
}

async function savePackage() {
  saving.value = true
  try {
    const payload = {
      name: form.value.name,
      price: Number(form.value.price),
      features_config: {
        has_gallery: !!form.value.features_config.has_gallery,
        gallery_limit: Number(form.value.features_config.gallery_limit) || 0,
        has_story: !!form.value.features_config.has_story,
        has_rsvp: !!form.value.features_config.has_rsvp,
        has_wishes: !!form.value.features_config.has_wishes,
        has_video: !!form.value.features_config.has_video,
        has_qr: !!form.value.features_config.has_qr,
        max_guests: Number(form.value.features_config.max_guests) || 0,
      }
    }
    if (editingId.value) {
      await packageService.updatePackage(editingId.value, payload)
      toast.success('Paket berhasil diperbarui')
    } else {
      await packageService.createPackage(payload)
      toast.success('Paket berhasil ditambahkan')
    }
    showModal.value = false
    loadPackages()
  } catch (e) {
    toast.error(handleApiError(e).message)
  } finally {
    saving.value = false
  }
}

function confirmDelete(pkg: Package) { packageToDelete.value = pkg; showDeleteModal.value = true }
async function handleDelete() {
  if (!packageToDelete.value) return
  try {
    await packageService.deletePackage(packageToDelete.value.id)
    toast.success('Paket berhasil dihapus')
    showDeleteModal.value = false
    loadPackages()
  } catch (e) { toast.error(handleApiError(e).message) }
}

function confirmRestore(pkg: Package) { packageToRestore.value = pkg; showRestoreModal.value = true }
async function handleRestore() {
  if (!packageToRestore.value) return
  try {
    await packageService.bulkRestorePackages([packageToRestore.value.id])
    toast.success('Paket berhasil dikembalikan')
    showRestoreModal.value = false
    loadPackages()
  } catch (e) { toast.error(handleApiError(e).message) }
}

function confirmForceDelete(pkg: Package) { packageToForceDelete.value = pkg; showForceDeleteModal.value = true }
async function handleForceDelete() {
  if (!packageToForceDelete.value) return
  try {
    await packageService.bulkForceDeletePackages([packageToForceDelete.value.id])
    toast.success('Paket permanen dihapus')
    showForceDeleteModal.value = false
    loadPackages()
  } catch (e) { toast.error(handleApiError(e).message) }
}

async function handleBulkDelete() {
  try {
    await packageService.bulkDeletePackages(selectedPackages.value)
    toast.success('Selected packages deleted')
    showBulkDeleteModal.value = false
    loadPackages()
  } catch (e: any) { toast.error(handleApiError(e).message) }
}

async function handleBulkRestore() {
  try {
    await packageService.bulkRestorePackages(selectedPackages.value)
    toast.success('Selected packages restored')
    showBulkRestoreModal.value = false
    loadPackages()
  } catch (e: any) { toast.error(handleApiError(e).message) }
}

async function handleBulkForceDelete() {
  try {
    await packageService.bulkForceDeletePackages(selectedPackages.value)
    toast.success('Selected packages permanently deleted')
    showBulkForceDeleteModal.value = false
    loadPackages()
  } catch (e: any) { toast.error(handleApiError(e).message) }
}

function goToPage(page: number) { currentPage.value = page; loadPackages() }
watch(search, () => { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => { currentPage.value = 1; loadPackages() }, 300) })

await loadPackages()
</script>
