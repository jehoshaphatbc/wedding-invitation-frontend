<template>
  <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
    <button
      class="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
      @click="uiStore.toggleSidebar()"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <div class="flex items-center gap-4">
      <span class="text-sm text-gray-700">{{ authStore.user?.name }}</span>
      <div class="relative">
        <button
          class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          @click="showDropdown = !showDropdown"
        >
          <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
            {{ authStore.user?.name?.charAt(0)?.toUpperCase() }}
          </div>
        </button>

        <div
          v-if="showDropdown"
          class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
        >
          <NuxtLink
            to="/dashboard/profile"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            @click="showDropdown = false"
          >
            Profile
          </NuxtLink>
          <button
            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const uiStore = useUIStore()
const { logout } = useAuth()
const showDropdown = ref(false)

async function handleLogout() {
  showDropdown.value = false
  await logout()
}
</script>
