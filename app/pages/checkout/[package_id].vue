<template>
  <div class="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Brand Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Checkout Pesanan</h1>
        <p class="text-sm text-gray-600 mt-2">Lengkapi data Anda untuk memesan paket undangan digital impian.</p>
      </div>

      <!-- Loading State -->
      <div v-if="loadingPackage" class="bg-white rounded-2xl shadow-sm p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
        <p class="text-gray-500 text-sm">Memuat rincian paket...</p>
      </div>

      <!-- Error / Package Not Found State -->
      <div v-else-if="packageError || !packageData" class="bg-white rounded-2xl shadow-sm p-10 text-center">
        <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h2 class="text-lg font-bold text-gray-900 mb-2">Paket Tidak Ditemukan</h2>
        <p class="text-sm text-gray-500 max-w-md mx-auto mb-6">
          Paket yang Anda pilih tidak valid atau telah dinonaktifkan oleh administrator.
        </p>
        <NuxtLink
          to="/"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Kembali ke Beranda
        </NuxtLink>
      </div>

      <!-- Main Checkout Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <!-- Left: Form Pemesanan Publik -->
        <div class="md:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
            Informasi Pemesan
          </h2>

          <form @submit.prevent="handleSubmitCheckout" class="space-y-5">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap / Pasangan <span class="text-red-500">*</span>
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                placeholder="Contoh: Sarah & Danu"
                class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Alamat Email <span class="text-red-500">*</span>
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                placeholder="emailanda@example.com"
                class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <p class="text-xs text-gray-500 mt-1">Invoice dan akses akun akan dikirimkan ke email ini.</p>
            </div>

            <div>
              <label for="whatsapp" class="block text-sm font-medium text-gray-700 mb-1">
                Nomor WhatsApp <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">🇮🇩 +62</span>
                <input
                  id="whatsapp"
                  v-model="form.whatsapp"
                  type="tel"
                  required
                  placeholder="81234567890"
                  class="w-full rounded-xl border border-gray-300 pl-20 pr-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              <p class="text-xs text-gray-500 mt-1">Notifikasi status order dan link undangan akan dikirimkan melalui WhatsApp.</p>
            </div>

            <div class="pt-4 border-t border-gray-100">
              <button
                type="submit"
                :disabled="submitting"
                class="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                <div v-if="submitting" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>{{ submitting ? 'Memproses Pembayaran...' : 'Lanjutkan ke Pembayaran' }}</span>
                <svg v-if="!submitting" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </button>
              <p class="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                <svg class="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                Pembayaran Aman & Terenkripsi Otomatis
              </p>
            </div>
          </form>
        </div>

        <!-- Right: Ringkasan Paket -->
        <div class="md:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">2</span>
            Ringkasan Paket
          </h2>

          <div class="p-4 rounded-xl bg-blue-50/60 border border-blue-100 mb-6">
            <span class="text-xs uppercase font-bold text-blue-600 tracking-wider">Paket Terpilih</span>
            <div class="text-xl font-bold text-gray-900 mt-1">{{ packageData.name }}</div>
            <div class="text-2xl font-extrabold text-blue-600 mt-2">
              Rp {{ (packageData.price ?? 0).toLocaleString('id-ID') }}
            </div>
          </div>

          <!-- Fitur Termasuk -->
          <div class="mb-6">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Fitur yang Termasuk</h3>
            <ul class="space-y-2 text-sm text-gray-600">
              <template v-if="activeFeaturesList.length > 0">
                <li v-for="feat in activeFeaturesList" :key="feat" class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span>{{ feat }}</span>
                </li>
              </template>
              <li v-else class="text-gray-400 italic text-xs">Semua fitur standar undangan digital aktif.</li>
            </ul>
          </div>

          <!-- Total Ringkasan Biaya -->
          <div class="border-t border-gray-200 pt-4 space-y-2 text-sm">
            <div class="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>Rp {{ (packageData.price ?? 0).toLocaleString('id-ID') }}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Biaya Layanan</span>
              <span class="text-emerald-600 font-medium">Gratis</span>
            </div>
            <div class="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total Pembayaran</span>
              <span class="text-blue-600">Rp {{ (packageData.price ?? 0).toLocaleString('id-ID') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Package } from '~/types/package'
import { handleApiError } from '~/utils/errors'

const route = useRoute()
const packageService = usePackageService()
const checkoutService = useCheckoutService()
const toast = useToast()

const packageId = String(route.params.package_id || '')

useHead({
  title: 'Checkout Pesanan',
  meta: [{ name: 'robots', content: 'noindex' }]
})

const loadingPackage = ref(true)
const packageError = ref(false)
const packageData = ref<Package | null>(null)
const submitting = ref(false)

const form = ref({
  name: '',
  email: '',
  whatsapp: ''
})

const activeFeaturesList = computed(() => {
  if (!packageData.value?.features_config) return []
  const cfg = packageData.value.features_config as Record<string, any>
  const list: string[] = []

  if (cfg.has_gallery) {
    list.push(`Galeri Foto (${cfg.gallery_limit ?? 0} foto)`)
  }

  for (const [k, v] of Object.entries(cfg)) {
    if (k === 'has_gallery' || k === 'gallery_limit') continue
    if (typeof v === 'boolean' && v) {
      const cleanName = k.replace(/^has_/, '').replace(/_/g, ' ')
      list.push(cleanName.charAt(0).toUpperCase() + cleanName.slice(1))
    } else if (typeof v === 'number' && v > 0) {
      list.push(`${k.replace(/_/g, ' ')}: ${v}`)
    }
  }

  return list
})

async function loadPackage() {
  if (!packageId) {
    packageError.value = true
    loadingPackage.value = false
    return
  }

  loadingPackage.value = true
  try {
    const res = await packageService.getPackage(packageId)
    const pkg = (res as any)?.data || res
    if (pkg && pkg.id) {
      let cfg = pkg.features_config
      if (typeof cfg === 'string') {
        try { cfg = JSON.parse(cfg) } catch { cfg = {} }
      }
      packageData.value = { ...pkg, features_config: cfg || {} }
    } else {
      packageError.value = true
    }
  } catch (err) {
    packageError.value = true
  } finally {
    loadingPackage.value = false
  }
}

async function handleSubmitCheckout() {
  if (!form.value.name || !form.value.email || !form.value.whatsapp) {
    toast.error('Harap lengkapi semua field yang wajib diisi.')
    return
  }

  submitting.value = true
  try {
    let cleanWa = form.value.whatsapp.trim().replace(/\D/g, '')
    if (cleanWa.startsWith('0')) {
      cleanWa = '62' + cleanWa.slice(1)
    } else if (!cleanWa.startsWith('62')) {
      cleanWa = '62' + cleanWa
    }

    const payload = {
      package_id: packageId,
      name: form.value.name.trim(),
      email: form.value.email.trim(),
      whatsapp: cleanWa
    }

    const res = await checkoutService.submitCheckout(payload)
    if (res?.payment_url) {
      toast.success('Pesanan dibuat. Mengalihkan ke halaman pembayaran...')
      if (typeof window !== 'undefined') {
        window.location.href = res.payment_url
      }
    } else {
      toast.error('Payment URL tidak diterima dari server.')
    }
  } catch (e: any) {
    toast.error(handleApiError(e).message || 'Gagal memproses checkout.')
  } finally {
    submitting.value = false
  }
}

if (import.meta.server) {
  try {
    await loadPackage()
  } catch {}
}

onMounted(() => {
  if (!packageData.value) {
    loadPackage()
  }
})
</script>
