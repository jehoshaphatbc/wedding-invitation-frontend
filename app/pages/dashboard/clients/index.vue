<template>
  <div @click="activeDropdown = null; activeSubDropdown = null">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Clients</h1>
        <p class="text-sm text-gray-500 mt-1">Manage client profiles, integrated order histories, and client access links.</p>
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
          {{ viewMode === 'trash' ? 'View Active Clients' : 'Trash' }}
        </button>
        <button
          v-if="viewMode === 'active'"
          @click="openCreateModal"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Client
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow">
      <!-- Bulk Actions Bar -->
      <div v-if="selectedClients.length > 0" class="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center justify-between">
        <span class="text-sm text-blue-800 font-medium">{{ selectedClients.length }} clients selected</span>
        <div class="flex gap-2">
          <template v-if="viewMode === 'active'">
            <button
              @click="showBulkDeleteModal = true"
              class="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded hover:bg-red-50"
            >
              Delete Selected
            </button>
          </template>
          <template v-else>
            <button
              v-if="isSuperAdmin"
              @click="showBulkRestoreModal = true"
              class="px-3 py-1.5 text-sm font-medium text-green-600 bg-white border border-green-200 rounded hover:bg-green-50"
            >
              Restore Selected
            </button>
            <button
              v-if="isSuperAdmin"
              @click="showBulkForceDeleteModal = true"
              class="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded hover:bg-red-50"
            >
              Permanently Delete Selected
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
            placeholder="Search by name, email, or WhatsApp..."
            class="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
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
              <th class="px-2 py-3 w-8 text-center">
                <span class="sr-only">Expand</span>
              </th>
              <th class="px-4 py-3 cursor-pointer hover:bg-gray-100" @click="toggleSort('name')">
                Name <span v-if="sortBy === 'name'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-4 py-3 cursor-pointer hover:bg-gray-100" @click="toggleSort('email')">
                Email <span v-if="sortBy === 'email'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-4 py-3">WhatsApp</th>
              <th class="px-4 py-3">Total Spent</th>
              <th class="px-4 py-3 text-center">Setup Status</th>
              <th class="px-4 py-3 cursor-pointer hover:bg-gray-100" @click="toggleSort('created_at')">
                Joined Date <span v-if="sortBy === 'created_at'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-4 py-3 text-center w-24">Actions</th>
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
                No client records found.
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
                      :title="isExpanded(client.id) ? 'Collapse order history' : 'View order history'"
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
                        {{ client.orders.length }} orders
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
                      {{ getClientOrdersCount(client) }} Orders
                    </div>
                  </td>
                  <td class="px-4 py-3 text-center whitespace-nowrap">
                    <button
                      v-if="getClientSetupStatus(client).status === 'filled'"
                      type="button"
                      @click.stop="openSetupViewForClient(client)"
                      class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 transition-all shadow-2xs cursor-pointer active:scale-95"
                      :title="getClientSetupStatus(client).tooltip"
                    >
                      <span class="font-bold">✓</span>
                      <span>{{ getClientSetupStatus(client).label }}</span>
                    </button>

                    <button
                      v-else-if="getClientSetupStatus(client).status === 'pending'"
                      type="button"
                      @click.stop="openSetupViewForClient(client)"
                      class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 transition-all shadow-2xs cursor-pointer active:scale-95"
                      :title="getClientSetupStatus(client).tooltip"
                    >
                      <span>📝</span>
                      <span>{{ getClientSetupStatus(client).label }}</span>
                    </button>

                    <span
                      v-else-if="getClientSetupStatus(client).status === 'unpaid'"
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"
                      :title="getClientSetupStatus(client).tooltip"
                    >
                      <span>⏳</span>
                      <span>Unpaid</span>
                    </span>

                    <span
                      v-else-if="getClientSetupStatus(client).status === 'expired'"
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"
                      :title="getClientSetupStatus(client).tooltip"
                    >
                      ✕ Expired
                    </span>

                    <span v-else class="text-gray-400 text-xs italic">-</span>
                  </td>
                  <td class="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                    {{ client.created_at ? new Date(client.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' }}
                  </td>
                  <td class="px-4 py-3 text-center relative">
                    <button
                      type="button"
                      @click.stop="activeDropdown = activeDropdown === client.id ? null : client.id; activeSubDropdown = null"
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
                        <!-- View Setup Data -->
                        <button
                          type="button"
                          class="flex items-center px-3 py-2 text-sm hover:bg-purple-50 text-purple-700 w-full text-left font-medium border-b border-gray-100"
                          @click.stop="openSetupViewForClient(client); activeDropdown = null"
                        >
                          <svg class="w-4 h-4 mr-2 flex-shrink-0 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Setup Data
                        </button>
                        <button
                          type="button"
                          class="flex items-center px-3 py-2 text-sm hover:bg-blue-50 text-blue-700 w-full text-left"
                          @click.stop="openClientAccessLink(client); activeDropdown = null"
                        >
                          <svg class="w-4 h-4 mr-2 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Open Client Access Link
                        </button>
                        <button
                          type="button"
                          class="flex items-center px-3 py-2 text-sm hover:bg-blue-50 text-blue-700 w-full text-left border-b border-gray-100"
                          @click.stop="copyClientAccessLink(client); activeDropdown = null"
                        >
                          <svg class="w-4 h-4 mr-2 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                          </svg>
                          Copy Client Access Link
                        </button>
                        <button
                          type="button"
                          class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-gray-700"
                          @click.stop="openEditModal(client); activeDropdown = null"
                        >
                          <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                          Edit Client
                        </button>
                        <button
                          type="button"
                          class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600"
                          @click.stop="confirmDelete(client); activeDropdown = null"
                        >
                          <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                          Move to Trash
                        </button>
                      </template>
                      <template v-else>
                        <button
                          v-if="isSuperAdmin"
                          type="button"
                          class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-green-600"
                          @click.stop="confirmRestore(client); activeDropdown = null"
                        >
                          <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                          </svg>
                          Restore
                        </button>
                        <button
                          v-if="isSuperAdmin"
                          type="button"
                          class="flex items-center px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600"
                          @click.stop="confirmForceDelete(client); activeDropdown = null"
                        >
                          <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                          Permanently Delete
                        </button>
                      </template>
                    </div>
                  </td>
                </tr>

                <!-- Expandable Row: Order History for Client -->
                <tr v-if="isExpanded(client.id)" class="bg-gray-50/80 border-b border-gray-200">
                  <td colspan="9" class="p-4 pl-12">
                    <div class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                      <div class="flex items-center justify-between mb-3 border-b border-gray-100 pb-2.5">
                        <div class="flex items-center gap-2">
                          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <span class="text-xs font-bold text-gray-800 uppercase tracking-wider">
                            Order History for {{ client.name }} ({{ client.orders?.length || 0 }})
                          </span>
                        </div>
                      </div>

                      <div v-if="client.orders && client.orders.length > 0" class="overflow-visible">
                        <table class="w-full text-xs text-left">
                          <thead class="text-[11px] text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th class="px-3 py-2">Invoice</th>
                              <th class="px-3 py-2">Package & Features</th>
                              <th class="px-3 py-2">Total Amount</th>
                              <th class="px-3 py-2 text-center">Status</th>
                              <th class="px-3 py-2 text-center w-24">Actions</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-gray-100">
                            <tr v-for="order in client.orders" :key="order.id" class="hover:bg-blue-50/40">
                              <td class="px-3 py-2.5 font-mono font-medium text-gray-900">
                                {{ order.invoice_number || `#INV-${order.id.slice(0, 8).toUpperCase()}` }}
                              </td>
                              <td class="px-3 py-2.5">
                                <div class="font-medium text-gray-800">
                                  {{ order.package?.name || order.package_name || 'Invitation Package' }}
                                </div>
                                <div class="flex items-center gap-1.5 mt-1">
                                  <span
                                    v-if="order.scanner_token || order.package?.features_config?.has_qr"
                                    class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200"
                                  >
                                    QR Check-in Active
                                  </span>
                                  <span
                                    v-if="order.package?.features_config?.has_gallery"
                                    class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  >
                                    Photo Gallery
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
                              <td class="px-3 py-2.5 text-center relative">
                                <button
                                  type="button"
                                  @click.stop="activeSubDropdown = activeSubDropdown === order.id ? null : order.id; activeDropdown = null"
                                  class="p-1 rounded hover:bg-gray-200 text-gray-500"
                                >
                                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                  </svg>
                                </button>

                                <div
                                  v-show="activeSubDropdown === order.id"
                                  class="absolute right-4 top-8 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden text-left"
                                >
                                  <!-- View Setup Data -->
                                  <button
                                    type="button"
                                    class="flex items-center px-3 py-2 text-xs hover:bg-purple-50 text-purple-700 w-full text-left font-medium border-b border-gray-100"
                                    @click.stop="openSetupViewForOrder(order, client); activeSubDropdown = null"
                                  >
                                    <svg class="w-3.5 h-3.5 mr-2 flex-shrink-0 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    View Setup Data
                                  </button>

                                  <!-- If Paid: Open & Copy Client Setup Link -->
                                  <template v-if="order.status === 'paid'">
                                    <button
                                      type="button"
                                      class="flex items-center px-3 py-2 text-xs hover:bg-blue-50 text-blue-700 w-full text-left"
                                      @click.stop="openOrderFormLink(order); activeSubDropdown = null"
                                    >
                                      <svg class="w-3.5 h-3.5 mr-2 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                      Open Client Link
                                    </button>
                                    <button
                                      type="button"
                                      class="flex items-center px-3 py-2 text-xs hover:bg-blue-50 text-blue-700 w-full text-left"
                                      :class="!order.scanner_token && !order.package?.features_config?.has_qr ? '' : 'border-b border-gray-100'"
                                      @click.stop="copyOrderFormLink(order); activeSubDropdown = null"
                                    >
                                      <svg class="w-3.5 h-3.5 mr-2 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                                      </svg>
                                      Copy Client Link
                                    </button>

                                    <!-- If QR feature: Open & Copy Scanner Link -->
                                    <template v-if="order.scanner_token || order.package?.features_config?.has_qr">
                                      <button
                                        type="button"
                                        class="flex items-center px-3 py-2 text-xs hover:bg-purple-50 text-purple-700 w-full text-left"
                                        @click.stop="openOrderScannerLink(order); activeSubDropdown = null"
                                      >
                                        <svg class="w-3.5 h-3.5 mr-2 flex-shrink-0 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Open Scanner Link
                                      </button>
                                      <button
                                        type="button"
                                        class="flex items-center px-3 py-2 text-xs hover:bg-purple-50 text-purple-700 w-full text-left"
                                        @click.stop="copyOrderScannerLink(order); activeSubDropdown = null"
                                      >
                                        <svg class="w-3.5 h-3.5 mr-2 flex-shrink-0 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                                        </svg>
                                        Copy Scanner Link
                                      </button>
                                    </template>
                                  </template>

                                  <!-- If Unpaid: Open & Copy Payment Link -->
                                  <template v-else-if="order.status === 'unpaid' && order.payment_url">
                                    <button
                                      type="button"
                                      class="flex items-center px-3 py-2 text-xs hover:bg-yellow-50 text-yellow-800 w-full text-left"
                                      @click.stop="openOrderPayment(order); activeSubDropdown = null"
                                    >
                                      <svg class="w-3.5 h-3.5 mr-2 flex-shrink-0 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                      Pay
                                    </button>
                                    <button
                                      type="button"
                                      class="flex items-center px-3 py-2 text-xs hover:bg-yellow-50 text-yellow-800 w-full text-left"
                                      @click.stop="copyPaymentUrl(order); activeSubDropdown = null"
                                    >
                                      <svg class="w-3.5 h-3.5 mr-2 flex-shrink-0 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                                      </svg>
                                      Copy Payment Link
                                    </button>
                                  </template>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div v-else class="text-xs text-gray-500 py-3 italic text-center">
                        No order transaction history found for this client.
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
          Showing {{ (meta.page - 1) * meta.per_page + 1 }} to
          {{ Math.min(meta.page * meta.per_page, meta.total) }} of {{ meta.total }} clients
        </span>
        <div class="flex gap-1">
          <button
            :disabled="meta.page <= 1"
            class="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
            @click="goToPage(meta.page - 1)"
          >
            Previous
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
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form Create / Edit Client -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
          <h3 class="text-lg font-semibold text-gray-900">{{ editingId ? 'Edit Client' : 'Add New Client' }}</h3>
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
              Full Name / Couple Name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="e.g. Dimas & Anisa"
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
              placeholder="client@example.com"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp Number <span class="text-red-500">*</span>
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
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <div v-if="saving" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              <span>{{ saving ? 'Saving...' : 'Save' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modals Confirmation State -->
    <UiConfirmModal
      v-if="showDeleteModal && clientToDelete"
      title="Delete Client"
      :message="`Are you sure you want to move client '${clientToDelete.name}' to trash?`"
      confirm-text="Delete"
      :danger="true"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />

    <UiConfirmModal
      v-if="showRestoreModal && clientToRestore"
      title="Restore Client"
      :message="`Are you sure you want to restore client '${clientToRestore.name}' from trash?`"
      confirm-text="Restore"
      @confirm="handleRestore"
      @cancel="showRestoreModal = false"
    />

    <UiConfirmModal
      v-if="showForceDeleteModal && clientToForceDelete"
      title="Permanently Delete Client"
      :message="`Are you sure you want to PERMANENTLY DELETE client '${clientToForceDelete.name}'? This action cannot be undone.`"
      confirm-text="Permanently Delete"
      :danger="true"
      require-input="DELETE"
      @confirm="handleForceDelete"
      @cancel="showForceDeleteModal = false"
    />

    <UiConfirmModal
      v-if="showBulkDeleteModal"
      title="Delete Selected Clients"
      :message="`Are you sure you want to move ${selectedClients.length} selected clients to trash?`"
      confirm-text="Delete All"
      :danger="true"
      @confirm="handleBulkDelete"
      @cancel="showBulkDeleteModal = false"
    />

    <UiConfirmModal
      v-if="showBulkRestoreModal"
      title="Restore Selected Clients"
      :message="`Are you sure you want to restore ${selectedClients.length} selected clients from trash?`"
      confirm-text="Restore All"
      @confirm="handleBulkRestore"
      @cancel="showBulkRestoreModal = false"
    />

    <UiConfirmModal
      v-if="showBulkForceDeleteModal"
      title="Permanently Delete Selected Clients"
      :message="`Are you sure you want to PERMANENTLY DELETE ${selectedClients.length} selected clients? This action cannot be undone.`"
      confirm-text="Permanently Delete All"
      :danger="true"
      require-input="DELETE"
      @confirm="handleBulkForceDelete"
      @cancel="showBulkForceDeleteModal = false"
    />

    <!-- Client Setup View Modal -->
    <DashboardClientSetupViewModal
      :show="showSetupViewModal"
      :order="selectedOrderForView"
      :client="selectedClientForView"
      @loaded="handleSetupDataLoaded"
      @close="showSetupViewModal = false"
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
const activeSubDropdown = ref<string | null>(null)

// Client Setup View Modal State
const showSetupViewModal = ref(false)
const selectedOrderForView = ref<Order | null>(null)
const selectedClientForView = ref<Client | null>(null)

function openSetupViewForOrder(order: Order, client?: Client | null) {
  selectedOrderForView.value = order
  selectedClientForView.value = client || null
  showSetupViewModal.value = true
}

function openSetupViewForClient(client: Client) {
  selectedClientForView.value = client
  const targetOrder = client.orders?.find(o => o.status === 'paid' && o.form_token) || client.orders?.[0] || null
  selectedOrderForView.value = targetOrder
  showSetupViewModal.value = true
}

function handleSetupDataLoaded(invitation: any) {
  if (selectedOrderForView.value) {
    selectedOrderForView.value.invitation = invitation
  }
  if (selectedClientForView.value && selectedClientForView.value.orders) {
    const target = selectedClientForView.value.orders.find(o => o.id === selectedOrderForView.value?.id)
    if (target) {
      target.invitation = invitation
    }
  }
}

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

interface ClientSetupStatusInfo {
  status: 'filled' | 'pending' | 'unpaid' | 'expired' | 'no_order'
  label: string
  class: string
  icon: string
  tooltip: string
}

function checkOrderInvitationFilled(order?: Order | null, client?: Client | null): boolean {
  if (!order) return false

  // 1. Direct invitation object from backend relation or client
  const anyOrder = order as any
  const inv = anyOrder.invitation || (client as any)?.invitation
  if (inv) {
    if (inv.title && inv.title !== 'Draft Undangan' && inv.title !== '') return true
    if (inv.groom && (inv.groom.full_name || inv.groom.nickname)) return true
    if (inv.bride && (inv.bride.full_name || inv.bride.nickname)) return true
    if (inv.status === 'published' || inv.status === 'completed' || inv.status === 'submitted') return true
    if (inv.id && (inv.event || inv.theme)) return true
  }

  // 2. Specific flags from order
  if (anyOrder.has_invitation || anyOrder.is_setup_completed || anyOrder.invitation_status === 'completed' || anyOrder.invitation_status === 'submitted') {
    return true
  }

  // 3. Local storage check for local drafts / offline test
  if (typeof window !== 'undefined' && window.localStorage) {
    const token = order.form_token || anyOrder.id
    if (token) {
      try {
        const raw = localStorage.getItem(`client_invitation_draft_${token}`)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed && (parsed.groom?.full_name || parsed.bride?.full_name || parsed.title)) {
            return true
          }
        }
      } catch {}
    }
  }

  return false
}

