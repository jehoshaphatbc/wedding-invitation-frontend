<template>
  <div class="min-h-screen flex">
    <DashboardSidebar />
    <div class="flex-1 flex flex-col" :class="{ 'ml-64': uiStore.isOpen, 'ml-0': !uiStore.isOpen }">
      <DashboardTopbar />
      <main class="flex-1 p-6 bg-gray-50">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const uiStore = useUIStore()
</script>
