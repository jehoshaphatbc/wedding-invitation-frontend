<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
      <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
      <h2 class="text-base font-semibold text-gray-800">Mengarahkan ke Portal Klien...</h2>
      <p class="text-xs text-gray-500 mt-1">Harap tunggu sebentar selagi kami menyiapkan formulir Anda.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const token = String(route.params.token || '')

if (token) {
  navigateTo(`/client/setup?token=${encodeURIComponent(token)}`, { replace: true })
} else {
  navigateTo('/client/setup', { replace: true })
}
</script>