function getClientSetupStatus(client: Client): ClientSetupStatusInfo {
  if (!client.orders || client.orders.length === 0) {
    return {
      status: 'no_order',
      label: 'No Order',
      class: 'bg-gray-100 text-gray-500 border-gray-200',
      icon: '-',
      tooltip: 'Client has no registered orders yet'
    }
  }

  // Find paid order (or fallback to latest order)
  const paidOrder = client.orders.find(o => o.status === 'paid')
  const latestOrder = client.orders[0]
  const targetOrder = paidOrder || latestOrder

  if (!paidOrder && targetOrder.status === 'unpaid') {
    return {
      status: 'unpaid',
      label: 'Unpaid',
      class: 'bg-gray-100 text-gray-600 border-gray-200',
      icon: '⏳',
      tooltip: 'Order invoice is unpaid. Setup form will be activated after payment.'
    }
  }

  if (!paidOrder && targetOrder.status === 'expired') {
    return {
      status: 'expired',
      label: 'Expired',
      class: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: '✕',
      tooltip: 'Order invoice has expired.'
    }
  }

  // If order is paid, check if setup form data has been filled
  const hasFilledInvitation = checkOrderInvitationFilled(targetOrder, client)

  if (hasFilledInvitation) {
    return {
      status: 'filled',
      label: 'Data Terisi',
      class: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-300',
      icon: '✓',
      tooltip: 'Invitation setup data has been filled. Click to view setup details.'
    }
  }

  return {
    status: 'pending',
    label: 'Belum Terisi',
    class: 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-300',
    icon: '📝',
    tooltip: 'Client has paid, but invitation form is not filled yet. Click to view setup details or copy link.'
  }
}

