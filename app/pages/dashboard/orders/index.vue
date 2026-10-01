<template>
  <div @click="activeDropdown = null">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Orders</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola data pesanan, status pembayaran, Link Akses Klien, dan Link Scanner (Hari H).</p>
      </div>
      <div class="flex gap-2">
        <button
          v-if="canViewTrash"
          @click="toggleViewMode"
          class="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          :class="viewMode === 'trash' ? 'bg-red-50 text-red-600 border-red-200' : 'text-gray-700 bg-white'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {{ viewMode === 'trash' ? 'Lihat Order Aktif' : 'Trash' }}
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow">
      <!-- Bulk Actions Bar -->
      <div v-if="selectedOrders.length > 0" class="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center justify-between">
        <span class="text-sm text-blue-800 font-medium">{{ selectedOrders.length }} order terpilih</span>
        <div class="flex gap-2">
          <template v-if="viewMode === 'active'">
            <button
              @click="showBulkDeleteModal = true"
              class="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded hover:bg-red-50"
            >
              Hapus Terpilih
            </button>
          </template>
          <template v-else>
            <button
              v-if="isSuperAdmin"
              @click="showBulkRestoreModal = true"
              class="px-3 py-1.5 text-sm font-medium text-green-600 bg-white border border-green-200 rounded hover:bg-green-50"
            >
              Pulihkan Terpilih
            </button>
            <button
              v-if="isSuperAdmin"
              @click="showBulkForceDeleteModal = true"
              class="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded hover:bg-red-50"
            >
              Hapus Permanen Terpilih
            </button>
          </template>
        </div>
      </div>

      <!-- Search & Status Filter Tab Bar -->
      <div class="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Cari invoice, nama klien, atau email..."
            class="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <!-- Status Filter Tabs -->
        <div class="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg overflow-x-auto">
          <button
            @click="setStatusFilter('')"
            class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap"
            :class="statusFilter === '' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
          >
            Semua
          </button>
          <button
            @click="setStatusFilter('paid')"
            class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap"
            :class="statusFilter === 'paid' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:text-green-700'"
          >
            <span class="w-2 h-2 rounded-full bg-green-500" />
            Paid
          </button>
          <button
            @click="setStatusFilter('unpaid')"
            class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap"
            :class="statusFilter === 'unpaid' ? 'bg-white text-yellow-700 shadow-sm' : 'text-gray-600 hover:text-yellow-700'"
          >
            <span class="w-2 h-2 rounded-full bg-yellow-500" />
            Unpaid
          </button>
          <button
            @click="setStatusFilter('expired')"
            class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap"
            :class="statusFilter === 'expired' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
          >
            <span class="w-2 h-2 rounded-full bg-gray-400" />
            Expired
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-visible">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 w-4">
                <input type="checkbox" v-model="selectAll" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
              </th>
              <th class="px-4 py-3 cursor-pointer hover:bg-gray-100" @click="toggleSort('invoice_number')">
                Invoice <span v-if="sortBy === 'invoice_number'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-4 py-3">Klien</th>
              <th class="px-4 py-3">Paket</th>
              <th class="px-4 py-3 cursor-pointer hover:bg-gray-100" @click="toggleSort('total_amount')">
                Total <span v-if="sortBy === 'total_amount'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-4 py-3 text-center">Status</th>
              <th class="px-4 py-3 cursor-pointer hover:bg-gray-100" @click="toggleSort('created_at')">
                Tanggal <span v-if="sortBy === 'created_at'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-4 py-3 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="8" class="py-12 text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </td>
            </tr>
            <tr v-else-if="!orders || orders.length === 0">
              <td colspan="8" class="py-12 text-center text-gray-500">
                Tidak ada data pesanan ditemukan.
              </td>
            </tr>
            <template v-else>
              <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3">
                  <input type="checkbox" :value="order.id" v-model="selectedOrders" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                </td>
                <td class="px-4 py-3 font-mono font-medium text-gray-900">
                  <span class="px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-xs border border-gray-200">
                    {{ order.invoice_number || `#INV-${order.id.slice(0, 8).toUpperCase()}` }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="font-medium text-gray-900">{{ getClientName(order) }}</div>
                  <div class="text-xs text-gray-500">{{ getClientEmail(order) }}</div>
                  <div v-if="order.client?.whatsapp || order.client_whatsapp" class="text-xs text-emerald-600 font-mono mt-0.5">
                    {{ order.client?.whatsapp || order.client_whatsapp }}
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-col gap-1 items-start">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {{ getPackageName(order) }}
                    </span>
                    <span
                      v-if="hasQrFeature(order)"
                      class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                      </svg>
                      QR Check-in
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3 font-semibold text-gray-900">
                  Rp {{ (order.total_amount ?? 0).toLocaleString('id-ID') }}
                </td>
                <td class="px-4 py-3 text-center">
                  <!-- Badge Status -->
                  <span
                    v-if="isPaid(order.status)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200"
                  >
                    ✓ Paid
                  </span>
                  <span
                    v-else-if="isUnpaid(order.status)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200"
                  >
                    ⏳ Unpaid
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200"
                  >
                    ✕ Expired
                  </span>
                </td>
                <td class="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                  {{ order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' }}
                </td>
                <td class="px-4 py-3 text-center relative">
                  <button
                    @click.stop="activeDropdown = activeDropdown === order.id ? null : order.id"
                    class="p-1 rounded hover:bg-gray-200 text-gray-500"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  <div
                    v-show="activeDropdown === order.id"
                    class="absolute right-8 top-10 mt-1 w-52 bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden text-left"
                  >
                    <template v-if="viewMode === 'active'">
                      <!-- Action if Unpaid: Open payment URL -->
                      <button
                        v-if="isUnpaid(order.status) && order.payment_url"
                        class="flex items-center px-3 py-2 text-sm hover:bg-blue-50 text-blue-700 w-full text-left border-b border-gray-100"
                        @click.stop="openPaymentUrl(order); activeDropdown = null"
                      >
                        <svg class="w-4 h-4 mr-2 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Buka Link Pembayaran
                      </button>

                      <!-- Special actions for Paid status -->
                      <template v-if="isPaid(order.status)">
                        <button
                          class="flex items-center px-3 py-2 text-sm hover:bg-blue-50 text-blue-700 w-full text-left"
                          @click.stop="copyMagicLink(order); activeDropdown = null"
                        >
                          <svg class="w-4 h-4 mr-2 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                          </svg>
                          Salin Link Akses Klien
                        </button>
                        <button
                          v-if="hasQrFeature(order)"
                          class="flex items-center px-3 py-2 text-sm hover:bg-purple-50 text-purple-700 w-full text-left border-b border-gray-100"
                          @click.stop="copyScannerLink(order); activeDropdown = null"
                        >
                          <svg class="w-4 h-4 mr-2 flex-shrink-0 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                          </svg>
                          Salin Link Scanner (Hari H)
                        </button>
                      </template>

                      <!-- Delete Order -->
                      <button
                        class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600"
                        @click.stop="confirmDelete(order); activeDropdown = null"
                      >
                        <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Hapus ke Trash
                      </button>
                    </template>
                    <template v-else>
                      <button
                        v-if="isSuperAdmin"
                        class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-green-600"
                        @click.stop="confirmRestore(order); activeDropdown = null"
                      >
                        <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                        </svg>
                        Pulihkan
                      </button>
                      <button
                        v-if="isSuperAdmin"
                        class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600"
                        @click.stop="confirmForceDelete(order); activeDropdown = null"
                      >
                        <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Hapus Permanen
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="meta && meta.last_page > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <span class="text-sm text-gray-500">
          Menampilkan {{ (meta.page - 1) * meta.per_page + 1 }} sampai
          {{ Math.min(meta.page * meta.per_page, meta.total) }} dari {{ meta.total }} pesanan
        </span>
        <div class="flex gap-1">
          <button
            :disabled="meta.page <= 1"
            class="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
            @click="goToPage(meta.page - 1)"
          >
            Sebelumnya
          </button>
          <button
            v-for="p in visiblePages"
            :key="p"
            class="px-3 py-1 text-sm rounded border font-medium"
            :class="p === meta.page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50'"
            @click="goToPage(p)"
          >
            {{ p }}
          </button>
          <button
            :disabled="meta.page >= meta.last_page"
            class="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
            @click="goToPage(meta.page + 1)"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>

    <!-- Modals Confirmation State -->
    <UiConfirmModal
      v-if="showDeleteModal && orderToDelete"
      title="Hapus Pesanan"
      :message="`Apakah Anda yakin ingin memindahkan pesanan ${orderToDelete.invoice_number || orderToDelete.id} ke trash?`"
      confirm-text="Hapus"
      :danger="true"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />

    <UiConfirmModal
      v-if="showRestoreModal && orderToRestore"
      title="Pulihkan Pesanan"
      :message="`Apakah Anda yakin ingin memulihkan pesanan ${orderToRestore.invoice_number || orderToRestore.id} dari trash?`"
      confirm-text="Pulihkan"
      @confirm="handleRestore"
      @cancel="showRestoreModal = false"
    />

    <UiConfirmModal
      v-if="showForceDeleteModal && orderToForceDelete"
      title="Hapus Permanen Pesanan"
      :message="`Apakah Anda yakin ingin MENGHAPUS PERMANEN pesanan ${orderToForceDelete.invoice_number || orderToForceDelete.id}? Tindakan ini tidak dapat dibatalkan.`"
      confirm-text="Hapus Permanen"
      :danger="true"
      require-input="DELETE"
      @confirm="handleForceDelete"
      @cancel="showForceDeleteModal = false"
    />

    <UiConfirmModal
      v-if="showBulkDeleteModal"
      title="Hapus Pesanan Terpilih"
      :message="`Apakah Anda yakin ingin memindahkan ${selectedOrders.length} pesanan terpilih ke trash?`"
      confirm-text="Hapus Semua"
      :danger="true"
      @confirm="handleBulkDelete"
      @cancel="showBulkDeleteModal = false"
    />

    <UiConfirmModal
      v-if="showBulkRestoreModal"
      title="Pulihkan Pesanan Terpilih"
      :message="`Apakah Anda yakin ingin memulihkan ${selectedOrders.length} pesanan terpilih dari trash?`"
      confirm-text="Pulihkan Semua"
      @confirm="handleBulkRestore"
      @cancel="showBulkRestoreModal = false"
    />

    <UiConfirmModal
      v-if="showBulkForceDeleteModal"
      title="Hapus Permanen Pesanan Terpilih"
      :message="`Apakah Anda yakin ingin MENGHAPUS PERMANEN ${selectedOrders.length} pesanan terpilih?`"
      confirm-text="Hapus Permanen Semua"
      :danger="true"
      require-input="DELETE"
      @confirm="handleBulkForceDelete"
      @cancel="showBulkForceDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { Order, OrderStatus } from '~/types/order'
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Orders', meta: [{ name: 'robots', content: 'noindex' }] })

const toast = useToast()
const orderService = useOrderService()
const authStore = useAuthStore()

const isSuperAdmin = computed(() => authStore.user?.roles?.some(r => r.name.toLowerCase().includes('super')))
const canViewTrash = computed(() => isSuperAdmin.value)
const viewMode = ref<'active' | 'trash'>('active')
const activeDropdown = ref<string | null>(null)

const sortBy = ref('created_at')
const sortOrder = ref('desc')

function toggleSort(field: string) {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
  loadOrders()
}

const orders = ref<Order[]>([])
const meta = ref<any>(null)
const loading = ref(true)
const search = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
let searchTimeout: any

const selectedOrders = ref<string[]>([])
const selectAll = computed({
  get: () => {
    if (!orders.value || orders.value.length === 0) return false
    return selectedOrders.value.length === orders.value.length
  },
  set: (val) => {
    if (val && orders.value) {
      selectedOrders.value = orders.value.map(o => o.id)
    } else {
      selectedOrders.value = []
    }
  }
})

// Confirmation States
const orderToDelete = ref<Order | null>(null)
const orderToRestore = ref<Order | null>(null)
const orderToForceDelete = ref<Order | null>(null)
const showDeleteModal = ref(false)
const showRestoreModal = ref(false)
const showForceDeleteModal = ref(false)
const showBulkDeleteModal = ref(false)
const showBulkRestoreModal = ref(false)
const showBulkForceDeleteModal = ref(false)

function isPaid(status: string): boolean {
  return status?.toLowerCase() === 'paid'
}

function isUnpaid(status: string): boolean {
  return status?.toLowerCase() === 'unpaid' || status?.toLowerCase() === 'pending'
}

function getClientName(order: Order): string {
  return order.client?.name || order.client_name || '-'
}

function getClientEmail(order: Order): string {
  return order.client?.email || order.client_email || '-'
}

function getPackageName(order: Order): string {
  return order.package?.name || order.package_name || '-'
}

function hasQrFeature(order: Order): boolean {
  return Boolean(order.scanner_token || order.package?.features_config?.has_qr)
}

function setStatusFilter(status: string) {
  statusFilter.value = status
  currentPage.value = 1
  loadOrders()
}

function openPaymentUrl(order: Order) {
  if (order.payment_url && typeof window !== 'undefined') {
    window.open(order.payment_url, '_blank')
  } else {
    toast.error('Link pembayaran tidak tersedia.')
  }
}

// Special Actions: Copy Link Akses Klien & Copy Link Scanner (Hari H)
async function copyMagicLink(order: Order) {
  let link = ''
  if (order.form_token) {
    link = typeof window !== 'undefined' ? `${window.location.origin}/client/setup?token=${order.form_token}` : ''
  } else if (order.magic_link) {
    link = order.magic_link
  } else {
    link = typeof window !== 'undefined' ? `${window.location.origin}/client/setup?token=${order.id}` : ''
  }

  try {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(link)
      toast.success('Link Akses Klien berhasil disalin!')
    } else {
      toast.success(`Link Akses Klien: ${link}`)
    }
  } catch (err) {
    toast.error('Gagal menyalin Link Akses Klien ke clipboard.')
  }
}

