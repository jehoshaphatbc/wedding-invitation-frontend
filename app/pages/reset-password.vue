<script setup lang="ts">
definePageMeta({ layout: 'auth' })

useHead({
  title: 'Reset Password',
  meta: [
    { name: 'robots', content: 'noindex' },
  ],
})

const route = useRoute()
const router = useRouter()
const authService = useAuthService()
const toast = useToast()

const token = route.query.token as string

const form = reactive({
  password: '',
  password_confirmation: '',
})

const errors = reactive({
  password: '',
  password_confirmation: '',
})

const isLoading = ref(false)

function validate(): boolean {
  errors.password = ''
  errors.password_confirmation = ''

  if (!form.password) {
    errors.password = 'Password wajib diisi.'
  } else if (form.password.length < 8) {
    errors.password = 'Password minimal 8 karakter.'
  }

  if (!form.password_confirmation) {
    errors.password_confirmation = 'Konfirmasi password wajib diisi.'
  } else if (form.password !== form.password_confirmation) {
    errors.password_confirmation = 'Konfirmasi password tidak cocok.'
  }

  return !errors.password && !errors.password_confirmation
}

async function handleSubmit() {
  if (!validate()) return

  isLoading.value = true
  try {
    await authService.resetPassword({
      token,
      password: form.password,
    })
    toast.success('Password has been reset successfully.')
    router.push('/login')
  } catch (error: any) {
    toast.error(error?.data?.message || 'Failed to reset password. The link may have expired.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-8">
    <h1 class="text-2xl font-bold text-center text-gray-900 mb-2">
      Reset Password
    </h1>
    <p class="text-sm text-gray-600 text-center mb-6">
      Enter your new password below.
    </p>

    <div v-if="!token" class="rounded-md bg-red-50 p-4 mb-4">
      <p class="text-sm text-red-800">
        Invalid or missing reset token. Please request a new password reset link.
      </p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          autocomplete="new-password"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          :class="{ 'border-red-500': errors.password }"
          placeholder="Min. 8 characters"
        />
        <p v-if="errors.password" class="mt-1 text-sm text-red-600">
          {{ errors.password }}
        </p>
      </div>

      <div>
        <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-1">
          Confirm New Password
        </label>
        <input
          id="password_confirmation"
          v-model="form.password_confirmation"
          type="password"
          autocomplete="new-password"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          :class="{ 'border-red-500': errors.password_confirmation }"
          placeholder="Repeat your password"
        />
        <p v-if="errors.password_confirmation" class="mt-1 text-sm text-red-600">
          {{ errors.password_confirmation }}
        </p>
      </div>

      <button
        type="submit"
        :disabled="isLoading || !token"
        class="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isLoading">Resetting...</span>
        <span v-else>Reset Password</span>
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-600">
      <NuxtLink to="/login" class="font-semibold text-indigo-600 hover:text-indigo-500">
        Back to Sign in
      </NuxtLink>
    </p>
  </div>
</template>
