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
              <th class="px-4 py-3 text-center">Actions</th>
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
                  <div class="flex flex-wrap gap-1 max-w-xs">
                    <template v-if="pkg.features_config && Object.keys(pkg.features_config).length > 0">
                      <!-- Unified Galeri Badge -->
                      <span
                        v-if="pkg.features_config.has_gallery"
                        class="px-2 py-0.5 bg-green-100 text-green-800 rounded font-medium"
                      >
                        ✓ Galeri ({{ pkg.features_config.gallery_limit ?? 0 }} foto)
                      </span>
                      <span
                        v-else-if="pkg.features_config.has_gallery === false"
                        class="px-2 py-0.5 bg-gray-100 text-gray-400 rounded"
                      >
                        ✕ Galeri
                      </span>

                      <!-- Other features -->
                      <template v-for="(val, key) in pkg.features_config" :key="key">
                        <template v-if="key !== 'has_gallery' && key !== 'gallery_limit'">
                          <span
                            v-if="typeof val === 'boolean' && val"
                            class="px-2 py-0.5 bg-green-100 text-green-800 rounded font-medium"
                          >
                            ✓ {{ getFeatureLabel(String(key)) }}
                          </span>
                          <span
                            v-else-if="typeof val === 'number' && val > 0"
                            class="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-medium"
                          >
                            {{ getFeatureLabel(String(key)) }}: {{ val }}
                          </span>
                          <span
                            v-else-if="typeof val === 'boolean' && !val"
                            class="px-2 py-0.5 bg-gray-100 text-gray-400 rounded"
                          >
                            ✕ {{ getFeatureLabel(String(key)) }}
                          </span>
                        </template>
                      </template>
                    </template>
                    <span v-else class="text-gray-400 italic">-</span>
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
                  class="absolute right-8 top-10 mt-1 w-44 bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden text-left"
                >
                  <template v-if="viewMode === 'active'">
                    <button
                      class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-gray-700" @click.stop="openEditModal(pkg); activeDropdown = null">
                      <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>Edit
                    </button>
                    <button
                      class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600" @click.stop="confirmDelete(pkg); activeDropdown = null">
                      <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>Delete
                    </button>
                  </template>
                  <template v-else>
                    <button
                      v-if="isSuperAdmin"
                      class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-green-600" @click.stop="confirmRestore(pkg); activeDropdown = null">
                      <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>Restore
                    </button>
                    <button
                      v-if="isSuperAdmin"
                      class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600" @click.stop="confirmForceDelete(pkg); activeDropdown = null">
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
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium pointer-events-none">Rp</span>
              <input
                :value="displayPrice"
                @input="onPriceInput"
                type="text"
                inputmode="numeric"
                required
                placeholder="0"
                class="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="border-t border-gray-200 pt-4 mt-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-medium text-gray-900">Konfigurasi Fitur</h4>
              <span v-if="loadingFeatures" class="text-xs text-gray-400 flex items-center gap-1">
                <div class="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600" />
                Memuat fitur...
              </span>
            </div>
            
            <div v-if="loadingFeatures && (!masterFeatures || masterFeatures.length === 0)" class="py-6 text-center text-sm text-gray-500">
              Memuat konfigurasi fitur...
            </div>
            <div v-else class="space-y-3 max-h-72 overflow-y-auto pr-1">
              <!-- 1. Card "Galeri Foto" Terpadu (Dependent Feature) -->
              <div
                v-if="hasGalleryFeature"
                class="rounded-lg border transition-all duration-200"
                :class="configPayload['has_gallery'] ? 'bg-blue-50/40 border-blue-200 shadow-sm' : 'bg-gray-50 border-gray-200'"
              >
                <!-- Header Card Galeri Foto -->
                <div class="p-3.5 flex items-center justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <span>{{ hasGalleryFeature.name || 'Galeri Foto' }}</span>
                      <span
                        v-if="toBoolean(configPayload['has_gallery'])"
                        class="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 rounded-full"
                      >
                        Aktif
                      </span>
                    </div>
                  </div>

                  <!-- Toggle Switch Galeri -->
                  <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      :checked="toBoolean(configPayload['has_gallery'])"
                      @change="onToggleGallery"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <!-- Conditional Sub-input: Batas Jumlah Foto -->
                <transition
                  enter-active-class="transition-all duration-200 ease-out"
                  enter-from-class="opacity-0 max-h-0 -translate-y-1"
                  enter-to-class="opacity-100 max-h-40 translate-y-0"
                  leave-active-class="transition-all duration-150 ease-in"
                  leave-from-class="opacity-100 max-h-40 translate-y-0"
                  leave-to-class="opacity-0 max-h-0 -translate-y-1"
                >
                  <div
                    v-if="toBoolean(configPayload['has_gallery'])"
                    class="border-t border-blue-100 bg-white/80 p-3.5"
                  >
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <label class="block text-xs font-semibold text-gray-800">
                          Batas Maksimal Foto <span class="text-red-500">*</span>
                        </label>
                        <p class="text-[11px] text-gray-500 mt-0.5">
                          Tentukan berapa banyak foto yang dapat diunggah pengantin
                        </p>
                      </div>
                      <div class="w-full sm:w-36 flex items-center gap-1.5 flex-shrink-0">
                        <input
                          v-model.number="configPayload['gallery_limit']"
                          type="number"
                          min="1"
                          placeholder="10"
                          required
                          class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right font-medium bg-white"
                        />
                        <span class="text-xs text-gray-500 whitespace-nowrap">Foto</span>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>

              <!-- 2. Loop Standalone Master Features (Exclude has_gallery & gallery_limit) -->
              <div
                v-for="feat in standaloneFeatures"
                :key="feat.key"
                class="p-3.5 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between gap-4"
              >
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900">{{ feat.name || feat.key }}</div>
                </div>

                <!-- Boolean Toggle Switch -->
                <div v-if="feat.input_type === 'boolean'" class="flex items-center flex-shrink-0">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      :checked="toBoolean(configPayload[feat.key])"
                      @change="configPayload[feat.key] = ($event.target as HTMLInputElement).checked"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <!-- Number Input -->
                <div v-else-if="feat.input_type === 'number'" class="w-32 flex-shrink-0">
                  <input
                    v-model.number="configPayload[feat.key]"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right bg-white"
                  />
                </div>

                <!-- Fallback Text Input -->
                <div v-else class="w-40 flex-shrink-0">
                  <input
                    v-model="configPayload[feat.key]"
                    type="text"
                    class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
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
import type { Package } from '~/types/package'
import type { Feature } from '~/types/feature'
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Packages', meta: [{ name: 'robots', content: 'noindex' }] })

