<template>
  <div @click="activeDropdown = null">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Templates</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola template desain undangan, nama komponen Nuxt, dan status aktif.</p>
      </div>
      <div class="flex gap-2">
        <button
          v-if="canViewTrash"
          @click="toggleViewMode"
          class="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          :class="viewMode === 'trash' ? 'bg-red-50 text-red-600 border-red-200' : 'text-gray-700 bg-white'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {{ viewMode === 'trash' ? 'Lihat Template Aktif' : 'Trash' }}
        </button>
        <button
          v-if="viewMode === 'active'"
          @click="openCreateModal"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Template
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow">
      <!-- Bulk Actions Bar -->
      <div v-if="selectedTemplates.length > 0" class="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center justify-between">
        <span class="text-sm text-blue-800 font-medium">{{ selectedTemplates.length }} template dipilih</span>
        <div class="flex gap-2">
          <template v-if="viewMode === 'active'">
            <button
              @click="showBulkDeleteModal = true"
              class="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded hover:bg-red-50"
            >
              Hapus Terpilih
            </button>
          </template>
          <template v-else>
            <button
              v-if="isSuperAdmin"
              @click="showBulkRestoreModal = true"
              class="px-3 py-1.5 text-sm font-medium text-green-600 bg-white border border-green-200 rounded hover:bg-green-50"
            >
              Pulihkan Terpilih
            </button>
            <button
              v-if="isSuperAdmin"
              @click="showBulkForceDeleteModal = true"
              class="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded hover:bg-red-50"
            >
              Hapus Permanen Terpilih
            </button>
          </template>
        </div>
      </div>

      <!-- Search & Status Filter Bar -->
      <div class="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div class="relative flex-1 max-w-md">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Cari nama template atau komponen..."
            class="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div class="flex items-center gap-2">
          <label class="text-xs font-semibold text-gray-500 whitespace-nowrap">Filter Status:</label>
          <select
            v-model="statusFilter"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Non-Aktif</option>
          </select>
        </div>
      </div>

      <!-- Data Table -->
      <div class="overflow-visible">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 w-4">
                <input
                  type="checkbox"
                  v-model="selectAll"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th class="px-4 py-3 w-20">Thumbnail</th>
              <th
                class="px-4 py-3 cursor-pointer hover:bg-gray-100"
                @click="toggleSort('name')"
              >
                Nama Template <span v-if="sortBy === 'name'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th
                class="px-4 py-3 cursor-pointer hover:bg-gray-100"
                @click="toggleSort('nuxt_component')"
              >
                Nuxt Component <span v-if="sortBy === 'nuxt_component'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th
                class="px-4 py-3 cursor-pointer hover:bg-gray-100"
                @click="toggleSort('is_active')"
              >
                Status <span v-if="sortBy === 'is_active'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-4 py-3 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="6" class="py-12 text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </td>
            </tr>
            <tr v-else-if="!filteredTemplates || filteredTemplates.length === 0">
              <td colspan="6" class="py-12 text-center text-gray-500">
                Tidak ada template ditemukan.
              </td>
            </tr>
            <template v-else>
              <tr
                v-for="tpl in filteredTemplates"
                :key="tpl.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-3">
                  <input
                    type="checkbox"
                    :value="tpl.id"
                    v-model="selectedTemplates"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td class="px-4 py-3">
                  <div class="w-14 h-14 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                    <img
                      v-if="tpl.thumbnail_url"
                      :src="resolveImageUrl(tpl.thumbnail_url)"
                      class="object-cover w-full h-full"
                      alt="Thumbnail"
                      @error="(e: any) => e.target.style.display = 'none'"
                    />
                    <svg
                      v-else
                      class="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="font-medium text-gray-900 block">{{ tpl.name }}</span>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    {{ tpl.nuxt_component }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span
                    v-if="tpl.is_active"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                  >
                    Aktif
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"
                  >
                    Non-Aktif
                  </span>
                </td>
                <td class="px-4 py-3 text-center relative">
                  <button
                    @click.stop="activeDropdown = activeDropdown === tpl.id ? null : tpl.id"
                    class="p-1 rounded hover:bg-gray-200 text-gray-500"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  <div
                    v-show="activeDropdown === tpl.id"
                    class="absolute right-8 top-10 mt-1 w-44 bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden text-left"
                  >
                    <template v-if="viewMode === 'active'">
                      <button
                        class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-gray-700"
                        @click.stop="openEditModal(tpl); activeDropdown = null"
                      >
                        <svg class="w-4 h-4 mr-2 flex-shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600"
                        @click.stop="confirmDelete(tpl); activeDropdown = null"
                      >
                        <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Hapus
                      </button>
                    </template>
                    <template v-else>
                      <button
                        v-if="isSuperAdmin"
                        class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-green-600"
                        @click.stop="confirmRestore(tpl); activeDropdown = null"
                      >
                        <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Pulihkan
                      </button>
                      <button
                        v-if="isSuperAdmin"
                        class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600"
                        @click.stop="confirmForceDelete(tpl); activeDropdown = null"
                      >
                        <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Hapus Permanen
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
          Menampilkan {{ (meta.page - 1) * meta.per_page + 1 }} sampai
          {{ Math.min(meta.page * meta.per_page, meta.total) }} dari {{ meta.total }} template
        </span>
        <div class="flex gap-1">
          <button
            :disabled="meta.page <= 1"
            class="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
            @click="goToPage(meta.page - 1)"
          >
            Sebelumnya
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
            Berikutnya
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form Create / Edit Template -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ editingId ? 'Edit Template' : 'Tambah Template Baru' }}
          </h3>
          <button
            type="button"
            @click="showModal = false"
            class="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveTemplate" class="space-y-4">
          <!-- Input Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nama Template <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Contoh: Classic Elegance"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <!-- Input Nuxt Component -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nuxt Component <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.nuxt_component"
              type="text"
              required
              placeholder="Contoh: TemplateA"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p class="mt-1 text-xs text-gray-500">
              Nama file komponen Vue tanpa ekstensi, contoh: TemplateA
            </p>
          </div>

          <!-- Input Thumbnail URL & Live Preview -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-sm font-medium text-gray-700">Thumbnail URL</label>
              <button
                type="button"
                @click="fileInputRef?.click()"
                class="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload File
              </button>
            </div>

            <!-- Hidden File Input for quick upload -->
            <input
              ref="fileInputRef"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg,image/svg+xml"
              class="hidden"
              @change="onFileInputChange"
            />

            <input
              v-model="form.thumbnail_url"
              type="text"
              placeholder="https://example.com/thumbnail.jpg"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <!-- Live Preview Image if URL is present -->
            <div
              v-if="form.thumbnail_url"
              class="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-4"
            >
              <div class="relative w-20 h-20 rounded-md border border-gray-300 bg-white overflow-hidden flex-shrink-0 flex items-center justify-center">
                <img
                  :src="resolveImageUrl(form.thumbnail_url)"
                  alt="Thumbnail Preview"
                  class="w-full h-full object-cover"
                  @error="previewError = true"
                  @load="previewError = false"
                />
                <div
                  v-if="previewError"
                  class="absolute inset-0 bg-gray-100 flex items-center justify-center p-1 text-center"
                >
                  <span class="text-[10px] text-red-500 leading-tight">Gagal memuat</span>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-xs font-semibold text-gray-700 block">Live Preview</span>
                <span class="text-xs text-gray-500 break-all truncate block">{{ form.thumbnail_url }}</span>
                <button
                  type="button"
                  @click="form.thumbnail_url = ''"
                  class="mt-1 text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Hapus URL
                </button>
              </div>
            </div>
          </div>

          <!-- Input is_active (Toggle / Switch) -->
          <div class="pt-2">
            <div class="flex items-center justify-between p-3.5 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <span class="text-sm font-medium text-gray-900 block">Status Aktif</span>
                <span class="text-xs text-gray-500">Aktifkan template agar dapat digunakan pada undangan</span>
              </div>
              <button
                type="button"
                role="switch"
                :aria-checked="form.is_active"
                @click="form.is_active = !form.is_active"
                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                :class="form.is_active ? 'bg-blue-600' : 'bg-gray-300'"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  :class="form.is_active ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </div>
          </div>

          <!-- Modal Actions -->
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
              <span>{{ saving ? 'Menyimpan...' : 'Simpan' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirmation Modals -->
    <UiConfirmModal
      v-if="showDeleteModal && templateToDelete"
      title="Hapus Template"
      :message="`Apakah Anda yakin ingin memindahkan template '${templateToDelete.name}' ke trash?`"
      confirm-text="Hapus"
      :danger="true"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />

    <UiConfirmModal
      v-if="showRestoreModal && templateToRestore"
      title="Pulihkan Template"
      :message="`Apakah Anda yakin ingin memulihkan template '${templateToRestore.name}' dari trash?`"
      confirm-text="Pulihkan"
      @confirm="handleRestore"
      @cancel="showRestoreModal = false"
    />

    <UiConfirmModal
      v-if="showForceDeleteModal && templateToForceDelete"
      title="Hapus Permanen Template"
      :message="`Apakah Anda yakin ingin MENGHAPUS PERMANEN template '${templateToForceDelete.name}'? Tindakan ini tidak dapat dibatalkan.`"
      confirm-text="Hapus Permanen"
      :danger="true"
      require-input="DELETE"
      @confirm="handleForceDelete"
      @cancel="showForceDeleteModal = false"
    />

    <UiConfirmModal
      v-if="showBulkDeleteModal"
      title="Hapus Template Terpilih"
      :message="`Apakah Anda yakin ingin memindahkan ${selectedTemplates.length} template terpilih ke trash?`"
      confirm-text="Hapus Semua"
      :danger="true"
      @confirm="handleBulkDelete"
      @cancel="showBulkDeleteModal = false"
    />

    <UiConfirmModal
      v-if="showBulkRestoreModal"
      title="Pulihkan Template Terpilih"
      :message="`Apakah Anda yakin ingin memulihkan ${selectedTemplates.length} template terpilih dari trash?`"
      confirm-text="Pulihkan Semua"
      @confirm="handleBulkRestore"
      @cancel="showBulkRestoreModal = false"
    />

    <UiConfirmModal
      v-if="showBulkForceDeleteModal"
      title="Hapus Permanen Template Terpilih"
      :message="`Apakah Anda yakin ingin MENGHAPUS PERMANEN ${selectedTemplates.length} template terpilih?`"
      confirm-text="Hapus Permanen Semua"
      :danger="true"
      require-input="DELETE"
      @confirm="handleBulkForceDelete"
      @cancel="showBulkForceDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { Template, TemplateFormData } from '~/types/template'
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Templates', meta: [{ name: 'robots', content: 'noindex' }] })

const toast = useToast()
const templateService = useTemplateService()
const authStore = useAuthStore()

const isSuperAdmin = computed(() => authStore.user?.roles?.some(r => r.name.toLowerCase().includes('super')))
const canViewTrash = computed(() => isSuperAdmin.value)
const viewMode = ref<'active' | 'trash'>('active')
const activeDropdown = ref<string | null>(null)

const sortBy = ref('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')

function toggleSort(field: string) {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
  loadTemplates()
}

const templates = ref<Template[]>([])
const meta = ref<any>(null)
const loading = ref(true)
const search = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
let searchTimeout: any

const selectedTemplates = ref<string[]>([])
const selectAll = computed({
  get: () => {
    if (!filteredTemplates.value || filteredTemplates.value.length === 0) return false
    return selectedTemplates.value.length === filteredTemplates.value.length
  },
  set: (val) => {
    if (val && filteredTemplates.value) {
      selectedTemplates.value = filteredTemplates.value.map(p => p.id)
    } else {
      selectedTemplates.value = []
    }
  }
})

// Filtered templates computed property for local search / filter fallback
const filteredTemplates = computed(() => {
  if (!templates.value) return []
  let result = [...templates.value]

  if (statusFilter.value === 'active') {
    result = result.filter(t => t.is_active === true)
  } else if (statusFilter.value === 'inactive') {
    result = result.filter(t => t.is_active === false)
  }

  return result
})

const showModal = ref(false)
const saving = ref(false)
const editingId = ref<string | null>(null)
const form = ref<TemplateFormData>({
  name: '',
  nuxt_component: '',
  thumbnail_url: '',
  is_active: true
})
const previewError = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// Confirmation modal states
const showDeleteModal = ref(false)
const templateToDelete = ref<Template | null>(null)
const showRestoreModal = ref(false)
const templateToRestore = ref<Template | null>(null)
const showForceDeleteModal = ref(false)
const templateToForceDelete = ref<Template | null>(null)

const showBulkDeleteModal = ref(false)
const showBulkRestoreModal = ref(false)
const showBulkForceDeleteModal = ref(false)

const config = useRuntimeConfig()
const apiBase = (config.public.apiBase as string || '').replace(/\/api\/v1\/?$/, '')

function resolveImageUrl(path?: string) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) return path
  return `${apiBase}${path.startsWith('/') ? '' : '/'}${path}`
}

