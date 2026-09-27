<script setup lang="ts">
import { handleApiError } from "~/utils/errors"
definePageMeta({ layout: 'auth' })

useHead({
  title: 'Login',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const { login } = useAuth()
const toast = useToast()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

const isLoading = ref(false)

function validate(): boolean {
  errors.email = ''
  errors.password = ''

  if (!form.email) {
    errors.email = 'Email wajib diisi.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Format email tidak valid.'
  }

  if (!form.password) {
    errors.password = 'Password wajib diisi.'
  }

  return !errors.email && !errors.password
}

async function handleSubmit() {
  if (!validate()) return

  isLoading.value = true
  try {
    await login(form.email, form.password)
    router.push('/dashboard')
  } catch (e) {
    const err = handleApiError(e)
    toast.error(err.message || 'Email atau password salah.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-8">
    <h1 class="text-2xl font-bold text-center text-gray-900 mb-6">
      Login
    </h1>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          :class="{ 'border-red-500': errors.email }"
          placeholder="you@example.com"
        />
        <p v-if="errors.email" class="mt-1 text-sm text-red-600">
          {{ errors.email }}
        </p>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          autocomplete="current-password"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          :class="{ 'border-red-500': errors.password }"
          placeholder="Enter your password"
        />
        <p v-if="errors.password" class="mt-1 text-sm text-red-600">
          {{ errors.password }}
        </p>
      </div>

      <div class="text-right">
        <NuxtLink
          to="/forgot-password"
          class="text-sm text-indigo-600 hover:text-indigo-500"
        >
          Forgot password?
        </NuxtLink>
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isLoading">Signing in...</span>
        <span v-else>Sign in</span>
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-600">
      Don't have an account?
      <NuxtLink to="/register" class="font-semibold text-indigo-600 hover:text-indigo-500">
        Register
      </NuxtLink>
    </p>
  </div>
</template>
