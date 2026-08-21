<script setup lang="ts">
import type { ApiValidationError } from '~/types/api'

definePageMeta({ layout: 'auth' })

useHead({
  title: 'Register',
  meta: [
    { name: 'robots', content: 'noindex' },
  ],
})

const authService = useAuthService()
const toast = useToast()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
})

const fieldErrors = reactive<Record<string, string>>({
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
})

const isLoading = ref(false)

function clearErrors() {
  Object.keys(fieldErrors).forEach((key) => {
    fieldErrors[key] = ''
  })
}

function validate(): boolean {
  clearErrors()

  if (!form.name) {
    fieldErrors.name = 'Nama wajib diisi.'
  }

  if (!form.email) {
    fieldErrors.email = 'Email wajib diisi.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    fieldErrors.email = 'Format email tidak valid.'
  }

  if (!form.password) {
    fieldErrors.password = 'Password wajib diisi.'
  } else if (form.password.length < 8) {
    fieldErrors.password = 'Password minimal 8 karakter.'
  }

  if (form.password !== form.password_confirmation) {
    fieldErrors.password_confirmation = 'Konfirmasi password tidak cocok.'
  }

  return !Object.values(fieldErrors).some(Boolean)
}

function setApiErrors(errors: Record<string, string[]>) {
  clearErrors()
  for (const [field, messages] of Object.entries(errors)) {
    if (fieldErrors.hasOwnProperty(field)) {
      fieldErrors[field] = messages[0]
    }
  }
}

async function handleSubmit() {
  if (!validate()) return

  isLoading.value = true
  try {
    await authService.register({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      password: form.password,
      password_confirmation: form.password_confirmation,
    })
    toast.success('Registration successful. Please verify your email.')
  } catch (error: any) {
    const apiError = error?.data as ApiValidationError | undefined
    if (apiError?.errors) {
      setApiErrors(apiError.errors)
    } else {
      toast.error('Registration failed. Please try again.')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-8">
    <h1 class="text-2xl font-bold text-center text-gray-900 mb-6">
      Register
    </h1>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          autocomplete="name"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          :class="{ 'border-red-500': fieldErrors.name }"
          placeholder="Your name"
        />
        <p v-if="fieldErrors.name" class="mt-1 text-sm text-red-600">
          {{ fieldErrors.name }}
        </p>
      </div>

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
          :class="{ 'border-red-500': fieldErrors.email }"
          placeholder="you@example.com"
        />
        <p v-if="fieldErrors.email" class="mt-1 text-sm text-red-600">
          {{ fieldErrors.email }}
        </p>
      </div>

      <div>
        <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
          Phone <span class="text-gray-400">(optional)</span>
        </label>
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          autocomplete="tel"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          :class="{ 'border-red-500': fieldErrors.phone }"
          placeholder="08xxxxxxxxxx"
        />
        <p v-if="fieldErrors.phone" class="mt-1 text-sm text-red-600">
          {{ fieldErrors.phone }}
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
          autocomplete="new-password"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          :class="{ 'border-red-500': fieldErrors.password }"
          placeholder="Min. 8 characters"
        />
        <p v-if="fieldErrors.password" class="mt-1 text-sm text-red-600">
          {{ fieldErrors.password }}
        </p>
      </div>

      <div>
        <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          id="password_confirmation"
          v-model="form.password_confirmation"
          type="password"
          autocomplete="new-password"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          :class="{ 'border-red-500': fieldErrors.password_confirmation }"
          placeholder="Repeat your password"
        />
        <p v-if="fieldErrors.password_confirmation" class="mt-1 text-sm text-red-600">
          {{ fieldErrors.password_confirmation }}
        </p>
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isLoading">Creating account...</span>
        <span v-else>Register</span>
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-600">
      Already have an account?
      <NuxtLink to="/login" class="font-semibold text-indigo-600 hover:text-indigo-500">
        Sign in
      </NuxtLink>
    </p>
  </div>
</template>