const toast = useToast()
const packageService = usePackageService()
const featureService = useFeatureService()
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

// Dynamic Features State
const masterFeatures = ref<Feature[]>([])
const loadingFeatures = ref(false)
const configPayload = ref<Record<string, any>>({})

const DEFAULT_FALLBACK_FEATURES: Feature[] = [
  { key: 'has_gallery', name: 'Fitur Galeri Foto', input_type: 'boolean', default_value: 'false' },
  { key: 'gallery_limit', name: 'Limit Foto Galeri', input_type: 'number', default_value: '0' },
  { key: 'has_video', name: 'Fitur Video Undangan', input_type: 'boolean', default_value: 'false' },
  { key: 'has_qr', name: 'Fitur QR Code Check-in', input_type: 'boolean', default_value: 'false' }
]

const hasGalleryFeature = computed(() => {
  return masterFeatures.value.find(f => f.key === 'has_gallery')
})

const galleryLimitFeature = computed(() => {
  return masterFeatures.value.find(f => f.key === 'gallery_limit')
})

const standaloneFeatures = computed(() => {
  return masterFeatures.value.filter(f => f.key !== 'has_gallery' && f.key !== 'gallery_limit')
})

function toBoolean(val: any): boolean {
  if (val === true || val === 1 || val === 'true' || val === '1') return true
  return false
}

