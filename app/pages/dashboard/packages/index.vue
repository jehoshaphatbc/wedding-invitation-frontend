<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Packages</h1>
        <p class="text-sm text-gray-500 mt-1">Manage subscription packages and feature limits.</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="openCreateModal"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Tambah Baru
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b border-gray-200">
        <input
          v-model="search"
          type="text"
          placeholder="Search packages..."
          class="w-full sm:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th class="px-4 py-3">Nama Paket</th>
              <th class="px-4 py-3">Harga</th>
              <th class="px-4 py-3">Fitur</th>
              <th class="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="4" class="py-12 text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </td>
            </tr>
            <tr v-else-if="!packages || packages.length === 0">
              <td colspan="4" class="py-12 text-center text-gray-500">
                No packages found.
              </td>
            </tr>
            <template v-else>
              <tr v-for="pkg in packages" :key="pkg.id" class="border-b hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900">{{ pkg.name }}</td>
                <td class="px-4 py-3 text-gray-600">Rp {{ pkg.price.toLocaleString('id-ID') }}</td>
                <td class="px-4 py-3 text-gray-500 text-xs">
                  <div class="flex flex-wrap gap-1">
                    <span v-if="pkg.features_config?.has_gallery" class="px-2 py-0.5 bg-green-100 text-green-800 rounded">Galeri ({{ pkg.features_config.gallery_limit || '0' }})</span>
                    <span v-if="pkg.features_config?.has_story" class="px-2 py-0.5 bg-blue-100 text-blue-800 rounded">Story</span>
                    <span v-if="pkg.features_config?.has_rsvp" class="px-2 py-0.5 bg-purple-100 text-purple-800 rounded">RSVP</span>
                    <span v-if="pkg.features_config?.has_wishes" class="px-2 py-0.5 bg-pink-100 text-pink-800 rounded">Wishes</span>
                    <span v-if="pkg.features_config?.max_guests" class="px-2 py-0.5 bg-gray-100 text-gray-800 rounded">Maks Tamu: {{ pkg.features_config.max_guests }}</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <button
                      @click="openEditModal(pkg)"
                      class="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Edit
                    </button>
                    <button
                      @click="confirmDelete(pkg)"
                      class="text-red-600 hover:text-red-800 text-xs font-medium"
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
              <!-- Gallery -->
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

              <!-- Other Boolean Features -->
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="form.features_config.has_story" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                <span class="text-sm text-gray-700">Fitur Love Story</span>
              </label>
              
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="form.features_config.has_rsvp" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                <span class="text-sm text-gray-700">Fitur RSVP</span>
              </label>

              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="form.features_config.has_wishes" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                <span class="text-sm text-gray-700">Fitur Ucapan (Wishes)</span>
              </label>

              <!-- Max Guests -->
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

    <!-- Delete Confirmation Modal -->
    <UiConfirmModal
      v-if="showDeleteModal && packageToDelete"
      title="Hapus Paket"
      :message="`Apakah Anda yakin ingin menghapus paket '${packageToDelete.name}'?`"
      confirm-text="Hapus"
      :danger="true"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { Package, PackageFeatures } from '~/types/package'
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Packages', meta: [{ name: 'robots', content: 'noindex' }] })

const toast = useToast()
const packageService = usePackageService()

const packages = ref<Package[]>([])
const meta = ref<any>(null)
const loading = ref(true)
const search = ref('')
const currentPage = ref(1)
let searchTimeout: any

const showModal = ref(false)
const saving = ref(false)
const editingId = ref<string | null>(null)
const form = ref<{ name: string; price: number; features_config: PackageFeatures }>({
  name: '',
  price: 0,
  features_config: {
    has_gallery: false,
    gallery_limit: 10,
    has_story: false,
    has_rsvp: false,
    has_wishes: false,
    max_guests: 100,
  }
})

const showDeleteModal = ref(false)
const packageToDelete = ref<Package | null>(null)

async function loadPackages() {
  loading.value = true
  try {
    const response = await packageService.getPackages({
      page: currentPage.value,
      per_page: 15,
      search: search.value || undefined,
    })
    packages.value = response?.data || []
    meta.value = response?.meta || null
  } catch (e) {
    toast.error(handleApiError(e).message)
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  editingId.value = null
  form.value = {
    name: '',
    price: 0,
    features_config: {
      has_gallery: false,
      gallery_limit: 10,
      has_story: false,
      has_rsvp: false,
      has_wishes: false,
      max_guests: 100,
    }
  }
  showModal.value = true
}

function openEditModal(pkg: Package) {
  editingId.value = pkg.id
  form.value = {
    name: pkg.name,
    price: pkg.price,
    features_config: {
      has_gallery: pkg.features_config?.has_gallery || false,
      gallery_limit: pkg.features_config?.gallery_limit || 10,
      has_story: pkg.features_config?.has_story || false,
      has_rsvp: pkg.features_config?.has_rsvp || false,
      has_wishes: pkg.features_config?.has_wishes || false,
      max_guests: pkg.features_config?.max_guests || 0,
    }
  }
  showModal.value = true
}

async function savePackage() {
  saving.value = true
  try {
    // Build payload ensuring types match backend expectations
    const payload = {
      name: form.value.name,
      price: Number(form.value.price),
      features_config: {
        has_gallery: !!form.value.features_config.has_gallery,
        gallery_limit: Number(form.value.features_config.gallery_limit) || 0,
        has_story: !!form.value.features_config.has_story,
        has_rsvp: !!form.value.features_config.has_rsvp,
        has_wishes: !!form.value.features_config.has_wishes,
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

function confirmDelete(pkg: Package) {
  packageToDelete.value = pkg
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!packageToDelete.value) return
  try {
    await packageService.deletePackage(packageToDelete.value.id)
    toast.success('Paket berhasil dihapus')
    showDeleteModal.value = false
    packageToDelete.value = null
    loadPackages()
  } catch (e) {
    toast.error(handleApiError(e).message)
  }
}

function goToPage(page: number) {
  currentPage.value = page
  loadPackages()
}

watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadPackages()
  }, 300)
})

await loadPackages()
</script>
