<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Create User</h1>

    <div class="bg-white rounded-lg shadow p-6">
      <form @submit.prevent="handleSubmit" class="space-y-4 max-w-lg">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.name }"
          />
          <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name[0] }}</p>
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.email }"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email[0] }}</p>
        </div>

        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            id="phone"
            v-model="form.phone"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.phone }"
          />
          <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone[0] }}</p>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.password }"
          />
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password[0] }}</p>
        </div>

        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            id="status"
            v-model="form.status"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div v-if="hasPermission('role.assign')">
          <label class="block text-sm font-medium text-gray-700 mb-1">Roles</label>
          <div v-if="rolesLoading" class="text-sm text-gray-500">Loading roles...</div>
          <div v-else class="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
            <label
              v-for="role in roles"
              :key="role.id"
              class="flex items-center gap-2 text-sm"
            >
              <input
                v-model="form.role_ids"
                type="checkbox"
                :value="role.id"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {{ role.display_name }}
            </label>
          </div>
          <p v-if="errors.role_ids" class="mt-1 text-sm text-red-600">{{ errors.role_ids[0] }}</p>
        </div>

        <div class="flex gap-3 pt-2">
          <button
            type="submit"
            :disabled="submitting"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submitting ? 'Creating...' : 'Create User' }}
          </button>
          <NuxtLink
            to="/dashboard/users"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Role } from '~/types/role'
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Create User', meta: [{ name: 'robots', content: 'noindex' }] })

const { hasPermission } = usePermission()
const toast = useToast()
const userService = useUserService()
const roleService = useRoleService()
const router = useRouter()

const roles = ref<Role[]>([])
const rolesLoading = ref(false)
const submitting = ref(false)
const errors = reactive<Record<string, string[]>>({})

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  status: 'active',
  role_ids: [] as string[],
})

if (hasPermission('role.assign')) {
  rolesLoading.value = true
  roleService.getRoles()
    .then((res) => { roles.value = res.data })
    .catch((e) => { toast.error(handleApiError(e).message) })
    .finally(() => { rolesLoading.value = false })
}

async function handleSubmit() {
  submitting.value = true
  Object.keys(errors).forEach((k) => delete errors[k])

  try {
    await userService.createUser({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      password: form.password,
      status: form.status,
      role_ids: form.role_ids.length ? form.role_ids : undefined,
    })
    toast.success('User created successfully.')
    router.push('/dashboard/users')
  } catch (e) {
    const err = handleApiError(e)
    if (err.errors) Object.assign(errors, err.errors)
    toast.error(err.message)
  } finally {
    submitting.value = false
  }
}
</script>