async function loadTemplates() {
  selectedTemplates.value = []
  loading.value = true
  try {
    const params: Record<string, any> = {
      page: currentPage.value,
      per_page: 15,
      search: search.value || undefined,
      sort: sortBy.value,
      order: sortOrder.value
    }

    if (statusFilter.value === 'active') {
      params.is_active = true
      params.status = 'active'
    } else if (statusFilter.value === 'inactive') {
      params.is_active = false
      params.status = 'inactive'
    }

    const response = viewMode.value === 'active'
      ? await templateService.getTemplates(params)
      : await templateService.getTrashedTemplates(params)

    templates.value = response?.data || (Array.isArray(response) ? response : [])
    meta.value = response?.meta || null
  } catch (e) {
    if (import.meta.client) {
      toast.error(handleApiError(e).message)
    }
  } finally {
    loading.value = false
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

function toggleViewMode() {
  viewMode.value = viewMode.value === 'active' ? 'trash' : 'active'
  currentPage.value = 1
  loadTemplates()
}

function openCreateModal() {
  editingId.value = null
  form.value = {
    name: '',
    nuxt_component: '',
    thumbnail_url: '',
    is_active: true
  }
  previewError.value = false
  showModal.value = true
}

function openEditModal(tpl: Template) {
  editingId.value = tpl.id
  form.value = {
    name: tpl.name,
    nuxt_component: tpl.nuxt_component,
    thumbnail_url: tpl.thumbnail_url || '',
    is_active: tpl.is_active ?? true
  }
  previewError.value = false
  showModal.value = true
}

async function onFileInputChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (PNG, JPG, WEBP, SVG)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar tidak boleh melebihi 5MB')
      return
    }

    try {
      toast.info('Mengunggah gambar...')
      const uploadRes = await templateService.uploadImage(file)
      const uploadedUrl = uploadRes?.data?.url || uploadRes?.data?.file_url || uploadRes?.data?.thumbnail_url || (typeof uploadRes?.data === 'string' ? uploadRes.data : '') || uploadRes?.url || ''
      if (uploadedUrl) {
        form.value.thumbnail_url = uploadedUrl
        previewError.value = false
        toast.success('Gambar berhasil diunggah')
      } else {
        toast.error('Gagal mendapatkan URL gambar hasil unggahan.')
      }
    } catch (err) {
      toast.error('Gagal mengunggah thumbnail: ' + handleApiError(err).message)
    }
  }
}

