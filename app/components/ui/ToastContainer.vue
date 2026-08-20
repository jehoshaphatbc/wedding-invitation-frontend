<template>
  <div v-if="toasts.length" class="fixed top-4 right-4 z-50 space-y-2">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="px-4 py-3 rounded-lg shadow-lg text-white text-sm max-w-sm"
      :class="{
        'bg-green-500': toast.type === 'success',
        'bg-red-500': toast.type === 'error',
        'bg-yellow-500': toast.type === 'warning',
        'bg-blue-500': toast.type === 'info',
      }"
    >
      <div class="flex items-center justify-between">
        <span>{{ toast.message }}</span>
        <button
          class="ml-2 text-white/80 hover:text-white"
          @click="dismiss(toast.id)"
        >
          &times;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { toasts, dismiss } = useToast()
</script>