function openOrderPayment(order: Order) {
  if (order.payment_url && typeof window !== 'undefined') {
    window.open(order.payment_url, '_blank')
  } else {
    toast.error('Payment link is not available.')
  }
}

async function copyPaymentUrl(order: Order) {
  if (!order.payment_url) {
    toast.error('Payment link is not available.')
    return
  }
  try {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(order.payment_url)
      toast.success('Payment link copied to clipboard!')
    } else {
      toast.info(`Payment URL: ${order.payment_url}`)
    }
  } catch {
    toast.error('Failed to copy payment link.')
  }
}

function getOrderFormUrl(order: Order): string {
  if (order.form_token) {
    return typeof window !== 'undefined' ? `${window.location.origin}/client/setup?token=${order.form_token}` : ''
  } else if (order.magic_link) {
    return order.magic_link
  }
  return typeof window !== 'undefined' ? `${window.location.origin}/client/setup?token=${order.id}` : ''
}

function openOrderFormLink(order: Order) {
  const link = getOrderFormUrl(order)
  if (link && typeof window !== 'undefined') {
    window.open(link, '_blank')
  } else {
    toast.error('Client access link is not available yet.')
  }
}

async function copyOrderFormLink(order: Order) {
  const link = getOrderFormUrl(order)

  try {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(link)
      toast.success('Client access link copied to clipboard!')
    } else {
      toast.success(`Client Access Link: ${link}`)
    }
  } catch (err) {
    toast.error('Failed to copy client access link.')
  }
}

