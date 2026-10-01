<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-base font-bold text-gray-900">Client Invitation Setup Data</h3>
            <span
              v-if="order?.status"
              class="px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
              :class="order.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
            >
              {{ order.status }}
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-0.5">
            Invoice: <span class="font-mono font-semibold text-gray-700">{{ order?.invoice_number || '-' }}</span>
            <span v-if="order?.client?.name || client?.name"> • {{ order?.client?.name || client?.name }}</span>
            <span v-if="order?.package?.name"> • {{ order.package.name }}</span>
          </p>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 overflow-y-auto space-y-6 text-sm flex-1">
        <!-- Loading State -->
        <div v-if="loading" class="py-12 text-center text-gray-500">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3" />
          <p class="text-xs font-medium">Fetching invitation data...</p>
        </div>

        <!-- Empty State (No Setup Data Yet) -->
        <div v-else-if="!invitationData" class="py-12 text-center max-w-sm mx-auto">
          <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h4 class="font-bold text-gray-900 mb-1">No Setup Data Yet</h4>
          <p class="text-xs text-gray-500 mb-4">
            The client has not filled out or saved their invitation details yet.
          </p>
          <button
            v-if="clientFormUrl"
            type="button"
            @click="openClientForm"
            class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs inline-flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open Client Form Link
          </button>
        </div>

        <!-- Populated Invitation Data -->
        <div v-else class="space-y-6">
          <!-- 1. Couple Details -->
          <div class="bg-pink-50/40 border border-pink-100 rounded-xl p-4">
            <h4 class="text-xs font-bold uppercase tracking-wider text-pink-700 mb-3 flex items-center gap-1.5">
              <span>👰🤵</span> Bride & Groom Details
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Groom -->
              <div class="bg-white p-3 rounded-lg border border-pink-100 shadow-2xs">
                <span class="text-[11px] font-bold text-blue-700 uppercase block mb-1">Groom (Pria)</span>
                <p class="font-bold text-gray-900 text-sm">{{ invitationData.groom?.full_name || '-' }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Nickname: {{ invitationData.groom?.nickname || '-' }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Parents: {{ invitationData.groom?.parents || '-' }}</p>
                <div v-if="invitationData.groom?.instagram" class="mt-1 flex items-center gap-1 text-xs text-blue-600 font-medium">
                  <span>@</span>
                  <a :href="`https://instagram.com/${invitationData.groom.instagram.replace(/^@/, '')}`" target="_blank" class="hover:underline">
                    {{ invitationData.groom.instagram.replace(/^@/, '') }}
                  </a>
                </div>
              </div>
              <!-- Bride -->
              <div class="bg-white p-3 rounded-lg border border-pink-100 shadow-2xs">
                <span class="text-[11px] font-bold text-pink-700 uppercase block mb-1">Bride (Wanita)</span>
                <p class="font-bold text-gray-900 text-sm">{{ invitationData.bride?.full_name || '-' }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Nickname: {{ invitationData.bride?.nickname || '-' }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Parents: {{ invitationData.bride?.parents || '-' }}</p>
                <div v-if="invitationData.bride?.instagram" class="mt-1 flex items-center gap-1 text-xs text-pink-600 font-medium">
                  <span>@</span>
                  <a :href="`https://instagram.com/${invitationData.bride.instagram.replace(/^@/, '')}`" target="_blank" class="hover:underline">
                    {{ invitationData.bride.instagram.replace(/^@/, '') }}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Event & Locations -->
          <div class="bg-slate-50 border border-gray-200 rounded-xl p-4 space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                <span>📍</span> Event Schedules & Venues
              </h4>
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {{ invitationData.event?.is_same_location ? 'Single Venue' : 'Separate Venues' }}
              </span>
            </div>

            <!-- Matrimony / Akad -->
            <div class="bg-white p-3 rounded-lg border border-gray-200">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-bold text-emerald-700 uppercase">💍 Holy Matrimony / Akad</span>
                <span class="text-xs font-semibold text-gray-700">{{ invitationData.event?.akad_date || '-' }}</span>
              </div>
              <p class="text-xs text-gray-600 font-medium">Time: {{ invitationData.event?.akad_time || '-' }}</p>
              <div class="mt-2 text-xs">
                <span class="font-bold text-gray-800">{{ invitationData.event?.akad_venue_name || invitationData.event?.venue_name || '-' }}</span>
                <p class="text-gray-500 mt-0.5">{{ invitationData.event?.akad_address || invitationData.event?.address || '-' }}</p>
                <a
                  v-if="invitationData.event?.akad_maps_url || invitationData.event?.maps_url"
                  :href="invitationData.event?.akad_maps_url || invitationData.event?.maps_url"
                  target="_blank"
                  class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium mt-1 hover:underline"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in Google Maps
                </a>
              </div>
            </div>

            <!-- Reception -->
            <div class="bg-white p-3 rounded-lg border border-gray-200">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-bold text-indigo-700 uppercase">🎉 Wedding Reception</span>
                <span class="text-xs font-semibold text-gray-700">{{ invitationData.event?.reception_date || '-' }}</span>
              </div>
              <p class="text-xs text-gray-600 font-medium">Time: {{ invitationData.event?.reception_time || '-' }}</p>
              <div class="mt-2 text-xs">
                <span class="font-bold text-gray-800">{{ invitationData.event?.reception_venue_name || invitationData.event?.venue_name || '-' }}</span>
                <p class="text-gray-500 mt-0.5">{{ invitationData.event?.reception_address || invitationData.event?.address || '-' }}</p>
                <a
                  v-if="invitationData.event?.reception_maps_url || invitationData.event?.maps_url"
                  :href="invitationData.event?.reception_maps_url || invitationData.event?.maps_url"
                  target="_blank"
                  class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium mt-1 hover:underline"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>

          <!-- 3. Photo Gallery / Google Drive Links -->
          <div class="bg-blue-50/40 border border-blue-100 rounded-xl p-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                <span>📸</span> Photo Gallery & Google Drive Links
              </h4>
              <span class="text-[11px] font-semibold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                {{ galleryLinks.length }} File / Link
              </span>
            </div>

            <div v-if="galleryLinks.length === 0" class="text-xs text-gray-400 italic bg-white p-3 rounded-lg border border-blue-100">
              No photos or Google Drive links submitted.
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="(link, idx) in galleryLinks"
                :key="idx"
                class="bg-white p-2.5 rounded-lg border border-blue-100 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div class="flex items-center gap-2 overflow-hidden flex-1">
                  <span class="text-xs font-bold text-gray-400 w-5">{{ idx + 1 }}.</span>
                  <a
                    :href="link"
                    target="_blank"
                    class="text-xs font-medium text-blue-600 hover:underline truncate"
                    :title="link"
                  >
                    {{ link }}
                  </a>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <a
                    :href="link"
                    target="_blank"
                    class="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Open Link</span>
                  </a>
                  <button
                    type="button"
                    @click="copyText(link, 'Photo link copied!')"
                    class="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy Link"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. Digital Envelope / Bank Accounts -->
          <div class="bg-amber-50/40 border border-amber-100 rounded-xl p-4">
            <h4 class="text-xs font-bold uppercase tracking-wider text-amber-800 mb-3 flex items-center gap-1.5">
              <span>💳</span> Digital Envelope & Bank Accounts
            </h4>

            <div v-if="giftList.length === 0" class="text-xs text-gray-400 italic bg-white p-3 rounded-lg border border-amber-100">
              No bank account information submitted.
            </div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="(gift, idx) in giftList"
                :key="idx"
                class="bg-white p-3 rounded-lg border border-amber-100 shadow-2xs"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-bold text-gray-800">{{ gift.bank_name || 'Bank / e-Wallet' }}</span>
                  <span v-if="gift.notes" class="text-[10px] text-gray-400 italic">{{ gift.notes }}</span>
                </div>
                <div class="flex items-center justify-between gap-2 mt-1">
                  <span class="font-mono font-bold text-blue-700 text-sm tracking-wide">{{ gift.account_number || '-' }}</span>
                  <button
                    v-if="gift.account_number"
                    type="button"
                    @click="copyText(gift.account_number, 'Account number copied!')"
                    class="text-[11px] text-blue-600 hover:text-blue-800 font-semibold px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">A/N: <span class="font-medium text-gray-700">{{ gift.account_holder || '-' }}</span></p>
              </div>
            </div>
          </div>

          <!-- 5. Theme & Story -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Theme -->
            <div class="bg-white p-4 rounded-xl border border-gray-200">
              <span class="text-xs font-bold text-gray-700 uppercase block mb-2">Selected Theme</span>
              <p class="font-bold text-gray-900 text-sm">{{ invitationData.theme?.template_component || '-' }}</p>
              <div class="mt-2 flex items-center gap-2">
                <span class="w-4 h-4 rounded-full border border-black/10 shadow-2xs" :style="{ backgroundColor: invitationData.theme?.primary_color || '#B76E79' }" />
                <span class="text-xs font-mono text-gray-600">{{ invitationData.theme?.primary_color || '#B76E79' }}</span>
              </div>
            </div>

            <!-- Story -->
            <div class="bg-white p-4 rounded-xl border border-gray-200">
              <span class="text-xs font-bold text-gray-700 uppercase block mb-2">Love Story</span>
              <p class="text-xs text-gray-600 whitespace-pre-line line-clamp-4">
                {{ invitationData.story || 'No love story submitted.' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-3.5 bg-slate-50 border-t border-gray-200 flex items-center justify-between">
        <button
          v-if="clientFormUrl"
          type="button"
          @click="openClientForm"
          class="text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-1"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open Client Setup Portal
        </button>
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors ml-auto shadow-2xs"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Order } from '~/types/order'
import type { Client } from '~/types/client'
import { useClientSetupService } from '~/services/client-setup.service'

const props = defineProps<{
  show: boolean
  order: Order | null
  client?: Client | null
}>()

defineEmits<{
  (e: 'close'): void
}>()

const toast = useToast()
const clientSetupService = useClientSetupService()

const loading = ref(false)
const invitationData = ref<any>(null)

const clientFormUrl = computed(() => {
  const token = props.order?.form_token || (props.client?.orders?.find(o => o.form_token)?.form_token)
  if (!token) return ''
  return typeof window !== 'undefined' ? `${window.location.origin}/client/setup?token=${token}` : ''
})

const galleryLinks = computed<string[]>(() => {
  if (!invitationData.value?.gallery) return []
  if (Array.isArray(invitationData.value.gallery)) {
    return invitationData.value.gallery.filter((l: string) => typeof l === 'string' && l.trim() !== '')
  }
  return []
})

const giftList = computed<any[]>(() => {
  if (!invitationData.value) return []
  if (Array.isArray(invitationData.value.gifts) && invitationData.value.gifts.length > 0) {
    return invitationData.value.gifts
  }
  if (invitationData.value.gift?.account_number) {
    return [invitationData.value.gift]
  }
  return []
})

function openClientForm() {
  if (clientFormUrl.value && typeof window !== 'undefined') {
    window.open(clientFormUrl.value, '_blank')
  }
}

async function copyText(text: string, msg = 'Copied to clipboard!') {
  try {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(text)
      toast.success(msg)
    } else {
      toast.info(text)
    }
  } catch {
    toast.error('Failed to copy text.')
  }
}

async function fetchSetupData() {
  invitationData.value = null
  const token = props.order?.form_token || (props.client?.orders?.find(o => o.form_token)?.form_token)

  // 1. Check if direct invitation object exists in order
  if (props.order?.invitation) {
    invitationData.value = props.order.invitation
    return
  }

  // 2. If token exists, fetch from verifyToken API / local draft
  if (token) {
    loading.value = true
    try {
      const res = await clientSetupService.verifyToken(token)
      if (res?.invitation) {
        invitationData.value = res.invitation
      }
    } catch (e) {
      // Fallback check local storage
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = localStorage.getItem(`client_invitation_draft_${token}`)
          if (raw) invitationData.value = JSON.parse(raw)
        } catch {}
      }
    } finally {
      loading.value = false
    }
  }
}

watch(
  () => props.show,
  (val) => {
    if (val) {
      fetchSetupData()
    }
  },
  { immediate: true }
)
</script>