async function saveTemplate() {
  saving.value = true
  try {
    const payload = {
      name: form.value.name,
      nuxt_component: form.value.nuxt_component,
      thumbnail_url: form.value.thumbnail_url,
      is_active: form.value.is_active
    }

    if (editingId.value) {
      await templateService.updateTemplate(editingId.value, payload)
      toast.success('Template berhasil diperbarui')
    } else {
      await templateService.createTemplate(payload)
      toast.success('Template berhasil disimpan')
    }

    showModal.value = false
    await loadTemplates()
  } catch (e) {
    toast.error(handleApiError(e).message)
  } finally {
    saving.value = false
  }
}

function confirmDelete(tpl: Template) {
  templateToDelete.value = tpl
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!templateToDelete.value) return
  try {
    await templateService.deleteTemplate(templateToDelete.value.id)
    toast.success('Template berhasil dipindahkan ke trash')
    showDeleteModal.value = false
    templateToDelete.value = null
    loadTemplates()
  } catch (e) {
    toast.error(handleApiError(e).message)
  }
}

function confirmRestore(tpl: Template) {
  templateToRestore.value = tpl
  showRestoreModal.value = true
}

async function handleRestore() {
  if (!templateToRestore.value) return
  try {
    await templateService.restoreTemplate(templateToRestore.value.id)
    toast.success('Template berhasil dipulihkan')
    showRestoreModal.value = false
    templateToRestore.value = null
    loadTemplates()
  } catch (e) {
    try {
      await templateService.bulkRestoreTemplates([templateToRestore.value.id])
      toast.success('Template berhasil dipulihkan')
      showRestoreModal.value = false
      templateToRestore.value = null
      loadTemplates()
    } catch (bulkErr) {
      toast.error(handleApiError(e).message)
    }
  }
}

