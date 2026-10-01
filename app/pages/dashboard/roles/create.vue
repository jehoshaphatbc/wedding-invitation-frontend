<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Create Role</h1>

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
          <label for="display_name" class="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input
            id="display_name"
            v-model="form.display_name"
            type="text"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.display_name }"
          />
          <p v-if="errors.display_name" class="mt-1 text-sm text-red-600">{{ errors.display_name[0] }}</p>
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            v-model="form.description"
            rows="3"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.description }"
          />
          <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description[0] }}</p>
        </div>

        <div class="flex gap-3 pt-2">
          <button
            type="submit"
            :disabled="submitting"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <div v-if="submitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            {{ submitting ? 'Creating...' : 'Create Role' }}
          </button>
          <NuxtLink
            to="/dashboard/roles"
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
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Create Role', meta: [{ name: 'robots', content: 'noindex' }] })

const { isSuperAdmin } = usePermission()

if (!isSuperAdmin.value) {
  await navigateTo('/dashboard')
}

const toast = useToast()
const roleService = useRoleService()
const router = useRouter()

const submitting = ref(false)
const errors = reactive<Record<string, string[]>>({})

const form = reactive({
  name: '',
  display_name: '',
  description: '',
})

async function handleSubmit() {
  submitting.value = true
  Object.keys(errors).forEach((k) => delete errors[k])

  try {
    await roleService.createRole({
      name: form.name,
      display_name: form.display_name,
      description: form.description || undefined,
    })
    toast.success('Role created successfully.')
    router.push('/dashboard/roles')
  } catch (e) {
    const err = handleApiError(e)
    if (err.errors) Object.assign(errors, err.errors)
    toast.error(err.message)
  } finally {
    submitting.value = false
  }
}
</script>
