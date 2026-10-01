<template>
  <div class="relative w-full">
    <input
      :id="id"
      :value="modelValue"
      :type="showPassword ? 'text' : 'password'"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :class="[
        'w-full rounded-md border border-gray-300 pl-3 pr-10 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 transition-colors',
        hasError
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
          : 'focus:border-indigo-500 focus:ring-indigo-500',
        inputClass
      ]"
    />
    <button
      type="button"
      @click="showPassword = !showPassword"
      class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
      tabindex="-1"
      :title="showPassword ? 'Sembunyikan password' : 'Lihat password'"
    >
      <!-- Eye Open (when password is hidden) -->
      <svg
        v-if="!showPassword"
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
      <!-- Eye Slash (when password is shown) -->
      <svg
        v-else
        class="w-5 h-5 text-indigo-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string
    id?: string
    autocomplete?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    hasError?: boolean
    inputClass?: string
  }>(),
  {
    modelValue: '',
    placeholder: '••••••••',
    required: false,
    disabled: false,
    hasError: false,
    inputClass: ''
  }
)

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const showPassword = ref(false)
</script>
