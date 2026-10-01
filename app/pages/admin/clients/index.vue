<template>
  <div class="p-8 text-center text-gray-500">Redirecting to Clients...</div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
navigateTo('/dashboard/clients', { replace: true })
</script>
