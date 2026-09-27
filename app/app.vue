<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UiToastContainer />
  </div>
</template>

<script setup lang="ts">
const companyStore = useCompanyStore()
const config = useRuntimeConfig()
const apiBase = (config.public.apiBase as string || '').replace(/\/api\/v1\/?$/, '')

function resolveImageUrl(path?: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${apiBase}${path.startsWith('/') ? '' : '/'}${path}`
}

await useAsyncData('companySettings', () => companyStore.loadSettings())

useHead({
  link: [
    {
      rel: 'icon',
      href: () => resolveImageUrl(companyStore.settings?.favicon_url) || '/favicon.ico'
    }
  ],
  titleTemplate: (titleChunk) => {
    const companyName = companyStore.settings?.name || 'Wedding Platform'
    return titleChunk ? `${titleChunk} - ${companyName}` : companyName
  }
})
</script>
