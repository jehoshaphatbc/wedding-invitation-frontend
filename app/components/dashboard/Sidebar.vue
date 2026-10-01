<template>
  <aside 
    class="fixed inset-y-0 left-0 bg-white border-r border-gray-200 z-30 transition-all duration-300 ease-in-out flex flex-col overflow-hidden"
    :class="uiStore.isOpen ? 'w-64' : 'w-16'"
  >
    <div class="flex items-center h-16 border-b border-gray-200 px-4 whitespace-nowrap" :class="uiStore.isOpen ? 'justify-start' : 'justify-center px-0'">
      <NuxtLink to="/dashboard" class="flex items-center gap-3 text-gray-800">
        <!-- Minimized (Square Logo) -->
        <template v-if="!uiStore.isOpen">
          <img v-if="companyStore.settings?.logo_square_url" :src="resolveImageUrl(companyStore.settings.logo_square_url)" alt="Logo" class="w-8 h-8 object-contain flex-shrink-0" />
          <svg v-else class="w-8 h-8 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </template>
        
        <!-- Maximized (Long Logo) -->
        <template v-else>
          <img v-if="companyStore.settings?.logo_long_url" :src="resolveImageUrl(companyStore.settings.logo_long_url)" alt="Logo" class="h-8 max-w-[180px] object-contain transition-opacity duration-300" />
          <template v-else>
            <svg class="w-8 h-8 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-xl font-bold transition-opacity duration-300 truncate max-w-[140px]">{{ companyStore.settings?.name || 'Wedding' }}</span>
          </template>
        </template>
      </NuxtLink>
    </div>

    <nav class="p-4 space-y-2 flex-1 overflow-y-auto" :class="!uiStore.isOpen ? 'px-2' : ''">
      <NuxtLink
        to="/dashboard"
        class="flex items-center px-3 py-2 text-sm font-medium rounded-lg group"
        :class="[$route.path === '/dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100', !uiStore.isOpen ? 'justify-center' : '']"
        :title="!uiStore.isOpen ? 'Dashboard' : ''"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
        <span v-if="uiStore.isOpen" class="ml-3 whitespace-nowrap">Dashboard</span>
      </NuxtLink>

      <div v-if="hasPermission('package.view') || hasPermission('template.view') || isSuperAdmin" class="pt-4 mt-4 border-t border-gray-200">
        <p v-if="uiStore.isOpen" class="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Management</p>
        <div v-else class="h-4"></div>
      </div>

      <NuxtLink
        v-if="hasPermission('package.view') || isSuperAdmin"
        to="/dashboard/packages"
        class="flex items-center px-3 py-2 text-sm font-medium rounded-lg group"
        :class="[$route.path.startsWith('/dashboard/packages') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100', !uiStore.isOpen ? 'justify-center' : '']"
        :title="!uiStore.isOpen ? 'Packages' : ''"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
        <span v-if="uiStore.isOpen" class="ml-3 whitespace-nowrap">Packages</span>
      </NuxtLink>

      <NuxtLink
        v-if="isSuperAdmin"
        to="/dashboard/features"
        class="flex items-center px-3 py-2 text-sm font-medium rounded-lg group"
        :class="[$route.path.startsWith('/dashboard/features') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100', !uiStore.isOpen ? 'justify-center' : '']"
        :title="!uiStore.isOpen ? 'Feature Packages' : ''"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
        </svg>
        <span v-if="uiStore.isOpen" class="ml-3 whitespace-nowrap">Feature Packages</span>
      </NuxtLink>

      <NuxtLink
        v-if="hasPermission('template.view') || isSuperAdmin"
        to="/dashboard/templates"
        class="flex items-center px-3 py-2 text-sm font-medium rounded-lg group"
        :class="[$route.path.startsWith('/dashboard/templates') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100', !uiStore.isOpen ? 'justify-center' : '']"
        :title="!uiStore.isOpen ? 'Templates' : ''"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <span v-if="uiStore.isOpen" class="ml-3 whitespace-nowrap">Templates</span>
      </NuxtLink>

      <NuxtLink
        to="/dashboard/orders"
        class="flex items-center px-3 py-2 text-sm font-medium rounded-lg group"
        :class="[$route.path.startsWith('/dashboard/orders') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100', !uiStore.isOpen ? 'justify-center' : '']"
        :title="!uiStore.isOpen ? 'Orders' : ''"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        </svg>
        <span v-if="uiStore.isOpen" class="ml-3 whitespace-nowrap">Orders</span>
      </NuxtLink>

      <NuxtLink
        to="/dashboard/clients"
        class="flex items-center px-3 py-2 text-sm font-medium rounded-lg group"
        :class="[$route.path.startsWith('/dashboard/clients') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100', !uiStore.isOpen ? 'justify-center' : '']"
        :title="!uiStore.isOpen ? 'Clients' : ''"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        <span v-if="uiStore.isOpen" class="ml-3 whitespace-nowrap">Clients</span>
      </NuxtLink>

      <div v-if="isSuperAdmin || hasPermission('user.view')" class="pt-4 mt-4 border-t border-gray-200">
        <p v-if="uiStore.isOpen" class="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Settings & Security</p>
        <div v-else class="h-4"></div>
      </div>

      <NuxtLink
        v-if="isSuperAdmin || hasPermission('user.view')"
        to="/dashboard/users"
        class="flex items-center px-3 py-2 text-sm font-medium rounded-lg group"
        :class="[$route.path.startsWith('/dashboard/users') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100', !uiStore.isOpen ? 'justify-center' : '']"
        :title="!uiStore.isOpen ? 'Users' : ''"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
        </svg>
        <span v-if="uiStore.isOpen" class="ml-3 whitespace-nowrap">Users</span>
      </NuxtLink>

      <NuxtLink
        v-if="isSuperAdmin"
        to="/dashboard/roles"
        class="flex items-center px-3 py-2 text-sm font-medium rounded-lg group"
        :class="[$route.path.startsWith('/dashboard/roles') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100', !uiStore.isOpen ? 'justify-center' : '']"
        :title="!uiStore.isOpen ? 'Roles' : ''"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
        <span v-if="uiStore.isOpen" class="ml-3 whitespace-nowrap">Roles</span>
      </NuxtLink>

      <NuxtLink
        v-if="isSuperAdmin"
        to="/dashboard/permissions"
        class="flex items-center px-3 py-2 text-sm font-medium rounded-lg group"
        :class="[$route.path.startsWith('/dashboard/permissions') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100', !uiStore.isOpen ? 'justify-center' : '']"
        :title="!uiStore.isOpen ? 'Permissions' : ''"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
        </svg>
        <span v-if="uiStore.isOpen" class="ml-3 whitespace-nowrap">Permissions</span>
      </NuxtLink>

      <NuxtLink
        v-if="isSuperAdmin"
        to="/dashboard/settings"
        class="flex items-center px-3 py-2 text-sm font-medium rounded-lg group"
        :class="[$route.path.startsWith('/dashboard/settings') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100', !uiStore.isOpen ? 'justify-center' : '']"
        :title="!uiStore.isOpen ? 'Company Settings' : ''"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span v-if="uiStore.isOpen" class="ml-3 whitespace-nowrap">Company Settings</span>
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
const uiStore = useUIStore()
const companyStore = useCompanyStore()
const { hasPermission, isSuperAdmin } = usePermission()

const config = useRuntimeConfig()
const apiBase = (config.public.apiBase as string || '').replace(/\/api\/v1\/?$/, '')

function resolveImageUrl(path?: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${apiBase}${path.startsWith('/') ? '' : '/'}${path}`
}
</script>
