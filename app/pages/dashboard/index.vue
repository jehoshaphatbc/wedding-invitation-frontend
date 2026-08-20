<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">
      Welcome back, {{ user?.name ?? 'User' }}
    </h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-sm font-medium text-gray-500 mb-1">Account Status</h2>
        <span
          class="inline-block px-2.5 py-0.5 rounded-full text-sm font-medium"
          :class="
            user?.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          "
        >
          {{ user?.status ?? 'Unknown' }}
        </span>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-sm font-medium text-gray-500 mb-1">Email Verification</h2>
        <span
          class="inline-block px-2.5 py-0.5 rounded-full text-sm font-medium"
          :class="
            user?.email_verified_at
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          "
        >
          {{ user?.email_verified_at ? 'Verified' : 'Not Verified' }}
        </span>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-sm font-medium text-gray-500 mb-1">Email</h2>
        <p class="text-gray-900">{{ user?.email }}</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6 md:col-span-2 lg:col-span-3">
        <h2 class="text-sm font-medium text-gray-500 mb-3">Your Roles</h2>
        <div v-if="user?.roles?.length" class="flex flex-wrap gap-2">
          <span
            v-for="role in user.roles"
            :key="role.id"
            class="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
          >
            {{ role.display_name }}
          </span>
        </div>
        <p v-else class="text-gray-400 text-sm">No roles assigned.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

useHead({ title: 'Dashboard', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const { user } = useAuth()
</script>