async function copyScannerLink(order: Order) {
  let link = ''
  if (order.scanner_token) {
    link = typeof window !== 'undefined' ? `${window.location.origin}/checkin/scanner/${order.scanner_token}` : ''
  } else if (order.scanner_link) {
    link = order.scanner_link
  } else {
    link = typeof window !== 'undefined' ? `${window.location.origin}/checkin/${order.id}/scanner` : ''
  }

  try {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(link)
      toast.success('Link Scanner (Hari H) berhasil disalin!')
    } else {
      toast.success(`Link Scanner (Hari H): ${link}`)
    }
  } catch (err) {
    toast.error('Gagal menyalin Link Scanner (Hari H) ke clipboard.')
  }
}

async function loadOrders() {
  selectedOrders.value = []
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      per_page: 15,
      limit: 15,
      search: search.value || undefined,
      status: statusFilter.value || undefined,
      sort: sortBy.value,
      order: sortOrder.value
    }
    const response = viewMode.value === 'active'
      ? await orderService.getOrders(params)
      : await orderService.getTrashedOrders(params)
    
    orders.value = response?.data || (Array.isArray(response) ? response : [])
    meta.value = response?.meta || null
  } catch (e) {
    if (import.meta.client) {
      toast.error(handleApiError(e).message)
    }
  } finally {
    loading.value = false
  }
}

