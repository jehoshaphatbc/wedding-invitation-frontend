<template>
  <div @click="activeDropdown = null">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Clients</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola data klien, riwayat pesanan terintegrasi, dan Link Akses Klien.</p>
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
          {{ viewMode === 'trash' ? 'Lihat Klien Aktif' : 'Trash' }}
        </button>
        <button
          v-if="viewMode === 'active'"
          @click="openCreateModal"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Klien
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow">
      <!-- Bulk Actions Bar -->
      <div v-if="selectedClients.length > 0" class="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center justify-between">
        <span class="text-sm text-blue-800 font-medium">{{ selectedClients.length }} klien terpilih</span>
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

      <!-- Search Bar -->
      <div class="p-4 border-b border-gray-200">
        <div class="relative w-full sm:w-80">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Cari nama, email, atau WhatsApp..."
            class="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 w-4">
                <input type="checkbox" v-model="selectAll" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
              </th>
              <th class="px-2 py-3 w-8 text-center">
                <span class="sr-only">Expand</span>
              </th>
              <th class="px-4 py-3 cursor-pointer hover:bg-gray-100" @click="toggleSort('name')">
                Nama <span v-if="sortBy === 'name'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-4 py-3 cursor-pointer hover:bg-gray-100" @click="toggleSort('email')">
                Email <span v-if="sortBy === 'email'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-4 py-3">WhatsApp</th>
              <th class="px-4 py-3">Total Transaksi</th>
              <th class="px-4 py-3 text-center">Order Terakhir</th>
              <th class="px-4 py-3 cursor-pointer hover:bg-gray-100" @click="toggleSort('created_at')">
                Bergabung <span v-if="sortBy === 'created_at'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-4 py-3 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="9" class="py-12 text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </td>
            </tr>
            <tr v-else-if="!clients || clients.length === 0">
              <td colspan="9" class="py-12 text-center text-gray-500">
                Tidak ada data klien ditemukan.
              </td>
            </tr>
            <template v-else>
              <template v-for="client in clients" :key="client.id">
                <!-- Main Client Row -->
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-4 py-3">
                    <input type="checkbox" :value="client.id" v-model="selectedClients" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  </td>
                  <td class="px-2 py-3 text-center">
                    <button
                      type="button"
                      @click="toggleExpand(client.id)"
                      class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-transform"
                      :title="isExpanded(client.id) ? 'Tutup riwayat pesanan' : 'Lihat riwayat pesanan'"
                    >
                      <svg
                        class="w-4 h-4 transform transition-transform duration-200"
                        :class="isExpanded(client.id) ? 'rotate-90 text-blue-600' : 'text-gray-400'"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </td>
                  <td class="px-4 py-3">
                    <div class="font-medium text-gray-900 flex items-center gap-2">
                      {{ client.name }}
                      <span
                        v-if="client.orders && client.orders.length > 0"
                        class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-600"
                      >
                        {{ client.orders.length }} Order
                      </span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-gray-600">
                    <a :href="`mailto:${client.email}`" class="hover:underline hover:text-blue-600">
                      {{ client.email }}
                    </a>
                  </td>
                  <td class="px-4 py-3 text-gray-600">
                    <template v-if="client.whatsapp || client.phone">
                      <a
                        :href="formatWaUrl(client.whatsapp || client.phone)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                      >
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.585 1.961.947 3.24.947 3.181 0 5.767-2.587 5.768-5.766.001-3.182-2.585-5.768-5.768-5.768zm0 10.366c-1.116 0-2.02-.345-2.85-.929l-.204-.144-1.579.414.422-1.54-.15-.238c-.627-.996-.957-1.87-.956-2.909.001-2.48 2.019-4.498 4.5-4.498 2.48 0 4.498 2.018 4.498 4.498 0 2.48-2.018 4.498-4.498 4.498z"/>
                        </svg>
                        {{ client.whatsapp || client.phone }}
                      </a>
                    </template>
                    <span v-else class="text-gray-400 italic">-</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="font-semibold text-gray-900">
                      Rp {{ getClientTotalSpent(client).toLocaleString('id-ID') }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ getClientOrdersCount(client) }} Transaksi
                    </div>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span
                      v-if="getClientLatestStatus(client) === 'paid'"
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200"
                    >
                      ✓ Paid
                    </span>
                    <span
                      v-else-if="getClientLatestStatus(client) === 'unpaid'"
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200"
                    >
                      ⏳ Unpaid
                    </span>
                    <span
                      v-else-if="getClientLatestStatus(client) === 'expired'"
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200"
                    >
                      ✕ Expired
                    </span>
                    <span v-else class="text-gray-400 text-xs italic">-</span>
                  </td>
                  <td class="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                    {{ client.created_at ? new Date(client.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' }}
                  </td>
                  <td class="px-4 py-3 text-center relative">
                    <button
                      @click.stop="activeDropdown = activeDropdown === client.id ? null : client.id"
                      class="p-1 rounded hover:bg-gray-200 text-gray-500"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>

                    <div
                      v-show="activeDropdown === client.id"
                      class="absolute right-8 top-10 mt-1 w-52 bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden text-left"
                    >
                      <template v-if="viewMode === 'active'">
                        <button
                          class="flex items-center px-3 py-2 text-sm hover:bg-blue-50 text-blue-700 w-full text-left"
                          @click.stop="copyClientAccessLink(client); activeDropdown = null"
                        >
                          <svg class="w-4 h-4 mr-2 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                          </svg>
                          Salin Link Akses Klien
                        </button>
                        <button
                          class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-gray-700"
                          @click.stop="openEditModal(client); activeDropdown = null"
                        >
                          <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                          Edit Klien
                        </button>
                        <button
                          class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600"
                          @click.stop="confirmDelete(client); activeDropdown = null"
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
                          @click.stop="confirmRestore(client); activeDropdown = null"
                        >
                          <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                          </svg>
                          Pulihkan
                        </button>
                        <button
                          v-if="isSuperAdmin"
                          class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600"
                          @click.stop="confirmForceDelete(client); activeDropdown = null"
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

                <!-- Expandable Row: Riwayat Pesanan Client -->
                <tr v-if="isExpanded(client.id)" class="bg-gray-50/80 border-b border-gray-200">
                  <td colspan="9" class="p-4 pl-12">
                    <div class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                      <div class="flex items-center justify-between mb-3 border-b border-gray-100 pb-2.5">
                        <div class="flex items-center gap-2">
                          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <span class="text-xs font-bold text-gray-800 uppercase tracking-wider">
                            Riwayat Pesanan Milik {{ client.name }} ({{ client.orders?.length || 0 }})
                          </span>
                        </div>
                      </div>

                      <div v-if="client.orders && client.orders.length > 0" class="overflow-x-auto">
                        <table class="w-full text-xs text-left">
                          <thead class="text-[11px] text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th class="px-3 py-2">Invoice</th>
                              <th class="px-3 py-2">Paket & Fitur</th>
                              <th class="px-3 py-2">Total Biaya</th>
                              <th class="px-3 py-2 text-center">Status</th>
                              <th class="px-3 py-2 text-center">Tautan Cepat</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-gray-100">
                            <tr v-for="order in client.orders" :key="order.id" class="hover:bg-blue-50/40">
                              <td class="px-3 py-2.5 font-mono font-medium text-gray-900">
                                {{ order.invoice_number || `#INV-${order.id.slice(0, 8).toUpperCase()}` }}
                              </td>
                              <td class="px-3 py-2.5">
                                <div class="font-medium text-gray-800">
                                  {{ order.package?.name || order.package_name || 'Paket Undangan' }}
                                </div>
                                <div class="flex items-center gap-1.5 mt-1">
                                  <span
                                    v-if="order.scanner_token || order.package?.features_config?.has_qr"
                                    class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200"
                                  >
                                    QR Check-in Aktif
                                  </span>
                                  <span
                                    v-if="order.package?.features_config?.has_gallery"
                                    class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  >
                                    Galeri Foto
                                  </span>
                                </div>
                              </td>
                              <td class="px-3 py-2.5 font-semibold text-gray-900">
                                Rp {{ (order.total_amount ?? 0).toLocaleString('id-ID') }}
                              </td>
                              <td class="px-3 py-2.5 text-center">
                                <span
                                  v-if="order.status === 'paid'"
                                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-800 border border-green-200"
                                >
                                  Paid
                                </span>
                                <span
                                  v-else-if="order.status === 'unpaid'"
                                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200"
                                >
                                  Unpaid
                                </span>
                                <span
                                  v-else
                                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200"
                                >
                                  Expired
                                </span>
                              </td>
                              <td class="px-3 py-2.5 text-center">
                                <div class="flex items-center justify-center gap-2">
                                  <!-- Buka Pembayaran if unpaid -->
                                  <button
                                    v-if="order.status === 'unpaid' && order.payment_url"
                                    type="button"
                                    @click="openOrderPayment(order)"
                                    class="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 flex items-center gap-1"
                                  >
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                    </svg>
                                    Bayar
                                  </button>

                                  <!-- Salin Form Token Link if paid -->
                                  <template v-if="order.status === 'paid'">
                                    <button
                                      type="button"
                                      @click="copyOrderFormLink(order)"
                                      class="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 flex items-center gap-1"
                                      title="Salin Link Form Klien"
                                    >
                                      <svg class="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                                      </svg>
                                      Salin Link Akses Klien
                                    </button>

                                    <!-- Salin Scanner Link if QR enabled -->
                                    <button
                                      v-if="order.scanner_token || order.package?.features_config?.has_qr"
                                      type="button"
                                      @click="copyOrderScannerLink(order)"
                                      class="px-2.5 py-1 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 flex items-center gap-1"
                                      title="Salin Link Scanner (Hari H)"
                                    >
                                      <svg class="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                                      </svg>
                                      Salin Link Scanner (Hari H)
                                    </button>
                                  </template>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div v-else class="text-xs text-gray-500 py-3 italic text-center">
                        Belum ada riwayat transaksi pesanan untuk klien ini.
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="meta && meta.last_page > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <span class="text-sm text-gray-500">
          Menampilkan {{ (meta.page - 1) * meta.per_page + 1 }} sampai
          {{ Math.min(meta.page * meta.per_page, meta.total) }} dari {{ meta.total }} klien
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

    <!-- Modal Form Create / Edit Client -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
          <h3 class="text-lg font-semibold text-gray-900">{{ editingId ? 'Edit Klien' : 'Tambah Klien Baru' }}</h3>
          <button
            type="button"
            @click="showModal = false"
            class="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveClient" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap / Pasangan <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Contoh: Dimas & Anisa"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.email"
              type="email"
              required
              placeholder="klien@example.com"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nomor WhatsApp <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">🇮🇩 +62</span>
              <input
                v-model="form.whatsapp"
                type="tel"
                required
                placeholder="81234567890"
                class="w-full rounded-lg border border-gray-300 pl-16 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <div v-if="saving" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              <span>{{ saving ? 'Menyimpan...' : 'Simpan' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modals Confirmation State -->
    <UiConfirmModal
      v-if="showDeleteModal && clientToDelete"
      title="Hapus Klien"
      :message="`Apakah Anda yakin ingin memindahkan klien '${clientToDelete.name}' ke trash?`"
      confirm-text="Hapus"
      :danger="true"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />

    <UiConfirmModal
      v-if="showRestoreModal && clientToRestore"
      title="Pulihkan Klien"
      :message="`Apakah Anda yakin ingin memulihkan klien '${clientToRestore.name}' dari trash?`"
      confirm-text="Pulihkan"
      @confirm="handleRestore"
      @cancel="showRestoreModal = false"
    />

    <UiConfirmModal
      v-if="showForceDeleteModal && clientToForceDelete"
      title="Hapus Permanen Klien"
      :message="`Apakah Anda yakin ingin MENGHAPUS PERMANEN klien '${clientToForceDelete.name}'? Tindakan ini tidak dapat dibatalkan.`"
      confirm-text="Hapus Permanen"
      :danger="true"
      require-input="DELETE"
      @confirm="handleForceDelete"
      @cancel="showForceDeleteModal = false"
    />

    <UiConfirmModal
      v-if="showBulkDeleteModal"
      title="Hapus Klien Terpilih"
      :message="`Apakah Anda yakin ingin memindahkan ${selectedClients.length} klien terpilih ke trash?`"
      confirm-text="Hapus Semua"
      :danger="true"
      @confirm="handleBulkDelete"
      @cancel="showBulkDeleteModal = false"
    />

    <UiConfirmModal
      v-if="showBulkRestoreModal"
      title="Pulihkan Klien Terpilih"
      :message="`Apakah Anda yakin ingin memulihkan ${selectedClients.length} klien terpilih dari trash?`"
      confirm-text="Pulihkan Semua"
      @confirm="handleBulkRestore"
      @cancel="showBulkRestoreModal = false"
    />

    <UiConfirmModal
      v-if="showBulkForceDeleteModal"
      title="Hapus Permanen Klien Terpilih"
      :message="`Apakah Anda yakin ingin MENGHAPUS PERMANEN ${selectedClients.length} klien terpilih?`"
      confirm-text="Hapus Permanen Semua"
      :danger="true"
      require-input="DELETE"
      @confirm="handleBulkForceDelete"
      @cancel="showBulkForceDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { Client, ClientFormData } from '~/types/client'
