<template>
  <div @click="activeDropdown = null">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Templates</h1>
        <p class="text-sm text-gray-500 mt-1">Manage invitation templates and Vue components.</p>
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
      <div v-if="selectedTemplates.length > 0" class="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center justify-between">
        <span class="text-sm text-blue-800 font-medium">{{ selectedTemplates.length }} templates selected</span>
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
          placeholder="Search templates..."
          class="w-full sm:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div class="overflow-visible">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th class="px-4 py-3 w-4"><input type="checkbox" v-model="selectAll" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"></th>
              <th class="px-4 py-3">Thumbnail</th>
              <th class="px-4 py-3 cursor-pointer hover:bg-gray-100" @click="toggleSort('name')">Nama Template <span v-if="sortBy==='name'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span></th>
              <th class="px-4 py-3 cursor-pointer hover:bg-gray-100" @click="toggleSort('nuxt_component')">Nama Komponen <span v-if="sortBy==='nuxt_component'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span></th>
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
            <tr v-else-if="!templates || templates.length === 0">
              <td colspan="6" class="py-12 text-center text-gray-500">
                No templates found.
              </td>
            </tr>
            <template v-else>
              <tr v-for="tpl in templates" :key="tpl.id" class="border-b hover:bg-gray-50">
                <td class="px-4 py-3"><input type="checkbox" :value="tpl.id" v-model="selectedTemplates" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"></td>
                <td class="px-4 py-3">
                  <div class="w-16 h-16 bg-gray-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center">
                    <img v-if="tpl.thumbnail_url" :src="tpl.thumbnail_url" class="object-cover w-full h-full" alt="Thumbnail" />
                    <svg v-else class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                </td>
                <td class="px-4 py-3 font-medium text-gray-900">{{ tpl.name }}</td>
                <td class="px-4 py-3 text-gray-600 font-mono text-xs">{{ tpl.nuxt_component }}</td>
                <td class="px-4 py-3 text-gray-600">{{ new Date(tpl.created_at).toLocaleDateString('id-ID') }}</td>
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
                  class="absolute right-8 top-10 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden text-left"
                >
                  <template v-if="viewMode === 'active'">
                    <button
                      class="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      @click.stop="openEditModal(tpl); activeDropdown = null"
                    >
                      Edit
                    </button>
                    <button
                      class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      @click.stop="confirmDelete(tpl); activeDropdown = null"
                    >
                      Delete
                    </button>
                  </template>
                  <template v-else>
                    <button
                      v-if="isSuperAdmin"
                      class="w-full text-left block px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                      @click.stop="confirmRestore(tpl); activeDropdown = null"
                    >
                      Restore
                    </button>
                    <button
                      v-if="isSuperAdmin"
                      class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      @click.stop="confirmForceDelete(tpl); activeDropdown = null"
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

    <!-- Modal Form Template -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ editingId ? 'Edit Template' : 'Create Template' }}</h3>
        
        <form @submit.prevent="saveTemplate" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Template</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Contoh: Classic Elegance"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Komponen Nuxt</label>
            <input
              v-model="form.nuxt_component"
              type="text"
              required
              placeholder="Contoh: TemplateClassicElegance"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">URL Thumbnail</label>
            <input
              v-model="form.thumbnail_url"
              type="text"
              placeholder="https://example.com/image.jpg"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
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
      v-if="showDeleteModal && templateToDelete"
      title="Hapus Template"
      :message="`Apakah Anda yakin ingin memindahkan template '${templateToDelete.name}' ke sampah?`"
      confirm-text="Hapus"
      :danger="true"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
    <UiConfirmModal
      v-if="showRestoreModal && templateToRestore"
      title="Restore Template"
      :message="`Apakah Anda yakin ingin mengembalikan template '${templateToRestore.name}' dari sampah?`"
      confirm-text="Restore"
      @confirm="handleRestore"
      @cancel="showRestoreModal = false"
    />
    <UiConfirmModal
      v-if="showForceDeleteModal && templateToForceDelete"
      title="Force Delete Template"
      :message="`Apakah Anda yakin ingin menghapus PERMANEN template '${templateToForceDelete.name}'? Aksi ini tidak dapat dibatalkan.`"
      confirm-text="Force Delete"
      :danger="true" require-input="DELETE"
      @confirm="handleForceDelete"
      @cancel="showForceDeleteModal = false"
    />

    <UiConfirmModal v-if="showBulkDeleteModal" title="Bulk Delete" :message="`Are you sure you want to delete ${selectedTemplates.length} templates?`" confirm-text="Delete" :danger="true" @confirm="handleBulkDelete" @cancel="showBulkDeleteModal = false" />
    <UiConfirmModal v-if="showBulkRestoreModal" title="Bulk Restore" :message="`Are you sure you want to restore ${selectedTemplates.length} templates?`" confirm-text="Restore" @confirm="handleBulkRestore" @cancel="showBulkRestoreModal = false" />
    <UiConfirmModal v-if="showBulkForceDeleteModal" title="Bulk Force Delete" :message="`Are you sure you want to permanently delete ${selectedTemplates.length} templates?`" confirm-text="Force Delete" :danger="true" require-input="DELETE" @confirm="handleBulkForceDelete" @cancel="showBulkForceDeleteModal = false" />
  </div>