function toggleViewMode() {
  viewMode.value = viewMode.value === 'active' ? 'trash' : 'active'
  currentPage.value = 1
  loadOrders()
}

function confirmDelete(order: Order) {
  orderToDelete.value = order
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!orderToDelete.value) return
  try {
    await orderService.deleteOrder(orderToDelete.value.id)
    toast.success('Pesanan berhasil dipindahkan ke trash')
    showDeleteModal.value = false
    orderToDelete.value = null
    loadOrders()
  } catch (e) {
    toast.error(handleApiError(e).message)
  }
}

function confirmRestore(order: Order) {
  orderToRestore.value = order
  showRestoreModal.value = true
}

async function handleRestore() {
  if (!orderToRestore.value) return
  try {
    await orderService.restoreOrder(orderToRestore.value.id)
    toast.success('Pesanan berhasil dipulihkan')
    showRestoreModal.value = false
    orderToRestore.value = null
    loadOrders()
  } catch (e) {
    try {
      await orderService.bulkRestoreOrders([orderToRestore.value.id])
      toast.success('Pesanan berhasil dipulihkan')
      showRestoreModal.value = false
      orderToRestore.value = null
      loadOrders()
    } catch (bulkErr) {
      toast.error(handleApiError(e).message)
    }
  }
}

