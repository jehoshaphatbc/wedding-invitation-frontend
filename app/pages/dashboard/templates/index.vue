<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Templates</h1>
        <p class="text-sm text-gray-500 mt-1">Manage invitation templates and Vue components.</p>
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
          placeholder="Search templates..."
          class="w-full sm:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th class="px-4 py-3">Thumbnail</th>
              <th class="px-4 py-3">Nama Template</th>
              <th class="px-4 py-3">Nama Komponen</th>
              <th class="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="4" class="py-12 text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </td>
            </tr>
            <tr v-else-if="!templates || templates.length === 0">
              <td colspan="4" class="py-12 text-center text-gray-500">
                No templates found.
              </td>
            </tr>
            <template v-else>
              <tr v-for="tpl in templates" :key="tpl.id" class="border-b hover:bg-gray-50">
                <td class="px-4 py-3">
                  <div class="w-16 h-16 bg-gray-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center">
                    <img v-if="tpl.thumbnail_url" :src="tpl.thumbnail_url" class="object-cover w-full h-full" alt="Thumbnail" />
                    <svg v-else class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                </td>
                <td class="px-4 py-3 font-medium text-gray-900">{{ tpl.name }}</td>
                <td class="px-4 py-3 text-gray-600 font-mono text-xs">{{ tpl.component_name }}</td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <button
                      @click="openEditModal(tpl)"
                      class="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Edit
                    </button>
                    <button
                      @click="confirmDelete(tpl)"
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
              v-model="form.component_name"
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

    <!-- Delete Confirmation Modal -->
    <UiConfirmModal
      v-if="showDeleteModal && templateToDelete"
      title="Hapus Template"
      :message="`Apakah Anda yakin ingin menghapus template '${templateToDelete.name}'?`"
      confirm-text="Hapus"
      :danger="true"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { Template } from '~/types/template'
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Templates', meta: [{ name: 'robots', content: 'noindex' }] })

const toast = useToast()
const templateService = useTemplateService()

const templates = ref<Template[]>([])
const meta = ref<any>(null)
const loading = ref(true)
const search = ref('')
const currentPage = ref(1)
let searchTimeout: any

const showModal = ref(false)
const saving = ref(false)
const editingId = ref<string | null>(null)
const form = ref<{ name: string; component_name: string; thumbnail_url: string }>({
  name: '',
  component_name: '',
  thumbnail_url: ''
})

const showDeleteModal = ref(false)
const templateToDelete = ref<Template | null>(null)

async function loadTemplates() {
  loading.value = true
  try {
    const response = await templateService.getTemplates({
      page: currentPage.value,
      per_page: 15,
      search: search.value || undefined,
    })
    templates.value = response?.data || []
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
    component_name: '',
    thumbnail_url: ''
  }
  showModal.value = true
}

function openEditModal(tpl: Template) {
  editingId.value = tpl.id
  form.value = {
    name: tpl.name,
    component_name: tpl.component_name,
    thumbnail_url: tpl.thumbnail_url
  }
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

function confirmDelete(tpl: Template) {
  templateToDelete.value = tpl
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!templateToDelete.value) return
  try {
    await templateService.deleteTemplate(templateToDelete.value.id)
    toast.success('Template berhasil dihapus')
    showDeleteModal.value = false
    templateToDelete.value = null
    loadTemplates()
  } catch (e) {
    toast.error(handleApiError(e).message)
  }
}

function goToPage(page: number) {
  currentPage.value = page
  loadTemplates()
}

watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadTemplates()
  }, 300)
})

await loadTemplates()
</script>
