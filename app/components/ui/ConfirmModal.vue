<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
      <p class="text-gray-600 mb-6">{{ message }}</p>
      <div class="flex justify-end gap-3">
        <button
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 text-sm font-medium text-white rounded-lg"
          :class="danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  message: string
  confirmText?: string
  danger?: boolean
}>()

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>