</template>

<script setup lang="ts">
import type { Template } from '~/types/template'
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
const sortOrder = ref('desc')

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
const currentPage = ref(1)
let searchTimeout: any

const selectedTemplates = ref<string[]>([])
const selectAll = computed({
  get: () => {
    if (!templates.value || templates.value.length === 0) return false;
    return selectedTemplates.value.length === templates.value.length;
  },
  set: (val) => {
    if (val) {
      if (!templates.value) return;
      selectedTemplates.value = templates.value.map(p => p.id)
    } else {
      selectedTemplates.value = []
    }
  }
})

const showModal = ref(false)
const saving = ref(false)
const editingId = ref<string | null>(null)
const form = ref<{ name: string; nuxt_component: string; thumbnail_url: string }>({
  name: '', nuxt_component: '', thumbnail_url: ''
})

const showDeleteModal = ref(false)
const templateToDelete = ref<Template | null>(null)
const showRestoreModal = ref(false)
const templateToRestore = ref<Template | null>(null)
const showForceDeleteModal = ref(false)
const templateToForceDelete = ref<Template | null>(null)

const showBulkDeleteModal = ref(false)
const showBulkRestoreModal = ref(false)
const showBulkForceDeleteModal = ref(false)

async function loadTemplates() {
  selectedTemplates.value = []
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
      ? await templateService.getTemplates(params)
      : await templateService.getTrashedTemplates(params)
    templates.value = response?.data || []
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
  loadTemplates()
}

function openCreateModal() {
  editingId.value = null
  form.value = { name: '', nuxt_component: '', thumbnail_url: '' }
  showModal.value = true
}

function openEditModal(tpl: Template) {
  editingId.value = tpl.id
  form.value = { name: tpl.name, nuxt_component: tpl.nuxt_component, thumbnail_url: tpl.thumbnail_url }
  showModal.value = true
}

async function saveTemplate() {
  saving.value = true
  try {
    if (editingId.value) {
      await templateService.updateTemplate(editingId.value, form.value)
      toast.success('Template berhasil diperbarui')
    } else {
      await templateService.createTemplate(form.value)
      toast.success('Template berhasil ditambahkan')
    }
    showModal.value = false
    loadTemplates()
  } catch (e) {
    toast.error(handleApiError(e).message)
  } finally {
    saving.value = false
  }
}

function confirmDelete(tpl: Template) { templateToDelete.value = tpl; showDeleteModal.value = true }
async function handleDelete() {
  if (!templateToDelete.value) return
  try {
    await templateService.deleteTemplate(templateToDelete.value.id)
    toast.success('Template berhasil dihapus')
    showDeleteModal.value = false
    loadTemplates()
  } catch (e) { toast.error(handleApiError(e).message) }
}

function confirmRestore(tpl: Template) { templateToRestore.value = tpl; showRestoreModal.value = true }
async function handleRestore() {
  if (!templateToRestore.value) return
  try {
    await templateService.bulkRestoreTemplates([templateToRestore.value.id])
    toast.success('Template berhasil dikembalikan')
    showRestoreModal.value = false
    loadTemplates()
  } catch (e) { toast.error(handleApiError(e).message) }
}

function confirmForceDelete(tpl: Template) { templateToForceDelete.value = tpl; showForceDeleteModal.value = true }
async function handleForceDelete() {
  if (!templateToForceDelete.value) return
  try {
    await templateService.bulkForceDeleteTemplates([templateToForceDelete.value.id])
    toast.success('Template permanen dihapus')
    showForceDeleteModal.value = false
    loadTemplates()
  } catch (e) { toast.error(handleApiError(e).message) }
}

async function handleBulkDelete() {
  try {
    await templateService.bulkDeleteTemplates(selectedTemplates.value)
    toast.success('Selected templates deleted')
    showBulkDeleteModal.value = false
    loadTemplates()
  } catch (e: any) { toast.error(handleApiError(e).message) }
}

async function handleBulkRestore() {
  try {
    await templateService.bulkRestoreTemplates(selectedTemplates.value)
    toast.success('Selected templates restored')
    showBulkRestoreModal.value = false
    loadTemplates()
  } catch (e: any) { toast.error(handleApiError(e).message) }
}

async function handleBulkForceDelete() {
  try {
    await templateService.bulkForceDeleteTemplates(selectedTemplates.value)
    toast.success('Selected templates permanently deleted')
    showBulkForceDeleteModal.value = false
    loadTemplates()
  } catch (e: any) { toast.error(handleApiError(e).message) }
}

function goToPage(page: number) { currentPage.value = page; loadTemplates() }
watch(search, () => { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => { currentPage.value = 1; loadTemplates() }, 300) })

await loadTemplates()
</script>
