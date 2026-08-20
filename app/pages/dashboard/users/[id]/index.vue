<template>
  <div>
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>

    <template v-else-if="user">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">{{ user.name }}</h1>
        <div class="flex gap-2">
          <NuxtLink
            v-if="hasPermission('user.update')"
            :to="`/dashboard/users/${user.id}/edit`"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Edit
          </NuxtLink>
          <NuxtLink
            v-if="hasPermission('role.assign')"
            :to="`/dashboard/users/${user.id}/roles`"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Manage Roles
          </NuxtLink>
          <button
            v-if="hasPermission('user.delete')"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            @click="showDeleteModal = true"
          >
            Delete
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm text-gray-500">Name</dt>
              <dd class="text-sm text-gray-900">{{ user.name }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-500">Email</dt>
              <dd class="text-sm text-gray-900">{{ user.email }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-500">Phone</dt>
              <dd class="text-sm text-gray-900">{{ user.phone ?? '-' }}</dd>
            </div>
          </dl>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Account</h2>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm text-gray-500">Status</dt>
              <dd>
                <span
                  class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="statusClass(user.status)"
                >
                  {{ user.status }}
                </span>
              </dd>
            </div>
            <div>
              <dt class="text-sm text-gray-500">Created At</dt>
              <dd class="text-sm text-gray-900">{{ new Date(user.created_at).toLocaleString() }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-500">Last Login</dt>
              <dd class="text-sm text-gray-900">
                {{ user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never' }}
              </dd>
            </div>
          </dl>
        </div>

        <div class="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Roles</h2>
          <div v-if="user.roles?.length" class="flex flex-wrap gap-2">
            <span
              v-for="role in user.roles"
              :key="role.id"
              class="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {{ role.display_name }}
            </span>
          </div>
          <p v-else class="text-gray-400 text-sm">No roles assigned.</p>
        </div>
      </div>
    </template>

    <UiConfirmModal
      v-if="showDeleteModal"
      title="Delete User"
      :message="`Are you sure you want to delete ${user?.name}? This action cannot be undone.`"
      confirm-text="Delete"
      :danger="true"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types/user'
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'User Detail', meta: [{ name: 'robots', content: 'noindex' }] })

const route = useRoute()
const router = useRouter()
const { hasPermission } = usePermission()
const toast = useToast()
const userService = useUserService()

const user = ref<User | null>(null)
const loading = ref(true)
const showDeleteModal = ref(false)

function statusClass(status: string) {
  if (status === 'active') return 'bg-green-100 text-green-800'
  if (status === 'inactive') return 'bg-gray-100 text-gray-800'
  if (status === 'suspended') return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}

async function loadUser() {
  loading.value = true
  try {
    const response = await userService.getUser(route.params.id as string)
    user.value = response.data
  } catch (e) {
    const err = handleApiError(e)
    toast.error(err.message)
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (!user.value) return
  try {
    await userService.deleteUser(user.value.id)
    toast.success('User deleted successfully.')
    router.push('/dashboard/users')
  } catch (e) {
    const err = handleApiError(e)
    toast.error(err.message)
  }
}

await loadUser()
</script>
