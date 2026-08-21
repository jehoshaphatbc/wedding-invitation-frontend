<template>
  <aside class="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30">
    <div class="flex items-center justify-center h-16 border-b border-gray-200">
      <NuxtLink to="/dashboard" class="text-xl font-bold text-gray-800">
        Wedding Platform
      </NuxtLink>
    </div>

    <nav class="p-4 space-y-1">
      <NuxtLink
        to="/dashboard"
        class="flex items-center px-3 py-2 text-sm font-medium rounded-lg"
        :class="$route.path === '/dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
      >
        Dashboard
      </NuxtLink>

      <NuxtLink
        to="/dashboard/profile"
        class="flex items-center px-3 py-2 text-sm font-medium rounded-lg"
        :class="$route.path.startsWith('/dashboard/profile') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
      >
        Profile
      </NuxtLink>

      <div v-if="hasPermission('user.view') || hasPermission('role.view') || hasPermission('permission.view')" class="pt-4 mt-4 border-t border-gray-200">
        <p class="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Management</p>
      </div>

      <NuxtLink
        v-if="hasPermission('user.view')"
        to="/dashboard/users"
        class="flex items-center px-3 py-2 text-sm font-medium rounded-lg"
        :class="$route.path.startsWith('/dashboard/users') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
      >
        Users
      </NuxtLink>

      <NuxtLink
        v-if="hasPermission('role.view')"
        to="/dashboard/roles"
        class="flex items-center px-3 py-2 text-sm font-medium rounded-lg"
        :class="$route.path.startsWith('/dashboard/roles') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
      >
        Roles
      </NuxtLink>

      <NuxtLink
        v-if="hasPermission('permission.view')"
        to="/dashboard/permissions"
        class="flex items-center px-3 py-2 text-sm font-medium rounded-lg"
        :class="$route.path.startsWith('/dashboard/permissions') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
      >
        Permissions
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
const { hasPermission } = usePermission()
</script>
