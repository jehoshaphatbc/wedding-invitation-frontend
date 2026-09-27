<template>
  <div class="min-h-screen flex">
    <DashboardSidebar />
    <div class="flex-1 flex flex-col transition-all duration-300 ease-in-out" :class="{ 'ml-64': uiStore.isOpen, 'ml-16': !uiStore.isOpen }">
      <DashboardTopbar />
      
      <!-- Unverified Email Banner -->
      <div v-if="authStore.user && (authStore.user.status === 'pending')" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-6 mt-6 rounded-r shadow-sm flex items-center justify-between">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-yellow-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p class="text-sm text-yellow-700">
            Email Anda belum diverifikasi. Silakan cek kotak masuk Anda.
          </p>
        </div>
        <button 
          @click="handleResendVerification" 
          :disabled="isResending"
          class="ml-4 px-3 py-1.5 text-sm font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 rounded-md transition-colors disabled:opacity-50"
        >
          {{ isResending ? 'Mengirim...' : 'Kirim Ulang Email' }}
        </button>
      </div>

      <main class="flex-1 p-6 bg-gray-50">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const uiStore = useUIStore()
const authStore = useAuthStore()
const authService = useAuthService()
const toast = useToast()

const isResending = ref(false)

async function handleResendVerification() {
  if (!authStore.user?.email) return
  
  isResending.value = true
  try {
    await authService.resendVerification({ email: authStore.user.email })
    toast.success('Email verifikasi berhasil dikirim ulang. Silakan cek inbox Anda.')
  } catch (error: any) {
    const msg = error?.data?.message || 'Gagal mengirim ulang verifikasi.'
    toast.error(msg)
  } finally {
    isResending.value = false
  }
}
</script>
