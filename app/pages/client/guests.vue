<template>
  <div class="min-h-screen bg-slate-50 pb-20">
    <!-- Top Portal Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            H
          </div>
          <div>
            <h1 class="text-base font-bold text-gray-900 leading-tight">{{ t('portal_title') }}</h1>
            <p class="text-xs text-gray-500">{{ t('portal_subtitle') }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div v-if="verifyData?.package" class="hidden md:flex items-center gap-2">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {{ verifyData.package.name }}
            </span>
          </div>

          <!-- Language Switcher Toggle -->
          <div class="inline-flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200">
            <button
              type="button"
              @click="lang = 'id'"
              class="px-2.5 py-1 text-xs font-semibold rounded-lg transition-all"
              :class="lang === 'id' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'"
            >
              🇮🇩 ID
            </button>
            <button
              type="button"
              @click="lang = 'en'"
              class="px-2.5 py-1 text-xs font-semibold rounded-lg transition-all"
              :class="lang === 'en' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'"
            >
              🇬🇧 EN
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs (Setup vs Guests) -->
      <div class="border-t border-gray-100 bg-white">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 flex gap-6">
          <NuxtLink
            :to="`/client/setup?token=${encodeURIComponent(rawToken)}`"
            class="py-3 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
          >
            <span>📝</span>
            <span>{{ t('nav_setup') }}</span>
          </NuxtLink>
          <div
            class="py-3 text-xs sm:text-sm font-bold border-b-2 border-blue-600 text-blue-600 flex items-center gap-1.5 cursor-default"
          >
            <span>👥</span>
            <span>{{ t('nav_guests') }}</span>
            <span v-if="totalGuests > 0" class="ml-1 px-2 py-0.5 text-[11px] rounded-full bg-blue-100 text-blue-700 font-bold">
              {{ totalGuests }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <!-- Loading State -->
      <div v-if="checkingToken" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center my-8">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
        <h2 class="text-base font-semibold text-gray-900">{{ t('verifying_title') }}</h2>
        <p class="text-xs text-gray-500 mt-1">{{ t('verifying_desc') }}</p>
      </div>

      <!-- Invalid Token / Error State -->
      <div v-else-if="authError" class="bg-white rounded-2xl shadow-sm border border-red-100 p-8 sm:p-12 text-center my-8 max-w-lg mx-auto">
        <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">{{ t('invalid_token_title') }}</h2>
        <p class="text-sm text-gray-600 mb-6">
          {{ authErrorMessage || t('invalid_token_default') }}
        </p>
        <NuxtLink
          to="/"
          class="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
        >
          {{ t('back_to_home') }}
        </NuxtLink>
      </div>

      <!-- Authorized Content -->
      <div v-else class="space-y-6">
        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white mb-2 backdrop-blur-xs">
              <span>👥</span> {{ t('guest_management_badge') }}
            </div>
            <h2 class="text-xl sm:text-2xl font-bold">
              {{ t('header_title') }}
            </h2>
            <p class="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
              {{ t('header_subtitle') }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              @click="openBulkModal"
              class="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <span>{{ t('btn_bulk_add') }}</span>
            </button>
            <button
              type="button"
              @click="openSingleCreateModal"
              class="px-4 py-2.5 bg-blue-500/50 hover:bg-blue-500/70 border border-white/30 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>+</span>
              <span>{{ t('btn_single_add') }}</span>
            </button>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <!-- Total Guests -->
          <div class="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ t('stat_total_guests') }}</span>
              <span class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                👥
              </span>
            </div>
            <div class="mt-3 flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-extrabold text-gray-900">{{ totalGuests }}</span>
              <span class="text-xs text-gray-500">{{ t('label_people') }}</span>
            </div>
          </div>

          <!-- Total Hadir -->
          <div class="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-2xs">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-emerald-700 uppercase tracking-wider">{{ t('stat_attending') }}</span>
              <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                ✓
              </span>
            </div>
            <div class="mt-3 flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-extrabold text-emerald-600">{{ totalHadir }}</span>
              <span class="text-xs text-gray-500">{{ t('label_people') }} ({{ hadirPercentage }}%)</span>
            </div>
          </div>

          <!-- Total Tidak Hadir -->
          <div class="bg-white rounded-2xl p-4 sm:p-5 border border-red-100 shadow-2xs">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-red-700 uppercase tracking-wider">{{ t('stat_not_attending') }}</span>
              <span class="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
                ✕
              </span>
            </div>
            <div class="mt-3 flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-extrabold text-red-600">{{ totalTidakHadir }}</span>
              <span class="text-xs text-gray-500">{{ t('label_people') }}</span>
            </div>
          </div>

          <!-- Total Pending -->
          <div class="bg-white rounded-2xl p-4 sm:p-5 border border-amber-100 shadow-2xs">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-amber-700 uppercase tracking-wider">{{ t('stat_pending') }}</span>
              <span class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                ⏳
              </span>
            </div>
            <div class="mt-3 flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-extrabold text-amber-600">{{ totalPending }}</span>
              <span class="text-xs text-gray-500">{{ t('label_people') }}</span>
            </div>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          <div class="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              v-for="flt in filterTabs"
              :key="flt.value"
              type="button"
              @click="statusFilter = flt.value"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border"
              :class="statusFilter === flt.value
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
            >
              {{ flt.label }} ({{ flt.count }})
            </button>
          </div>

          <div class="flex items-center gap-2">
            <div class="relative flex-1 md:w-64">
              <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="t('search_placeholder')"
                class="w-full rounded-xl border border-gray-300 pl-9 pr-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              @click="loadGuests"
              :disabled="loadingList"
              class="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              :title="t('btn_refresh')"
            >
              <svg class="w-4 h-4" :class="{ 'animate-spin': loadingList }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Guests Table / Card List -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div v-if="loadingList" class="p-12 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3" />
            <p class="text-xs text-gray-500">{{ t('loading_guests') }}</p>
          </div>

          <div v-else-if="filteredGuests.length === 0" class="p-12 text-center">
            <div class="w-14 h-14 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
              📭
            </div>
            <h3 class="text-sm font-bold text-gray-800">{{ t('empty_guests_title') }}</h3>
            <p class="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {{ searchQuery ? t('empty_guests_search') : t('empty_guests_desc') }}
            </p>
            <div v-if="!searchQuery" class="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                @click="openBulkModal"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                {{ t('btn_bulk_add') }}
              </button>
            </div>
          </div>

          <!-- Table View (Desktop & Tablet) -->
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead class="bg-gray-50/75 border-b border-gray-200 text-gray-600 uppercase text-[11px] font-bold">
                <tr>
                  <th class="px-4 py-3 w-10 text-center">#</th>
                  <th class="px-4 py-3">{{ t('col_name') }}</th>
                  <th class="px-4 py-3">{{ t('col_phone') }}</th>
                  <th class="px-4 py-3 text-center">{{ t('col_pax') }}</th>
                  <th class="px-4 py-3">{{ t('col_rsvp') }}</th>
                  <th class="px-4 py-3">{{ t('col_checkin') }}</th>
                  <th class="px-4 py-3 text-right">{{ t('col_actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="(guest, idx) in filteredGuests"
                  :key="guest.id"
                  class="hover:bg-blue-50/30 transition-colors"
                >
                  <td class="px-4 py-3.5 text-center text-gray-400 text-xs font-mono">
                    {{ idx + 1 }}
                  </td>
                  <td class="px-4 py-3.5">
                    <div class="font-bold text-gray-900 flex items-center gap-2">
                      <span>{{ guest.name }}</span>
                    </div>
                    <div v-if="guest.qr_token" class="text-[10px] text-gray-400 font-mono mt-0.5">
                      QR: {{ guest.qr_token }}
                    </div>
                  </td>
                  <td class="px-4 py-3.5">
                    <div v-if="guest.phone" class="flex items-center gap-1.5 font-mono text-xs text-gray-700">
                      <span>{{ guest.phone }}</span>
                    </div>
                    <span v-else class="text-gray-400 text-xs italic">-</span>
                  </td>
                  <td class="px-4 py-3.5 text-center">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                      {{ guest.pax || 1 }} {{ t('label_pax') }}
                    </span>
                  </td>
                  <td class="px-4 py-3.5">
                    <span
                      class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border"
                      :class="getRsvpBadgeClass(guest.rsvp_status)"
                    >
                      <span>{{ getRsvpEmoji(guest.rsvp_status) }}</span>
                      <span>{{ getRsvpLabel(guest.rsvp_status) }}</span>
                    </span>
                  </td>
                  <td class="px-4 py-3.5">
                    <span
                      v-if="guest.actual_attendance"
                      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                    >
                      <span>✓</span>
                      <span>{{ t('status_checked_in') }}</span>
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500 border border-gray-200"
                    >
                      {{ t('status_not_checked_in') }}
                    </span>
                  </td>
                  <td class="px-4 py-3.5 text-right whitespace-nowrap">
                    <div class="inline-flex items-center gap-1 justify-end">
                      <!-- Share WhatsApp button -->
                      <button
                        type="button"
                        @click="openShareModal(guest)"
                        class="p-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                        :title="t('btn_share_wa')"
                      >
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.203c.043.072.043.419-.101.824z"/>
                        </svg>
                      </button>

                      <!-- Copy Invitation Link button -->
                      <button
                        type="button"
                        @click="copyGuestLink(guest)"
                        class="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                        :title="t('btn_copy_link')"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>

                      <!-- Edit Button -->
                      <button
                        type="button"
                        @click="openEditModal(guest)"
                        class="p-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        :title="t('btn_edit')"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <!-- Delete Button -->
                      <button
                        type="button"
                        @click="confirmDelete(guest)"
                        class="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        :title="t('btn_delete')"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- MODAL 1: Tambah Tamu Massal (Bulk Insert) -->
    <div v-if="showBulkModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
          <div class="flex items-center gap-2">
            <span class="text-xl">📑</span>
            <h3 class="text-base font-bold text-gray-900">{{ t('bulk_modal_title') }}</h3>
          </div>
          <button
            type="button"
            @click="showBulkModal = false"
            class="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="handleBulkAdd" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">
              {{ t('bulk_names_label') }} <span class="text-red-500">*</span>
            </label>
            <p class="text-xs text-gray-500 mb-2">
              {{ t('bulk_names_hint') }}
            </p>
            <textarea
              v-model="bulkNamesInput"
              rows="8"
              required
              :placeholder="t('bulk_names_ph')"
              class="w-full rounded-xl border border-gray-300 p-3 text-xs sm:text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div class="flex items-center justify-between p-3 rounded-xl bg-blue-50 text-blue-800 text-xs">
            <span>{{ t('bulk_detected_count') }}:</span>
            <span class="font-bold">{{ parsedBulkNames.length }} {{ t('label_people') }}</span>
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              @click="showBulkModal = false"
              class="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
            >
              {{ t('btn_cancel') }}
            </button>
            <button
              type="submit"
              :disabled="submittingBulk || parsedBulkNames.length === 0"
              class="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl flex items-center gap-2"
            >
              <div v-if="submittingBulk" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
              <span>{{ submittingBulk ? t('btn_saving') : t('btn_save_bulk') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 2: Single Create / Edit Guest -->
    <div v-if="showSingleModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
          <h3 class="text-base font-bold text-gray-900">
            {{ editingGuestId ? t('edit_guest_title') : t('create_guest_title') }}
          </h3>
          <button
            type="button"
            @click="showSingleModal = false"
            class="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="handleSaveSingleGuest" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">
              {{ t('col_name') }} <span class="text-red-500">*</span>
            </label>
            <input
              v-model="singleForm.name"
              type="text"
              required
              :placeholder="t('guest_name_ph')"
              class="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">
              {{ t('col_phone') }} (WhatsApp)
            </label>
            <input
              v-model="singleForm.phone"
              type="tel"
              placeholder="081234567890"
              class="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">
                {{ t('col_pax') }}
              </label>
              <input
                v-model.number="singleForm.pax"
                type="number"
                min="1"
                max="20"
                class="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">
                {{ t('col_rsvp') }}
              </label>
              <select
                v-model="singleForm.rsvp_status"
                class="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs sm:text-sm bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="pending">{{ t('rsvp_opt_pending') }}</option>
                <option value="hadir">{{ t('rsvp_opt_hadir') }}</option>
                <option value="tidak_hadir">{{ t('rsvp_opt_tidak_hadir') }}</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t border-gray-200 mt-4">
            <button
              type="button"
              @click="showSingleModal = false"
              class="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
            >
              {{ t('btn_cancel') }}
            </button>
            <button
              type="submit"
              :disabled="submittingSingle"
              class="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl flex items-center gap-2"
            >
              <div v-if="submittingSingle" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
              <span>{{ submittingSingle ? t('btn_saving') : t('btn_save') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 3: WhatsApp Share & Personal Link -->
    <div v-if="showShareModal && shareGuest" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
        <div class="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
          <div class="flex items-center gap-2">
            <span class="text-xl">💌</span>
            <h3 class="text-base font-bold text-gray-900">{{ t('share_modal_title') }}</h3>
          </div>
          <button
            type="button"
            @click="showShareModal = false"
            class="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">{{ t('guest_name_label') }}</label>
            <div class="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-900">
              {{ shareGuest.name }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">{{ t('personal_link_label') }}</label>
            <div class="flex items-center gap-2">
              <input
                :value="getGuestInvitationUrl(shareGuest)"
                readonly
                class="flex-1 rounded-xl border border-gray-300 p-2 text-xs font-mono bg-gray-50 text-gray-700 select-all"
              />
              <button
                type="button"
                @click="copyGuestLink(shareGuest)"
                class="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl text-xs whitespace-nowrap transition-colors"
              >
                {{ t('btn_copy_url') }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">{{ t('wa_msg_label') }}</label>
            <textarea
              :value="getShareMessage(shareGuest)"
              readonly
              rows="5"
              class="w-full rounded-xl border border-gray-300 p-3 text-xs font-sans bg-gray-50 text-gray-800"
            />
          </div>

          <div class="flex items-center justify-between gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              @click="copyShareMessage(shareGuest)"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
            >
              {{ t('btn_copy_message') }}
            </button>
            <button
              type="button"
              @click="openWhatsAppDirect(shareGuest)"
              class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>📲</span>
              <span>{{ t('btn_open_whatsapp') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL 4: Confirm Delete -->
    <UiConfirmModal
      v-if="showDeleteModal && guestToDelete"
      :title="t('confirm_delete_title')"
      :message="t('confirm_delete_msg', { name: guestToDelete.name })"
      :confirm-text="t('btn_delete')"
      :danger="true"
      @confirm="handleDeleteGuest"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { ClientGuest } from '~/types/client-guest'
import { useClientGuestService } from '~/services/client-guest.service'
import { useClientSetupService, type ClientAuthVerifyData } from '~/services/client-setup.service'
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Manajemen Tamu Undangan | Harsava',
  meta: [{ name: 'robots', content: 'noindex,nofollow' }]
})

const route = useRoute()
const toast = useToast()
const guestService = useClientGuestService()
const setupService = useClientSetupService()

// Language switcher state (EN & ID)
const langCookie = useCookie<'en' | 'id'>('client_setup_lang', { default: () => 'id', maxAge: 60 * 60 * 24 * 30 })
const lang = ref<'en' | 'id'>(langCookie.value || 'id')
watch(lang, (newLang) => {
  langCookie.value = newLang
})

const translations: Record<'id' | 'en', Record<string, string>> = {
  id: {
    portal_title: 'Portal Tamu Undangan',
    portal_subtitle: 'Harsava Wedding Invitation Portal',
    nav_setup: 'Setup Undangan',
    nav_guests: 'Buku Tamu & RSVP',
    verifying_title: 'Memverifikasi Akses Klien...',
    verifying_desc: 'Mohon tunggu selagi kami memvalidasi token akses Anda.',
    invalid_token_title: 'Link Akses Tidak Valid',
    invalid_token_default: 'Token akses tidak ditemukan atau link sudah kedaluwarsa. Silakan periksa kembali link yang Anda terima melalui WhatsApp atau email.',
    back_to_home: 'Kembali ke Beranda',
    guest_management_badge: 'Manajemen Tamu & RSVP',
    header_title: 'Daftar Tamu & Konfirmasi Kehadiran',
    header_subtitle: 'Kelola daftar tamu undangan Anda, pantau respon RSVP secara real-time, dan bagikan tautan undangan personal via WhatsApp.',
    btn_bulk_add: 'Tambah Tamu Massal',
    btn_single_add: 'Tambah 1 Tamu',
    btn_refresh: 'Segarkan data tamu',
    stat_total_guests: 'Total Tamu',
    stat_attending: 'Konfirmasi Hadir',
    stat_not_attending: 'Tidak Hadir',
    stat_pending: 'Menunggu Konfirmasi',
    label_people: 'Orang',
    label_pax: 'Pax',
    filter_all: 'Semua Tamu',
    filter_hadir: 'Hadir',
    filter_tidak_hadir: 'Tidak Hadir',
    filter_pending: 'Menunggu',
    search_placeholder: 'Cari nama atau telepon tamu...',
    loading_guests: 'Memuat data tamu...',
    empty_guests_title: 'Belum Ada Tamu Terdaftar',
    empty_guests_desc: 'Mulai tambahkan daftar tamu undangan Anda sekarang secara massal atau satu per satu.',
    empty_guests_search: 'Tidak ada tamu yang cocok dengan kata kunci pencarian.',
    col_name: 'Nama Tamu',
    col_phone: 'Nomor WhatsApp',
    col_pax: 'Jumlah Pax',
    col_rsvp: 'Status RSVP',
    col_checkin: 'Kehadiran Fisik',
    col_actions: 'Aksi',
    status_checked_in: 'Sudah Check-in',
    status_not_checked_in: 'Belum Check-in',
    btn_share_wa: 'Kirim via WhatsApp',
    btn_copy_link: 'Salin Tautan Personal',
    btn_edit: 'Edit Tamu',
    btn_delete: 'Hapus Tamu',
    bulk_modal_title: 'Tambah Tamu Massal (Bulk Insert)',
    bulk_names_label: 'Daftar Nama Tamu',
    bulk_names_hint: 'Ketik atau tempel (paste) daftar nama tamu. Masukkan satu nama di setiap baris.',
    bulk_names_ph: 'Contoh:\nBudi Santoso & Pasangan\nKeluarga Anton Pratama\nSiti Rahmawati, S.Kom\nNanik & Rekan',
    bulk_detected_count: 'Jumlah Nama Terdeteksi',
    btn_cancel: 'Batal',
    btn_save_bulk: 'Simpan Semua Tamu',
    btn_save: 'Simpan',
    btn_saving: 'Menyimpan...',
    create_guest_title: 'Tambah Tamu Baru',
    edit_guest_title: 'Edit Data Tamu',
    guest_name_ph: 'Contoh: Yosa Pratama',
    rsvp_opt_pending: 'Menunggu Respon (Pending)',
    rsvp_opt_hadir: 'Konfirmasi Hadir (Attending)',
    rsvp_opt_tidak_hadir: 'Tidak Hadir (Not Attending)',
    share_modal_title: 'Bagikan Undangan Personal',
    guest_name_label: 'Tamu Undangan',
    personal_link_label: 'Tautan Undangan Khusus',
    btn_copy_url: 'Salin Link',
    wa_msg_label: 'Pratinjau Pesan WhatsApp',
    btn_copy_message: 'Salin Pesan',
    btn_open_whatsapp: 'Buka WhatsApp',
    confirm_delete_title: 'Hapus Tamu',
    confirm_delete_msg: 'Apakah Anda yakin ingin menghapus tamu \'{name}\' dari daftar undangan?',
    toast_link_copied: 'Tautan undangan personal berhasil disalin!',
    toast_msg_copied: 'Teks pesan undangan berhasil disalin!',
    toast_bulk_success: '{count} tamu berhasil ditambahkan!',
    toast_save_success: 'Data tamu berhasil disimpan!',
    toast_delete_success: 'Data tamu berhasil dihapus!'
  },
  en: {
    portal_title: 'Guest Portal & RSVP',
    portal_subtitle: 'Harsava Wedding Invitation Portal',
    nav_setup: 'Invitation Setup',
    nav_guests: 'Guest List & RSVP',
    verifying_title: 'Verifying Client Access...',
    verifying_desc: 'Please wait while we validate your access token.',
    invalid_token_title: 'Invalid Access Link',
    invalid_token_default: 'Access token not found or link has expired. Please check the official link you received via WhatsApp or email.',
    back_to_home: 'Back to Home',
    guest_management_badge: 'Guest Management & RSVP',
    header_title: 'Guest List & Attendance Responses',
    header_subtitle: 'Manage your guest entries, track real-time RSVP responses, and share personalized invitation links via WhatsApp.',
    btn_bulk_add: 'Bulk Add Guests',
    btn_single_add: 'Add Guest',
    btn_refresh: 'Refresh guest list',
    stat_total_guests: 'Total Guests',
    stat_attending: 'Attending',
    stat_not_attending: 'Not Attending',
    stat_pending: 'Pending RSVP',
    label_people: 'Guests',
    label_pax: 'Pax',
    filter_all: 'All Guests',
    filter_hadir: 'Attending',
    filter_tidak_hadir: 'Not Attending',
    filter_pending: 'Pending',
    search_placeholder: 'Search guest name or phone...',
    loading_guests: 'Loading guest list...',
    empty_guests_title: 'No Guests Registered Yet',
    empty_guests_desc: 'Start adding your wedding guests in bulk or one by one right now.',
    empty_guests_search: 'No guests match your search criteria.',
    col_name: 'Guest Name',
    col_phone: 'WhatsApp / Phone',
    col_pax: 'Pax',
    col_rsvp: 'RSVP Status',
    col_checkin: 'Event Check-in',
    col_actions: 'Actions',
    status_checked_in: 'Checked In',
    status_not_checked_in: 'Not Checked In',
    btn_share_wa: 'Share via WhatsApp',
    btn_copy_link: 'Copy Personal Link',
    btn_edit: 'Edit Guest',
    btn_delete: 'Delete Guest',
    bulk_modal_title: 'Bulk Add Guests',
    bulk_names_label: 'Guest Names List',
    bulk_names_hint: 'Type or paste guest names. Enter one name per line.',
    bulk_names_ph: 'Example:\nJohn Smith & Partner\nRobert Family\nEmily Watson\nMichael & Colleagues',
    bulk_detected_count: 'Detected Names Count',
    btn_cancel: 'Cancel',
    btn_save_bulk: 'Save All Guests',
    btn_save: 'Save',
    btn_saving: 'Saving...',
    create_guest_title: 'Add New Guest',
    edit_guest_title: 'Edit Guest Details',
    guest_name_ph: 'e.g. Johnathan Smith',
    rsvp_opt_pending: 'Pending Response',
    rsvp_opt_hadir: 'Attending',
    rsvp_opt_tidak_hadir: 'Not Attending',
    share_modal_title: 'Share Personalized Invitation',
    guest_name_label: 'Guest Name',
    personal_link_label: 'Personal Invitation Link',
    btn_copy_url: 'Copy URL',
    wa_msg_label: 'WhatsApp Message Preview',
    btn_copy_message: 'Copy Message',
    btn_open_whatsapp: 'Open WhatsApp',
    confirm_delete_title: 'Delete Guest',
    confirm_delete_msg: 'Are you sure you want to delete guest \'{name}\' from the guest list?',
    toast_link_copied: 'Personal invitation link copied to clipboard!',
    toast_msg_copied: 'Invitation message text copied to clipboard!',
    toast_bulk_success: '{count} guests added successfully!',
    toast_save_success: 'Guest details saved successfully!',
    toast_delete_success: 'Guest removed successfully!'
  }
}

function t(key: string, params?: Record<string, string | number>): string {
  let val = translations[lang.value]?.[key] || translations['id']?.[key] || key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      val = val.replace(`{${k}}`, String(v))
    }
  }
  return val
}

// Token Handling
const tokenCookie = useCookie<string>('client_setup_token', { maxAge: 60 * 60 * 24 * 7 })
const rawToken = computed(() => String(route.query.token || route.query.auth || tokenCookie.value || ''))

const checkingToken = ref(true)
const authError = ref(false)
const authErrorMessage = ref('')
const verifyData = ref<ClientAuthVerifyData | null>(null)

// Guest List State
const guests = ref<ClientGuest[]>([])
const loadingList = ref(false)
const searchQuery = ref('')
const statusFilter = ref<string>('all')

// Metrics
const totalGuests = computed(() => guests.value.length)
const totalHadir = computed(() => guests.value.filter(g => g.rsvp_status === 'hadir').length)
const totalTidakHadir = computed(() => guests.value.filter(g => g.rsvp_status === 'tidak_hadir').length)
const totalPending = computed(() => guests.value.filter(g => g.rsvp_status === 'pending' || !g.rsvp_status).length)
const hadirPercentage = computed(() => {
  if (totalGuests.value === 0) return 0
  return Math.round((totalHadir.value / totalGuests.value) * 100)
})

// Filter Tabs
const filterTabs = computed(() => [
  { value: 'all', label: t('filter_all'), count: totalGuests.value },
  { value: 'hadir', label: t('filter_hadir'), count: totalHadir.value },
  { value: 'tidak_hadir', label: t('filter_tidak_hadir'), count: totalTidakHadir.value },
  { value: 'pending', label: t('filter_pending'), count: totalPending.value }
])

// Filtered Guests
const filteredGuests = computed(() => {
  let list = [...guests.value]
  if (statusFilter.value !== 'all') {
    if (statusFilter.value === 'pending') {
      list = list.filter(g => g.rsvp_status === 'pending' || !g.rsvp_status)
    } else {
      list = list.filter(g => g.rsvp_status === statusFilter.value)
    }
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(g => {
      const nameMatch = g.name?.toLowerCase().includes(q)
      const phoneMatch = g.phone?.toLowerCase().includes(q)
      const qrMatch = g.qr_token?.toLowerCase().includes(q)
      return nameMatch || phoneMatch || qrMatch
    })
  }

  return list
})

// Modal states
const showBulkModal = ref(false)
const bulkNamesInput = ref('')
const submittingBulk = ref(false)

const showSingleModal = ref(false)
const editingGuestId = ref<string | null>(null)
const submittingSingle = ref(false)
const singleForm = ref({
  name: '',
  phone: '',
  pax: 1,
  rsvp_status: 'pending'
})

const showShareModal = ref(false)
const shareGuest = ref<ClientGuest | null>(null)

const showDeleteModal = ref(false)
const guestToDelete = ref<ClientGuest | null>(null)

// Parse bulk names
const parsedBulkNames = computed(() => {
  if (!bulkNamesInput.value.trim()) return []
  return bulkNamesInput.value
    .split('\n')
    .map(n => n.trim())
    .filter(n => n.length > 0)
})

// RSVP Helper Functions
function getRsvpBadgeClass(status?: string) {
  if (status === 'hadir') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (status === 'tidak_hadir') return 'bg-red-50 text-red-700 border-red-200'
  return 'bg-amber-50 text-amber-700 border-amber-200'
}

function getRsvpEmoji(status?: string) {
  if (status === 'hadir') return '✓'
  if (status === 'tidak_hadir') return '✕'
  return '⏳'
}

function getRsvpLabel(status?: string) {
  if (status === 'hadir') return t('filter_hadir')
  if (status === 'tidak_hadir') return t('filter_tidak_hadir')
  return t('filter_pending')
}

// Link & WhatsApp Sharing
const invitationSlug = computed(() => {
  return verifyData.value?.invitation?.slug || 'wedding'
})

function getGuestInvitationUrl(guest: ClientGuest): string {
  if (typeof window === 'undefined') return ''
  const origin = window.location.origin
  const params = new URLSearchParams()
  if (guest.name) params.set('u', guest.name)
  if (guest.qr_token) params.set('qr', guest.qr_token)
  return `${origin}/invitation/${invitationSlug.value}?${params.toString()}`
}

function getShareMessage(guest: ClientGuest): string {
  const url = getGuestInvitationUrl(guest)
  const clientName = verifyData.value?.client?.name || 'Mempelai'
  
  if (lang.value === 'en') {
    return `Dear ${guest.name},\n\nYou are cordially invited to celebrate the wedding of ${clientName}.\n\nPlease open your personalized digital invitation and confirm your RSVP here:\n${url}\n\nWe look forward to celebrating this special day with you!`
  }
  
  return `Halo ${guest.name},\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk hadir di momen bahagia pernikahan ${clientName}.\n\nBuka tautan undangan digital personal dan konfirmasi kehadiran Anda di sini:\n${url}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.`
}

async function copyGuestLink(guest: ClientGuest) {
  const url = getGuestInvitationUrl(guest)
  if (!url) return
  try {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(url)
      toast.success(t('toast_link_copied'))
    } else {
      toast.success(`URL: ${url}`)
    }
  } catch {
    toast.error('Gagal menyalin tautan.')
  }
}

async function copyShareMessage(guest: ClientGuest) {
  const msg = getShareMessage(guest)
  try {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(msg)
      toast.success(t('toast_msg_copied'))
    }
  } catch {
    toast.error('Gagal menyalin pesan.')
  }
}

function openShareModal(guest: ClientGuest) {
  shareGuest.value = guest
  showShareModal.value = true
}

function openWhatsAppDirect(guest: ClientGuest) {
  const msg = getShareMessage(guest)
  let phone = (guest.phone || '').trim().replace(/[^0-9]/g, '')
  if (phone.startsWith('0')) {
    phone = '62' + phone.slice(1)
  }
  const waUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`
  window.open(waUrl, '_blank')
}

// Data Fetching
async function loadGuests() {
  const token = rawToken.value.trim()
  if (!token) return
  loadingList.value = true
  try {
    const res = await guestService.getGuests(token)
    guests.value = res.guests || []
  } catch (err: any) {
    toast.error(handleApiError(err).message)
  } finally {
    loadingList.value = false
  }
}

async function verifyClientAccess() {
  const token = rawToken.value.trim()
  if (!token) {
    checkingToken.value = false
    authError.value = true
    authErrorMessage.value = 'Token akses tidak ditemukan pada URL.'
    return
  }

  checkingToken.value = true
  authError.value = false

  try {
    const res = await setupService.verifyToken(token)
    verifyData.value = res
    tokenCookie.value = token
    await loadGuests()
  } catch (err: any) {
    authError.value = true
    authErrorMessage.value = handleApiError(err).message || t('invalid_token_default')
  } finally {
    checkingToken.value = false
  }
}

// Modal Handlers
function openBulkModal() {
  bulkNamesInput.value = ''
  showBulkModal.value = true
}

async function handleBulkAdd() {
  const token = rawToken.value.trim()
  const names = parsedBulkNames.value
  if (!token || names.length === 0) return

  submittingBulk.value = true
  try {
    await guestService.bulkAddGuests(token, names)
    toast.success(t('toast_bulk_success', { count: names.length }))
    showBulkModal.value = false
    bulkNamesInput.value = ''
    await loadGuests()
  } catch (err: any) {
    toast.error(handleApiError(err).message)
  } finally {
    submittingBulk.value = false
  }
}

function openSingleCreateModal() {
  editingGuestId.value = null
  singleForm.value = {
    name: '',
    phone: '',
    pax: 1,
    rsvp_status: 'pending'
  }
  showSingleModal.value = true
}

function openEditModal(guest: ClientGuest) {
  editingGuestId.value = guest.id
  singleForm.value = {
    name: guest.name || '',
    phone: guest.phone || '',
    pax: guest.pax || 1,
    rsvp_status: guest.rsvp_status || 'pending'
  }
  showSingleModal.value = true
}

async function handleSaveSingleGuest() {
  const token = rawToken.value.trim()
  if (!token) return

  submittingSingle.value = true
  try {
    if (editingGuestId.value) {
      await guestService.updateGuest(token, editingGuestId.value, {
        name: singleForm.value.name,
        phone: singleForm.value.phone || null,
        pax: singleForm.value.pax,
        rsvp_status: singleForm.value.rsvp_status
      })
      toast.success(t('toast_save_success'))
    } else {
      // Create new guest
      const created = await guestService.bulkAddGuests(token, [singleForm.value.name])
      if (created.length > 0 && (singleForm.value.phone || singleForm.value.pax > 1 || singleForm.value.rsvp_status !== 'pending')) {
        await guestService.updateGuest(token, created[0].id, {
          phone: singleForm.value.phone || null,
          pax: singleForm.value.pax,
          rsvp_status: singleForm.value.rsvp_status
        })
      }
      toast.success(t('toast_save_success'))
    }
    showSingleModal.value = false
    await loadGuests()
  } catch (err: any) {
    toast.error(handleApiError(err).message)
  } finally {
    submittingSingle.value = false
  }
}

function confirmDelete(guest: ClientGuest) {
  guestToDelete.value = guest
  showDeleteModal.value = true
}

async function handleDeleteGuest() {
  if (!guestToDelete.value) return
  const token = rawToken.value.trim()
  try {
    await guestService.deleteGuest(token, guestToDelete.value.id)
    toast.success(t('toast_delete_success'))
    showDeleteModal.value = false
    guestToDelete.value = null
    await loadGuests()
  } catch (err: any) {
    toast.error(handleApiError(err).message)
  }
}

onMounted(() => {
  verifyClientAccess()
})
</script>
