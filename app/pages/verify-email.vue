<script setup lang="ts">
definePageMeta({ layout: 'auth' })

useHead({
  title: 'Verify Email',
  meta: [
    { name: 'robots', content: 'noindex' },
  ],
})

const route = useRoute()
const router = useRouter()
const authService = useAuthService()
const toast = useToast()

const token = route.query.token as string

const status = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('')
const resendEmail = ref('')
const isResending = ref(false)

async function verify() {
  if (!token) {
    status.value = 'error'
    errorMessage.value = 'Invalid or missing verification token.'
    return
  }

  try {
    await authService.verifyEmail({ token })
    status.value = 'success'
  } catch (error: any) {
    status.value = 'error'
    errorMessage.value = error?.data?.message || 'Verification failed. The link may have expired or already been used.'
  }
}

async function handleResend() {
  if (!resendEmail.value) return
  isResending.value = true
  try {
    await authService.resendVerification({ email: resendEmail.value })
    toast.success('Email verifikasi berhasil dikirim ulang. Silakan cek inbox Anda.')
    resendEmail.value = ''
  } catch (error: any) {
    const msg = error?.data?.message || 'Gagal mengirim ulang verifikasi.'
    toast.error(msg)
  } finally {
    isResending.value = false
  }
}

onMounted(() => {
  verify()
})
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-8 text-center max-w-sm mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-4">
      Email Verification
    </h1>

    <div v-if="status === 'loading'" class="space-y-3">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      <p class="text-sm text-gray-600">
        Verifying your email address...
      </p>
    </div>

    <div v-else-if="status === 'success'" class="space-y-3">
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
        <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <p class="text-sm text-green-800 font-medium mb-6">
        Email berhasil diverifikasi!
      </p>
      <NuxtLink
        to="/dashboard"
        class="inline-block w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
      >
        Masuk ke Dashboard
      </NuxtLink>
    </div>

    <div v-else class="space-y-4">
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <p class="text-sm text-red-800 font-medium">
        {{ errorMessage }}
      </p>

      <div class="mt-6 pt-6 border-t border-gray-200 text-left">
        <p class="text-sm text-gray-700 font-medium mb-2 text-center">Kirim ulang verifikasi</p>
        <form @submit.prevent="handleResend" class="space-y-3">
          <input
            v-model="resendEmail"
            type="email"
            required
            placeholder="Masukkan alamat email Anda"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            :disabled="isResending"
            class="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none disabled:opacity-50"
          >
            {{ isResending ? 'Mengirim...' : 'Kirim Ulang Email' }}
          </button>
        </form>
      </div>
    </div>

    <p class="mt-6 text-sm text-gray-600">
      <NuxtLink to="/login" class="font-semibold text-indigo-600 hover:text-indigo-500">
        Back to Sign in
      </NuxtLink>
    </p>
  </div>
</template>