function getOrderScannerUrl(order: Order): string {
  if (order.scanner_token) {
    return typeof window !== 'undefined' ? `${window.location.origin}/checkin/scanner/${order.scanner_token}` : ''
  } else if (order.scanner_link) {
    return order.scanner_link
  }
  return typeof window !== 'undefined' ? `${window.location.origin}/checkin/${order.id}/scanner` : ''
}

function openOrderScannerLink(order: Order) {
  const link = getOrderScannerUrl(order)
  if (link && typeof window !== 'undefined') {
    window.open(link, '_blank')
  } else {
    toast.error('Scanner link is not available yet.')
  }
}

async function copyOrderScannerLink(order: Order) {
  const link = getOrderScannerUrl(order)

  try {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(link)
      toast.success('Scanner link copied to clipboard!')
    } else {
      toast.success(`Scanner Link: ${link}`)
    }
  } catch (err) {
    toast.error('Failed to copy scanner link.')
  }
}

function getClientAccessUrl(client: Client): string {
  const paidOrder = client.orders?.find(o => o.status === 'paid' && o.form_token) || client.orders?.find(o => o.form_token)
  if (paidOrder?.form_token) {
    return typeof window !== 'undefined' ? `${window.location.origin}/client/setup?token=${paidOrder.form_token}` : ''
  } else if (client.magic_link) {
    return client.magic_link
  }
  return typeof window !== 'undefined' ? `${window.location.origin}/client/setup?token=${client.id}` : ''
}

