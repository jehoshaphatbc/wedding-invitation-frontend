<template>
  <div @click="activeDropdown = null">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Feature Packages</h1>
        <p class="text-sm text-gray-500 mt-1">Manage master features for invitation package configurations.</p>
      </div>
      <button
        @click="openCreateModal"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Feature
      </button>
    </div>

    <!-- Main Card -->
    <div class="bg-white rounded-lg shadow border border-gray-200">
      <!-- Search & Filters Bar -->
      <div class="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between">
        <div class="w-full sm:w-72">
          <input
            v-model="search"
            type="text"
            placeholder="Search key or feature name..."
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <select
            v-model="typeFilter"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="">All Input Types</option>
            <option value="boolean">Boolean (Toggle/Checkbox)</option>
            <option value="number">Number (Count/Limit)</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-visible">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3">Feature Key</th>
              <th class="px-4 py-3">Feature Name</th>
              <th class="px-4 py-3">Input Type</th>
              <th class="px-4 py-3">Default Value</th>
              <th class="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="py-12 text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </td>
            </tr>
            <tr v-else-if="filteredFeatures.length === 0">
              <td colspan="5" class="py-12 text-center text-gray-500">
                <div class="flex flex-col items-center justify-center">
                  <svg class="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p class="font-medium">No feature packages found.</p>
                  <p class="text-xs text-gray-400 mt-1">Click "Add Feature" button to create a new master feature.</p>
                </div>
              </td>
            </tr>
            <template v-else>
              <tr v-for="feat in filteredFeatures" :key="feat.key" class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-4 py-3 font-mono font-medium text-blue-700">
                  {{ feat.key }}
                </td>
                <td class="px-4 py-3 font-medium text-gray-900">
                  {{ feat.name }}
                </td>
                <td class="px-4 py-3">
                  <span
                    v-if="feat.input_type === 'boolean'"
                    class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Boolean
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800"
                  >
                    <span class="font-bold">#</span> Number
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-mono text-xs">
                    {{ feat.default_value }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center relative">
                  <button
                    @click.stop="activeDropdown = activeDropdown === feat.key ? null : feat.key"
                    class="p-1 rounded hover:bg-gray-200 text-gray-500"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                  
                  <div
                    v-show="activeDropdown === feat.key"
                    class="absolute right-8 top-10 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden text-left"
                  >
                    <button
                      class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 text-gray-700 w-full"
                      @click.stop="openEditModal(feat); activeDropdown = null"
                    >
                      <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                      Edit
                    </button>
                    <button
                      class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600"
                      @click.stop="confirmDelete(feat); activeDropdown = null"
                    >
                      <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form Feature -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          {{ editingItem ? 'Edit Feature Package' : 'Add Feature Package' }}
        </h3>
        
        <form @submit.prevent="saveFeature" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Feature Key *</label>
            <input
              v-model="form.key"
              type="text"
              required
              :disabled="!!editingItem"
              placeholder="Example: has_gallery, gallery_limit"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
            />
            <p class="text-xs text-gray-400 mt-1">Use snake_case format without spaces.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Feature Name *</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Example: Photo Gallery Feature"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Input Type *</label>
            <select
              v-model="form.input_type"
              required
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="boolean">Boolean (Toggle / Checkbox)</option>
              <option value="number">Number (Count / Limit)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Default Value *</label>
            <input
              v-model="form.default_value"
              type="text"
              required
              :placeholder="form.input_type === 'boolean' ? 'false or true' : '0 or other numeric value'"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
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

    <!-- Confirm Delete Modal -->
    <UiConfirmModal
      v-if="showDeleteModal && featureToDelete"
      title="Delete Feature Package"
      :message="`Are you sure you want to delete feature '${featureToDelete.name}' (${featureToDelete.key})?`"
      confirm-text="Delete"
      :danger="true"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { Feature, FeatureFormData } from '~/types/feature'
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Feature Packages', meta: [{ name: 'robots', content: 'noindex' }] })

const { isSuperAdmin } = usePermission()

if (!isSuperAdmin.value) {
  await navigateTo('/dashboard')
}

const toast = useToast()
const featureService = useFeatureService()

const features = ref<Feature[]>([])
const loading = ref(true)
const saving = ref(false)
const search = ref('')
const typeFilter = ref('')
const activeDropdown = ref<string | null>(null)

const showModal = ref(false)
const editingItem = ref<Feature | null>(null)
const form = ref<FeatureFormData>({
  key: '',
  name: '',
  input_type: 'boolean',
  default_value: 'false'
})

const showDeleteModal = ref(false)
const featureToDelete = ref<Feature | null>(null)

const filteredFeatures = computed(() => {
  return features.value.filter(f => {
    const q = search.value.toLowerCase().trim()
    const matchesSearch = !q || f.key.toLowerCase().includes(q) || f.name.toLowerCase().includes(q)
    const matchesType = !typeFilter.value || f.input_type === typeFilter.value
    return matchesSearch && matchesType
  })
})

// Watch input_type to provide sane default_value
watch(() => form.value.input_type, (newType) => {
  if (!editingItem.value) {
    if (newType === 'boolean' && form.value.default_value === '0') {
      form.value.default_value = 'false'
    } else if (newType === 'number' && (form.value.default_value === 'false' || form.value.default_value === 'true')) {
      form.value.default_value = '0'
    }
  }
})

async function loadFeatures() {
  loading.value = true
  try {
    features.value = await featureService.getFeatures()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  editingItem.value = null
  form.value = {
    key: '',
    name: '',
    input_type: 'boolean',
    default_value: 'false'
  }
  showModal.value = true
}

function openEditModal(feat: Feature) {
  editingItem.value = feat
  form.value = {
    key: feat.key,
    name: feat.name,
    input_type: feat.input_type,
    default_value: feat.default_value
  }
  showModal.value = true
}

async function saveFeature() {
  saving.value = true
  try {
    if (editingItem.value) {
      const targetId = editingItem.value.id || editingItem.value.key
      await featureService.updateFeature(targetId, form.value)
      toast.success('Feature package updated successfully')
    } else {
      await featureService.createFeature(form.value)
      toast.success('Feature package created successfully')
    }
    showModal.value = false
    loadFeatures()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  } finally {
    saving.value = false
  }
}

function confirmDelete(feat: Feature) {
  featureToDelete.value = feat
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!featureToDelete.value) return
  try {
    const targetId = featureToDelete.value.id || featureToDelete.value.key
    await featureService.deleteFeature(targetId)
    toast.success('Feature package deleted successfully')
    showDeleteModal.value = false
    featureToDelete.value = null
    loadFeatures()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  }
}

await loadFeatures()
</script>