import type { Order } from '~/types/order'
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Clients', meta: [{ name: 'robots', content: 'noindex' }] })

const toast = useToast()
const clientService = useClientService()
const authStore = useAuthStore()

const isSuperAdmin = computed(() => authStore.user?.roles?.some(r => r.name.toLowerCase().includes('super')))
const canViewTrash = computed(() => isSuperAdmin.value)
const viewMode = ref<'active' | 'trash'>('active')
const activeDropdown = ref<string | null>(null)

// Expandable rows state
const expandedRowIds = ref<Set<string>>(new Set())

function isExpanded(id: string): boolean {
  return expandedRowIds.value.has(id)
}

function toggleExpand(id: string) {
  if (expandedRowIds.value.has(id)) {
    expandedRowIds.value.delete(id)
  } else {
    expandedRowIds.value.add(id)
  }
}

const sortBy = ref('created_at')
const sortOrder = ref('desc')

function toggleSort(field: string) {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
  loadClients()
}

const clients = ref<Client[]>([])
const meta = ref<any>(null)
const loading = ref(true)
const search = ref('')
const currentPage = ref(1)
let searchTimeout: any

const selectedClients = ref<string[]>([])
const selectAll = computed({
  get: () => {
    if (!clients.value || clients.value.length === 0) return false
    return selectedClients.value.length === clients.value.length
  },
  set: (val) => {
    if (val && clients.value) {
      selectedClients.value = clients.value.map(c => c.id)
    } else {
      selectedClients.value = []
    }
  }
})

