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
const isSuccess = ref(false)
const verificationToken = ref('')

function clearErrors() {
  Object.keys(fieldErrors).forEach((key) => {
    fieldErrors[key] = ''
  })
}

function validate(): boolean {
  clearErrors()

  if (!form.name) {
    fieldErrors.name = 'Name is required.'
  }

  if (!form.email) {
    fieldErrors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    fieldErrors.email = 'Invalid email format.'
  }

  if (!form.password) {
    fieldErrors.password = 'Password is required.'
  } else if (form.password.length < 8) {
    fieldErrors.password = 'Password must be at least 8 characters.'
  }

  if (form.password !== form.password_confirmation) {
    fieldErrors.password_confirmation = 'Password confirmation does not match.'
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
    const response = await authService.register({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      password: form.password,
      password_confirmation: form.password_confirmation,
    })
    
    if (response.data?.token) {
      verificationToken.value = response.data.token
    }
    
    isSuccess.value = true
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
    <div v-if="!isSuccess">
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
          <UiPasswordInput
            id="password"
            v-model="form.password"
            autocomplete="new-password"
            placeholder="Min. 8 characters"
            :has-error="!!fieldErrors.password"
          />
          <p v-if="fieldErrors.password" class="mt-1 text-sm text-red-600">
            {{ fieldErrors.password }}
          </p>
        </div>

        <div>
          <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <UiPasswordInput
            id="password_confirmation"
            v-model="form.password_confirmation"
            autocomplete="new-password"
            placeholder="Repeat your password"
            :has-error="!!fieldErrors.password_confirmation"
          />
          <p v-if="fieldErrors.password_confirmation" class="mt-1 text-sm text-red-600">
            {{ fieldErrors.password_confirmation }}
          </p>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <div v-if="isLoading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          <span>{{ isLoading ? 'Creating account...' : 'Register' }}</span>
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-gray-600">
        Already have an account?
        <NuxtLink to="/login" class="font-semibold text-indigo-600 hover:text-indigo-500">
          Sign in
        </NuxtLink>
      </p>
    </div>

    <!-- Success Screen / Check Email -->
    <div v-else class="text-center py-4">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
        <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
      <p class="text-gray-600 mb-8">
        We've sent a verification link to <span class="font-semibold text-gray-900">{{ form.email }}</span>.
        Please click the link to activate your account.
      </p>

      <div v-if="verificationToken" class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <p class="text-sm text-gray-500 mb-3">
          (Simulation Mode: The API returned a token. Click below to simulate email verification)
        </p>
        <NuxtLink
          :to="`/verify-email?token=${verificationToken}`"
          class="inline-block rounded-md bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus:outline-none"
        >
          Simulate Email Click
        </NuxtLink>
      </div>

      <NuxtLink to="/login" class="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
        Return to login
      </NuxtLink>
    </div>
  </div>
</template>
