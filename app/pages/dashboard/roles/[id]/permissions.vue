<template>
  <div>
    <!-- Header with Back Button and Role Info -->
    <div class="mb-6">
      <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <NuxtLink to="/dashboard/roles" class="hover:text-blue-600 flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Daftar Roles
        </NuxtLink>
        <span>/</span>
        <span class="text-gray-700 font-medium">Konfigurasi Capabilitas</span>
      </div>

      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900">
              {{ role?.display_name || 'Role Capabilities' }}
            </h1>
            <span
              v-if="role?.is_system"
              class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800"
            >
              System Role
            </span>
            <span
              v-else-if="role"
              class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"
            >
              Custom Role
            </span>
          </div>
          <p class="text-sm text-gray-500 mt-1">
            {{ role?.description || 'Tentukan capabilitas dan izin akses apa saja yang dapat dilakukan oleh role ini.' }}
          </p>
        </div>

        <!-- Sticky / Top Action Buttons -->
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/dashboard/roles"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Batal
          </NuxtLink>
          <button
            type="button"
            :disabled="submitting || loading"
            @click="handleSubmit"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            <div v-if="submitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Simpan Capabilitas
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>

    <template v-else-if="role">
      <!-- Toolbar: Summary, Select All, and Search -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-gray-700">
            Terpilih:
            <span class="text-blue-600 font-bold">{{ selectedPermissionIds.length }}</span>
            dari {{ allPermissions.length }} Capabilitas
          </span>
          <span class="text-gray-300">|</span>
          <button
            type="button"
            @click="selectAllPermissions"
            class="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            Pilih Semua
          </button>
          <span class="text-gray-300">|</span>
          <button
            type="button"
            @click="deselectAllPermissions"
            class="text-xs font-semibold text-gray-600 hover:text-gray-800"
          >
            Hapus Semua Pilihan
          </button>
        </div>

        <div class="w-full md:w-72">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari capabilitas..."
            class="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Permission Modules Grid -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div
          v-for="(perms, group) in filteredGroupedPermissions"
          :key="group"
          class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <!-- Module Header with Group Toggle -->
          <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
              <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide">
                Modul {{ group }}
              </h3>
              <span class="text-xs text-gray-500 font-normal">({{ perms.length }} capabilitas)</span>
            </div>
            
            <button
              type="button"
              @click="toggleGroup(perms)"
              class="text-xs font-medium text-blue-600 hover:underline"
            >
              {{ isGroupFullySelected(perms) ? 'Batal Pilih Grup' : 'Pilih Semua di Grup' }}
            </button>
          </div>

          <!-- Permissions in this Group -->
          <div class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <label
              v-for="perm in perms"
              :key="perm.id"
              class="flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer"
              :class="selectedPermissionIds.includes(perm.id) ? 'border-blue-300 bg-blue-50/40' : 'border-gray-200 hover:bg-gray-50'"
            >
              <input
                v-model="selectedPermissionIds"
                type="checkbox"
                :value="perm.id"
                class="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div class="flex-1 min-w-0">
                <span class="block text-sm font-semibold text-gray-900 truncate">{{ perm.display_name || perm.name }}</span>
                <span class="block text-xs font-mono text-gray-500 mt-0.5">{{ perm.name }}</span>
                <span v-if="perm.description" class="block text-xs text-gray-500 mt-1 line-clamp-2">
                  {{ perm.description }}
                </span>
              </div>
            </label>
          </div>
        </div>

        <div v-if="Object.keys(filteredGroupedPermissions).length === 0" class="bg-white rounded-lg p-8 text-center text-gray-500">
          Tidak ada capabilitas yang cocok dengan pencarian "{{ searchQuery }}".
        </div>

        <!-- Bottom Action Bar -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <NuxtLink
            to="/dashboard/roles"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Batal
          </NuxtLink>
          <button
            type="submit"
            :disabled="submitting"
            class="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow"
          >
            <div v-if="submitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            Simpan Capabilitas Role
          </button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Role } from '~/types/role'
import type { Permission } from '~/types/permission'
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Configure Role Capabilities', meta: [{ name: 'robots', content: 'noindex' }] })

const { isSuperAdmin } = usePermission()

if (!isSuperAdmin.value) {
  await navigateTo('/dashboard')
}

const route = useRoute()
const toast = useToast()
const roleService = useRoleService()
const permissionService = usePermissionService()

const role = ref<Role | null>(null)
const allPermissions = ref<Permission[]>([])
const selectedPermissionIds = ref<string[]>([])
const searchQuery = ref('')
const loading = ref(true)
const submitting = ref(false)

const groupedPermissions = computed(() => {
  const groups: Record<string, Permission[]> = {}
  for (const perm of allPermissions.value) {
    const dotIndex = perm.name.indexOf('.')
    const group = dotIndex > -1 ? perm.name.substring(0, dotIndex) : 'other'
    if (!groups[group]) groups[group] = []
    groups[group].push(perm)
  }
  return groups
})

const filteredGroupedPermissions = computed(() => {
  if (!searchQuery.value.trim()) return groupedPermissions.value
  const query = searchQuery.value.toLowerCase().trim()
  const filtered: Record<string, Permission[]> = {}

  for (const [group, perms] of Object.entries(groupedPermissions.value)) {
    const matched = perms.filter(
      p => p.name.toLowerCase().includes(query) ||
           (p.display_name && p.display_name.toLowerCase().includes(query)) ||
           (p.description && p.description.toLowerCase().includes(query))
    )
    if (matched.length > 0) {
      filtered[group] = matched
    }
  }
  return filtered
})

function selectAllPermissions() {
  selectedPermissionIds.value = allPermissions.value.map(p => p.id)
}

function deselectAllPermissions() {
  selectedPermissionIds.value = []
}

function isGroupFullySelected(perms: Permission[]) {
  return perms.every(p => selectedPermissionIds.value.includes(p.id))
}

function toggleGroup(perms: Permission[]) {
  if (isGroupFullySelected(perms)) {
    const groupIds = new Set(perms.map(p => p.id))
    selectedPermissionIds.value = selectedPermissionIds.value.filter(id => !groupIds.has(id))
  } else {
    const newIds = new Set(selectedPermissionIds.value)
    perms.forEach(p => newIds.add(p.id))
    selectedPermissionIds.value = Array.from(newIds)
  }
}

async function loadData() {
  loading.value = true
  try {
    const [roleRes, permsRes] = await Promise.all([
      roleService.getRole(route.params.id as string),
      permissionService.getPermissions(),
    ])
    role.value = roleRes.data
    allPermissions.value = permsRes.data
    selectedPermissionIds.value = roleRes.data.permissions?.map((p) => p.id) ?? []
  } catch (e) {
    const err = handleApiError(e)
    toast.error(err.message)
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!role.value) return
  submitting.value = true
  try {
    await roleService.assignPermissions(role.value.id, selectedPermissionIds.value)
    toast.success('Capabilitas role berhasil diperbarui!')
    navigateTo('/dashboard/roles')
  } catch (e) {
    const err = handleApiError(e)
    toast.error(err.message)
  } finally {
    submitting.value = false
  }
}

await loadData()
</script>