// Modal & Form State
const showModal = ref(false)
const saving = ref(false)
const editingId = ref<string | null>(null)
const form = ref<ClientFormData>({
  name: '',
  email: '',
  whatsapp: ''
})

// Modals Confirmation State
const clientToDelete = ref<Client | null>(null)
const clientToRestore = ref<Client | null>(null)
const clientToForceDelete = ref<Client | null>(null)
const showDeleteModal = ref(false)
const showRestoreModal = ref(false)
const showForceDeleteModal = ref(false)
const showBulkDeleteModal = ref(false)
const showBulkRestoreModal = ref(false)
const showBulkForceDeleteModal = ref(false)

function formatWaUrl(wa?: string | null): string {
  if (!wa) return '#'
  let digits = wa.replace(/\D/g, '')
  if (digits.startsWith('0')) {
    digits = '62' + digits.slice(1)
  }
  return `https://wa.me/${digits}`
}

function getClientOrdersCount(client: Client): number {
  return client.orders?.length ?? client.orders_count ?? 0
}

function getClientTotalSpent(client: Client): number {
  if (!client.orders || client.orders.length === 0) return 0
  return client.orders.reduce((sum, ord) => sum + (ord.total_amount || 0), 0)
}

function getClientLatestStatus(client: Client): string | null {
  if (!client.orders || client.orders.length === 0) return null
  return client.orders[0]?.status || null
}

