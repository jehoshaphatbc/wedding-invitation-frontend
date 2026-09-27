<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
      <p class="text-gray-600 mb-4">{{ message }}</p>

      <div v-if="requireInput" class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Type <strong>{{ requireInput }}</strong> to confirm:
        </label>
        <input
          v-model="inputValue"
          type="text"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          :placeholder="requireInput"
        />
      </div>
      <div v-else class="mb-2"></div>

      <div class="flex justify-end gap-3">
        <button
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          :class="danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'"
          :disabled="isConfirmDisabled"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  message: string
  confirmText?: string
  danger?: boolean
  requireInput?: string
}>()

defineEmits<{
  confirm: []
  cancel: []
}>()

const inputValue = ref('')

const isConfirmDisabled = computed(() => {
  if (props.requireInput) {
    return inputValue.value !== props.requireInput
  }
  return false
})
</script>
