<template>
  <div class="p-8 text-center text-gray-500">Redirecting to Master Fitur...</div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
navigateTo('/dashboard/features', { replace: true })
</script>
