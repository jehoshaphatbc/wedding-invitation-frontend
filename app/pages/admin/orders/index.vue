<template>
  <div class="p-8 text-center text-gray-500">Redirecting to Orders...</div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
navigateTo('/dashboard/orders', { replace: true })
</script>
