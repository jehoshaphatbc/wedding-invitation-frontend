<script setup lang="ts">
definePageMeta({ layout: 'auth' })

useHead({
  title: 'Forgot Password',
  meta: [
    { name: 'robots', content: 'noindex' },
  ],
})

const authService = useAuthService()
const toast = useToast()

const email = ref('')
const emailError = ref('')
const isLoading = ref(false)
const isSubmitted = ref(false)

function validate(): boolean {
  emailError.value = ''

  if (!email.value) {
    emailError.value = 'Email wajib diisi.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Format email tidak valid.'
  }

  return !emailError.value
}

async function handleSubmit() {
  if (!validate()) return

  isLoading.value = true
  try {
    await authService.forgotPassword({ email: email.value })
    isSubmitted.value = true
  } catch {
    isSubmitted.value = true
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-8">
    <h1 class="text-2xl font-bold text-center text-gray-900 mb-2">
      Forgot Password
    </h1>
    <p class="text-sm text-gray-600 text-center mb-6">
      Enter your email address and we'll send you a link to reset your password.
    </p>

    <div v-if="isSubmitted" class="rounded-md bg-green-50 p-4 mb-4">
      <p class="text-sm text-green-800">
        If the email exists, a password reset link has been sent.
      </p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          :class="{ 'border-red-500': emailError }"
          placeholder="you@example.com"
        />
        <p v-if="emailError" class="mt-1 text-sm text-red-600">
          {{ emailError }}
        </p>
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isLoading">Sending...</span>
        <span v-else>Send Reset Link</span>
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-600">
      <NuxtLink to="/login" class="font-semibold text-indigo-600 hover:text-indigo-500">
        Back to Sign in
      </NuxtLink>
    </p>
  </div>
</template>