function onToggleGallery(event: Event) {
  const target = event.target as HTMLInputElement
  const isChecked = target.checked
  configPayload.value['has_gallery'] = isChecked
  if (isChecked) {
    if (!configPayload.value['gallery_limit'] || Number(configPayload.value['gallery_limit']) <= 0) {
      configPayload.value['gallery_limit'] = 10
    }
  } else {
    configPayload.value['gallery_limit'] = 0
  }
}

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
    const rawList = response?.data || []
    packages.value = rawList.map((p: any) => {
      let cfg = p.features_config
      if (typeof cfg === 'string') {
        try { cfg = JSON.parse(cfg) } catch { cfg = {} }
      }
      return {
        ...p,
        features_config: cfg || {}
      }
    })
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

async function openCreateModal() {
  editingId.value = null
  form.value = { name: '' }
  setPrice(0)

  await loadMasterFeatures()

  const initial: Record<string, any> = {}
  for (const feat of masterFeatures.value) {
    if (feat.key === 'gallery_limit') {
      initial['gallery_limit'] = 0
    } else if (feat.input_type === 'boolean') {
      initial[feat.key] = toBoolean(feat.default_value)
    } else if (feat.input_type === 'number') {
      initial[feat.key] = Number(feat.default_value) || 0
    } else {
      initial[feat.key] = feat.default_value ?? ''
    }
  }

  // Galeri foto integration logic
  if (initial['has_gallery']) {
    initial['gallery_limit'] = Number(initial['gallery_limit']) > 0 ? Number(initial['gallery_limit']) : 10
  } else {
    initial['has_gallery'] = false
    initial['gallery_limit'] = 0
  }

  configPayload.value = initial
  showModal.value = true
}

async function openEditModal(pkg: Package) {
  editingId.value = pkg.id
  form.value = { name: pkg.name }
  setPrice(pkg.price ?? 0)

  await loadMasterFeatures()

  let existingConfig = pkg.features_config || {}
  if (typeof existingConfig === 'string') {
    try {
      existingConfig = JSON.parse(existingConfig)
    } catch {
      existingConfig = {}
    }
  }

  const initial: Record<string, any> = {}
  
  for (const feat of masterFeatures.value) {
    if (existingConfig[feat.key] !== undefined) {
      if (feat.input_type === 'boolean') {
        initial[feat.key] = toBoolean(existingConfig[feat.key])
      } else if (feat.input_type === 'number') {
        initial[feat.key] = Number(existingConfig[feat.key]) || 0
      } else {
        initial[feat.key] = existingConfig[feat.key]
      }
    } else {
      if (feat.input_type === 'boolean') {
        initial[feat.key] = toBoolean(feat.default_value)
      } else if (feat.input_type === 'number') {
        initial[feat.key] = Number(feat.default_value) || 0
      } else {
        initial[feat.key] = feat.default_value ?? ''
      }
    }
  }

  // Preserve any remaining keys in existingConfig that are not in masterFeatures
  for (const [k, v] of Object.entries(existingConfig)) {
    if (initial[k] === undefined) {
      initial[k] = v
    }
  }

  // Galeri foto integration logic
  if (initial['has_gallery']) {
    initial['gallery_limit'] = Number(initial['gallery_limit']) > 0 ? Number(initial['gallery_limit']) : 10
  } else {
    initial['has_gallery'] = false
    initial['gallery_limit'] = 0
  }

  configPayload.value = initial
  showModal.value = true
}

