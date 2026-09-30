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
      <div class="relative">
        <button
          class="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-100 focus:outline-none transition-colors"
          @click.stop="showDropdown = !showDropdown"
        >
          <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
            {{ authStore.user?.name?.charAt(0)?.toUpperCase() || 'U' }}
          </div>
          <div class="hidden sm:block text-left">
            <span class="block text-sm font-medium text-gray-700 leading-tight">{{ authStore.user?.name }}</span>
            <span v-if="primaryRole" class="block text-[11px] text-gray-400 font-medium capitalize">{{ primaryRole }}</span>
          </div>
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div
          v-if="showDropdown"
          class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 overflow-hidden"
          @click.stop
        >
          <div class="px-4 py-3 border-b border-gray-100 bg-gray-50/75">
            <p class="text-sm font-semibold text-gray-900 truncate">{{ authStore.user?.name }}</p>
            <p class="text-xs text-gray-500 truncate mt-0.5">{{ authStore.user?.email }}</p>
            <span v-if="primaryRole" class="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded bg-blue-100 text-blue-800">
              {{ primaryRole }}
            </span>
          </div>

          <NuxtLink
            to="/dashboard/profile"
            class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            @click="showDropdown = false"
          >
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Edit Profile
          </NuxtLink>

          <div class="border-t border-gray-100 my-1"></div>

          <button
            class="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            @click="handleLogout"
          >
            <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
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

const primaryRole = computed(() => {
  return authStore.user?.roles?.[0]?.display_name || authStore.user?.roles?.[0]?.name || ''
})

function closeDropdown() {
  showDropdown.value = false
}

onMounted(() => {
  window.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown)
})

async function handleLogout() {
  showDropdown.value = false
  await logout()
}
</script>