function openOrderPayment(order: Order) {
  if (order.payment_url && typeof window !== 'undefined') {
    window.open(order.payment_url, '_blank')
  } else {
    toast.error('Link pembayaran tidak tersedia.')
  }
}

async function copyOrderFormLink(order: Order) {
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

async function copyOrderScannerLink(order: Order) {
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

async function copyClientAccessLink(client: Client) {
  const paidOrder = client.orders?.find(o => o.status === 'paid' && o.form_token)
  let link = ''
  if (paidOrder?.form_token) {
    link = typeof window !== 'undefined' ? `${window.location.origin}/client/setup?token=${paidOrder.form_token}` : ''
  } else if (client.magic_link) {
    link = client.magic_link
  } else {
    link = typeof window !== 'undefined' ? `${window.location.origin}/client/setup?token=${client.id}` : ''
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

async function loadClients() {
  selectedClients.value = []
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      per_page: 15,
      limit: 15,
      search: search.value || undefined,
      sort: sortBy.value,
      order: sortOrder.value
    }
    const response = viewMode.value === 'active'
      ? await clientService.getClients(params)
      : await clientService.getTrashedClients(params)
    
    clients.value = response?.data || (Array.isArray(response) ? response : [])
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
  loadClients()
}

function openCreateModal() {
  editingId.value = null
  form.value = {
    name: '',
    email: '',
    whatsapp: ''
  }
  showModal.value = true
}

function openEditModal(client: Client) {
  editingId.value = client.id
  form.value = {
    name: client.name,
    email: client.email,
    whatsapp: client.whatsapp || client.phone || ''
  }
  showModal.value = true
}

async function saveClient() {
  saving.value = true
  try {
    let cleanWa = form.value.whatsapp.trim().replace(/\D/g, '')
    if (cleanWa.startsWith('0')) {
      cleanWa = '62' + cleanWa.slice(1)
    } else if (!cleanWa.startsWith('62')) {
      cleanWa = '62' + cleanWa
    }

    const payload = {
      name: form.value.name.trim(),
      email: form.value.email.trim(),
      whatsapp: cleanWa
    }

    if (editingId.value) {
      await clientService.updateClient(editingId.value, payload)
      toast.success('Data klien berhasil diperbarui')
    } else {
      await clientService.createClient(payload)
      toast.success('Klien baru berhasil ditambahkan')
    }
    showModal.value = false
    await loadClients()
  } catch (e) {
    toast.error(handleApiError(e).message)
  } finally {
    saving.value = false
  }
}

function confirmDelete(client: Client) {
  clientToDelete.value = client
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!clientToDelete.value) return
  try {
    await clientService.deleteClient(clientToDelete.value.id)
    toast.success('Klien berhasil dipindahkan ke trash')
    showDeleteModal.value = false
    clientToDelete.value = null
    loadClients()
  } catch (e) {
    toast.error(handleApiError(e).message)
  }
}

function confirmRestore(client: Client) {
  clientToRestore.value = client
  showRestoreModal.value = true
}

async function handleRestore() {
  if (!clientToRestore.value) return
  try {
    await clientService.restoreClient(clientToRestore.value.id)
    toast.success('Klien berhasil dipulihkan')
    showRestoreModal.value = false
    clientToRestore.value = null
    loadClients()
  } catch (e) {
    try {
      await clientService.bulkRestoreClients([clientToRestore.value.id])
      toast.success('Klien berhasil dipulihkan')
      showRestoreModal.value = false
      clientToRestore.value = null
      loadClients()
    } catch (bulkErr) {
      toast.error(handleApiError(e).message)
    }
  }
}

function confirmForceDelete(client: Client) {
  clientToForceDelete.value = client
  showForceDeleteModal.value = true
}

async function handleForceDelete() {
  if (!clientToForceDelete.value) return
  try {
    await clientService.forceDeleteClient(clientToForceDelete.value.id)
    toast.success('Klien berhasil dihapus permanen')
    showForceDeleteModal.value = false
    clientToForceDelete.value = null
    loadClients()
  } catch (e) {
    try {
      await clientService.bulkForceDeleteClients([clientToForceDelete.value.id])
      toast.success('Klien berhasil dihapus permanen')
      showForceDeleteModal.value = false
      clientToForceDelete.value = null
      loadClients()
    } catch (bulkErr) {
      toast.error(handleApiError(e).message)
    }
  }
}

async function handleBulkDelete() {
  try {
    await clientService.bulkDeleteClients(selectedClients.value)
    toast.success('Klien terpilih berhasil dipindahkan ke trash')
    showBulkDeleteModal.value = false
    loadClients()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  }
}

async function handleBulkRestore() {
  try {
    await clientService.bulkRestoreClients(selectedClients.value)
    toast.success('Klien terpilih berhasil dipulihkan')
    showBulkRestoreModal.value = false
    loadClients()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  }
}

async function handleBulkForceDelete() {
  try {
    await clientService.bulkForceDeleteClients(selectedClients.value)
    toast.success('Klien terpilih berhasil dihapus permanen')
    showBulkForceDeleteModal.value = false
    loadClients()
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
  loadClients()
}

watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadClients()
  }, 300)
})

watch(viewMode, () => {
  selectedClients.value = []
})

if (import.meta.server) {
  try {
    await loadClients()
  } catch (err) {
    console.error('SSR fetch error in clients/index.vue:', err)
  }
}

onMounted(() => {
  if (clients.value.length === 0) {
    loadClients()
  }
})
</script>