function confirmForceDelete(tpl: Template) {
  templateToForceDelete.value = tpl
  showForceDeleteModal.value = true
}

async function handleForceDelete() {
  if (!templateToForceDelete.value) return
  try {
    await templateService.forceDeleteTemplate(templateToForceDelete.value.id)
    toast.success('Template berhasil dihapus permanen')
    showForceDeleteModal.value = false
    templateToForceDelete.value = null
    loadTemplates()
  } catch (e) {
    try {
      await templateService.bulkForceDeleteTemplates([templateToForceDelete.value.id])
      toast.success('Template berhasil dihapus permanen')
      showForceDeleteModal.value = false
      templateToForceDelete.value = null
      loadTemplates()
    } catch (bulkErr) {
      toast.error(handleApiError(e).message)
    }
  }
}

async function handleBulkDelete() {
  try {
    await templateService.bulkDeleteTemplates(selectedTemplates.value)
    toast.success('Template terpilih berhasil dipindahkan ke trash')
    showBulkDeleteModal.value = false
    loadTemplates()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  }
}

async function handleBulkRestore() {
  try {
    await templateService.bulkRestoreTemplates(selectedTemplates.value)
    toast.success('Template terpilih berhasil dipulihkan')
    showBulkRestoreModal.value = false
    loadTemplates()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  }
}

async function handleBulkForceDelete() {
  try {
    await templateService.bulkForceDeleteTemplates(selectedTemplates.value)
    toast.success('Template terpilih berhasil dihapus permanen')
    showBulkForceDeleteModal.value = false
    loadTemplates()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  }
}

function goToPage(page: number) {
  currentPage.value = page
  loadTemplates()
}

watch([search, statusFilter], () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadTemplates()
  }, 300)
})

watch(viewMode, () => {
  selectedTemplates.value = []
})

if (import.meta.server) {
  try {
    await loadTemplates()
  } catch (err) {
    console.error('SSR fetch error in templates/index.vue:', err)
  }
}

onMounted(() => {
  if (templates.value.length === 0) {
    loadTemplates()
  }
})
</script>
