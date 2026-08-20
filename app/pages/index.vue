<template>
  <div class="min-h-screen">
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="text-xl font-bold text-gray-800">Wedding Platform</NuxtLink>
        <nav class="flex items-center gap-6">
          <NuxtLink to="/login" class="text-sm text-gray-600 hover:text-gray-900">Login</NuxtLink>
          <NuxtLink to="/register" class="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Get Started</NuxtLink>
        </nav>
      </div>
    </header>
    <main>
      <section class="py-20 text-center">
        <h1 class="text-5xl font-bold text-gray-900 mb-4">Create Beautiful Wedding Invitations</h1>
        <p class="text-xl text-gray-600 mb-8">Share your special day with elegance</p>
        <NuxtLink to="/register" class="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700">
          Start Planning
        </NuxtLink>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

useHead({
  title: 'Wedding Invitation Platform',
  meta: [
    { name: 'description', content: 'Create and share beautiful wedding invitations online.' },
    { name: 'robots', content: 'index, follow' },
  ],
})
</script>