function openClientAccessLink(client: Client) {
  const link = getClientAccessUrl(client)
  if (link && typeof window !== 'undefined') {
    window.open(link, '_blank')
  } else {
    toast.error('Client access link is not available yet.')
  }
}

async function copyClientAccessLink(client: Client) {
  const link = getClientAccessUrl(client)

  try {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(link)
      toast.success('Client access link copied to clipboard!')
    } else {
      toast.success(`Client Access Link: ${link}`)
    }
  } catch (err) {
    toast.error('Failed to copy client access link.')
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
      toast.success('Client updated successfully')
    } else {
      await clientService.createClient(payload)
      toast.success('New client added successfully')
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
    toast.success('Client moved to trash')
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
    toast.success('Client restored successfully')
    showRestoreModal.value = false
    clientToRestore.value = null
    loadClients()
  } catch (e) {
    try {
      await clientService.bulkRestoreClients([clientToRestore.value.id])
      toast.success('Client restored successfully')
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
    toast.success('Client permanently deleted')
    showForceDeleteModal.value = false
    clientToForceDelete.value = null
    loadClients()
  } catch (e) {
    try {
      await clientService.bulkForceDeleteClients([clientToForceDelete.value.id])
      toast.success('Client permanently deleted')
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
    toast.success('Selected clients moved to trash')
    showBulkDeleteModal.value = false
    loadClients()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  }
}

async function handleBulkRestore() {
  try {
    await clientService.bulkRestoreClients(selectedClients.value)
    toast.success('Selected clients restored successfully')
    showBulkRestoreModal.value = false
    loadClients()
  } catch (e: any) {
    toast.error(handleApiError(e).message)
  }
}

async function handleBulkForceDelete() {
  try {
    await clientService.bulkForceDeleteClients(selectedClients.value)
    toast.success('Selected clients permanently deleted')
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