function confirmForceDelete(order: Order) {
  orderToForceDelete.value = order
  showForceDeleteModal.value = true
}

async function handleForceDelete() {
  if (!orderToForceDelete.value) return
  try {
    await orderService.forceDeleteOrder(orderToForceDelete.value.id)
    toast.success('Pesanan berhasil dihapus permanen')
    showForceDeleteModal.value = false
    orderToForceDelete.value = null
    loadOrders()
  } catch (e) {
    try {
      await orderService.bulkForceDeleteOrders([orderToForceDelete.value.id])
      toast.success('Pesanan berhasil dihapus permanen')
      showForceDeleteModal.value = false
      orderToForceDelete.value = null
      loadOrders()
    } catch (bulkErr) {
      toast.error(handleApiError(e).message)
    }
  }
}

async function handleBulkDelete() {
  try {
    await orderService.bulkDeleteOrders(selectedOrders.value)
    toast.success('Pesanan terpilih berhasil dipindahkan ke trash')
    showBulkDeleteModal.value = false
    loadOrders()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  }
}

async function handleBulkRestore() {
  try {
    await orderService.bulkRestoreOrders(selectedOrders.value)
    toast.success('Pesanan terpilih berhasil dipulihkan')
    showBulkRestoreModal.value = false
    loadOrders()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  }
}

async function handleBulkForceDelete() {
  try {
    await orderService.bulkForceDeleteOrders(selectedOrders.value)
    toast.success('Pesanan terpilih berhasil dihapus permanen')
    showBulkForceDeleteModal.value = false
    loadOrders()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  }
}

const visiblePages = computed(() => {
  if (!meta.value) return []
  const pages: number[] = []
  const currentPageVal = meta.value.page || meta.value.current_page || 1
  const lastPageVal = meta.value.last_page || 1
  const start = Math.max(1, currentPageVal - 2)
  const end = Math.min(lastPageVal, currentPageVal + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function goToPage(page: number) {
  currentPage.value = page
  loadOrders()
}

watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadOrders()
  }, 300)
})

watch(viewMode, () => {
  selectedOrders.value = []
})

if (import.meta.server) {
  try {
    await loadOrders()
  } catch (err) {
    console.error('SSR fetch error in orders/index.vue:', err)
  }
}

onMounted(() => {
  if (orders.value.length === 0) {
    loadOrders()
  }
})
</script>