async function savePackage() {
  saving.value = true
  try {
    const finalFeaturesConfig: Record<string, any> = {}
    
    // Explicitly enforce has_gallery and gallery_limit dependency
    const hasGallery = toBoolean(configPayload.value['has_gallery'])
    const galleryLimit = hasGallery ? (Number(configPayload.value['gallery_limit']) || 10) : 0

    // Capture every master feature
    for (const feat of masterFeatures.value) {
      if (feat.key === 'has_gallery') {
        finalFeaturesConfig['has_gallery'] = hasGallery
      } else if (feat.key === 'gallery_limit') {
        finalFeaturesConfig['gallery_limit'] = galleryLimit
      } else if (feat.input_type === 'boolean') {
        finalFeaturesConfig[feat.key] = toBoolean(configPayload.value[feat.key])
      } else if (feat.input_type === 'number') {
        finalFeaturesConfig[feat.key] = Number(configPayload.value[feat.key]) || 0
      } else {
        finalFeaturesConfig[feat.key] = configPayload.value[feat.key] ?? ''
      }
    }

    // Also preserve any keys in configPayload that might not be in masterFeatures
    for (const [key, val] of Object.entries(configPayload.value)) {
      if (finalFeaturesConfig[key] === undefined) {
        if (typeof val === 'boolean') {
          finalFeaturesConfig[key] = val
        } else if (typeof val === 'number') {
          finalFeaturesConfig[key] = val
        } else {
          finalFeaturesConfig[key] = val
        }
      }
    }

    finalFeaturesConfig['has_gallery'] = hasGallery
    finalFeaturesConfig['gallery_limit'] = galleryLimit

    const payload = {
      name: form.value.name,
      price: rawPrice.value,
      features_config: finalFeaturesConfig
    }
    if (editingId.value) {
      await packageService.updatePackage(editingId.value, payload)
      toast.success('Paket berhasil diperbarui')
    } else {
      await packageService.createPackage(payload)
      toast.success('Paket berhasil ditambahkan')
    }
    showModal.value = false
    await loadPackages()
  } catch (e) {
    toast.error(handleApiError(e).message)
  } finally {
    saving.value = false
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

function confirmDelete(pkg: Package) { packageToDelete.value = pkg; showDeleteModal.value = true }
async function handleDelete() {
  if (!packageToDelete.value) return
  try {
    await packageService.deletePackage(packageToDelete.value.id)
    toast.success('Paket berhasil dipindahkan ke sampah')
    showDeleteModal.value = false
    packageToDelete.value = null
    loadPackages()
  } catch (e) { toast.error(handleApiError(e).message) }
}

function confirmRestore(pkg: Package) { packageToRestore.value = pkg; showRestoreModal.value = true }
async function handleRestore() {
  if (!packageToRestore.value) return
  try {
    await packageService.restorePackage(packageToRestore.value.id)
    toast.success('Paket berhasil dikembalikan')
    showRestoreModal.value = false
    packageToRestore.value = null
    loadPackages()
  } catch (e) {
    try {
      await packageService.bulkRestorePackages([packageToRestore.value.id])
      toast.success('Paket berhasil dikembalikan')
      showRestoreModal.value = false
      packageToRestore.value = null
      loadPackages()
    } catch (bulkErr) {
      toast.error(handleApiError(e).message)
    }
  }
}

function confirmForceDelete(pkg: Package) { packageToForceDelete.value = pkg; showForceDeleteModal.value = true }
async function handleForceDelete() {
  if (!packageToForceDelete.value) return
  try {
    await packageService.forceDeletePackage(packageToForceDelete.value.id)
    toast.success('Paket permanen dihapus')
    showForceDeleteModal.value = false
    packageToForceDelete.value = null
    loadPackages()
  } catch (e) {
    try {
      await packageService.bulkForceDeletePackages([packageToForceDelete.value.id])
      toast.success('Paket permanen dihapus')
      showForceDeleteModal.value = false
      packageToForceDelete.value = null
      loadPackages()
    } catch (bulkErr) {
      toast.error(handleApiError(e).message)
    }
  }
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

watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadPackages()
  }, 300)
})

watch(viewMode, () => {
  selectedPackages.value = []
})

await Promise.all([
  loadPackages(),
  loadMasterFeatures()
])
</script>
