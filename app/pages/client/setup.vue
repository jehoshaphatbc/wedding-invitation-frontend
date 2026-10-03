<template>
  <div class="min-h-screen bg-slate-50 pb-28">
    <!-- Top Portal Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
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
          <div v-if="verifyData?.package" class="hidden sm:flex items-center gap-2">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {{ verifyData.package.name }}
            </span>
          </div>

          <!-- Language Switcher Toggle -->
          <div class="inline-flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200">
            <button
              type="button"
              @click="lang = 'id'"
              class="px-2.5 py-1 text-xs font-bold rounded-lg transition-all"
              :class="lang === 'id' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'"
            >
              ID
            </button>
            <button
              type="button"
              @click="lang = 'en'"
              class="px-2.5 py-1 text-xs font-bold rounded-lg transition-all"
              :class="lang === 'en' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'"
            >
              EN
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs (Setup vs Guests vs Scanner) -->
      <div class="border-t border-gray-100 bg-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div class="flex gap-6">
            <div
              class="py-3 text-xs sm:text-sm font-bold border-b-2 border-blue-600 text-blue-600 flex items-center gap-1.5 cursor-default"
            >
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>{{ t('nav_setup') }}</span>
            </div>
            <NuxtLink
              :to="`/client/guests?token=${encodeURIComponent(rawToken)}`"
              class="py-3 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
            >
              <svg class="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{{ t('nav_guests') }}</span>
            </NuxtLink>
          </div>

          <!-- Scanner Button in Nav Bar (Shown if package has QR) -->
          <a
            v-if="hasQrFeature"
            :href="scannerUrl"
            target="_blank"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors shadow-2xs"
          >
            <svg class="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span class="hidden sm:inline">{{ t('nav_scanner') }}</span>
            <span class="sm:hidden">Scanner</span>
            <svg class="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
        </div>
      </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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

      <!-- Setup Form (Authorized) -->
      <div v-else>
        <!-- Welcome Banner (Mobile Friendly) -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 sm:p-6 text-white mb-5 shadow-sm">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span class="text-[11px] uppercase font-bold tracking-wider text-blue-200">{{ t('client_portal') }}</span>
              <h2 class="text-xl sm:text-2xl font-bold mt-0.5">
                {{ t('welcome') }}, {{ verifyData?.client?.name || t('welcome_default_name') }}!
              </h2>
              <p class="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
                {{ t('welcome_desc') }}
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <a
                v-if="hasQrFeature"
                :href="scannerUrl"
                target="_blank"
                class="bg-amber-500 hover:bg-amber-400 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-sm transition-colors flex items-center gap-1.5"
              >
                <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span>{{ t('btn_open_scanner') }}</span>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
              </a>
              <div v-if="verifyData?.package" class="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs border border-white/20">
                <span class="text-blue-200 block text-[10px] uppercase font-bold">{{ t('active_pkg') }}</span>
                <span class="font-bold text-white">{{ verifyData.package.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Step Progress Indicator Card (Mobile & Desktop) -->
        <div class="bg-white rounded-2xl border border-gray-200 p-3.5 sm:p-4 mb-5 shadow-2xs">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {{ currentTabIndex + 1 }}
              </span>
              <span class="text-xs sm:text-sm font-bold text-gray-900">
                {{ tabs[currentTabIndex]?.label }}
              </span>
              <span class="text-xs text-gray-400">
                ({{ currentTabIndex + 1 }}/{{ tabs.length }})
              </span>
            </div>
            <span class="text-xs font-bold text-blue-600 font-mono">
              {{ progressPercentage }}%
            </span>
          </div>

          <!-- Progress Bar Track -->
          <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-3">
            <div
              class="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
              :style="{ width: `${progressPercentage}%` }"
            />
          </div>

          <!-- Stepper Pills (Touch Friendly Grid) -->
          <div class="grid grid-cols-4 gap-1.5 sm:gap-2">
            <button
              v-for="(tab, idx) in tabs"
              :key="tab.id"
              type="button"
              @click="activeTab = tab.id"
              class="py-2 px-1 sm:px-2 rounded-xl text-center transition-all flex flex-col items-center justify-center cursor-pointer border"
              :class="activeTab === tab.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : idx < currentTabIndex
                  ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'"
            >
              <div class="flex items-center justify-center gap-1">
                <svg v-if="idx < currentTabIndex" class="w-3 h-3 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span v-else class="text-[11px] font-bold">{{ tab.step }}</span>
              </div>
              <span class="text-[10px] sm:text-xs font-semibold truncate max-w-full block mt-0.5">
                {{ tab.label }}
              </span>
            </button>
          </div>
        </div>

        <!-- Form Sections Container -->
        <form @submit.prevent="handleSaveInvitation" class="space-y-5 sm:space-y-6">
          <!-- SECTION 1: DATA MEMPELAI -->
          <div v-show="activeTab === 'bride_groom'" class="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 sm:p-8 space-y-6 sm:space-y-8">
            <div>
              <h3 class="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </span>
                {{ t('couple_header') }}
              </h3>
              <p class="text-xs text-gray-500 mt-1">{{ t('couple_header_desc') }}</p>
            </div>

            <!-- Mempelai Pria -->
            <div class="border-t border-gray-100 pt-5 sm:pt-6">
              <h4 class="text-xs sm:text-sm font-bold text-blue-700 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{{ t('groom_title') }}</span>
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('groom_full_name') }} <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.groom.full_name"
                    type="text"
                    required
                    :placeholder="t('groom_full_name_ph')"
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('groom_nickname') }} <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.groom.nickname"
                    type="text"
                    required
                    :placeholder="t('groom_nickname_ph')"
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('groom_parents') }}</label>
                  <input
                    v-model="form.groom.parents"
                    type="text"
                    :placeholder="t('groom_parents_ph')"
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('groom_ig') }}</label>
                  <div class="relative">
                    <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                    <input
                      v-model="form.groom.instagram"
                      type="text"
                      placeholder="dimaspratama"
                      class="w-full rounded-xl border border-gray-300 pl-8 pr-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Mempelai Wanita -->
            <div class="border-t border-gray-100 pt-5 sm:pt-6">
              <h4 class="text-xs sm:text-sm font-bold text-pink-700 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{{ t('bride_title') }}</span>
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('bride_full_name') }} <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.bride.full_name"
                    type="text"
                    required
                    :placeholder="t('bride_full_name_ph')"
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('bride_nickname') }} <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.bride.nickname"
                    type="text"
                    required
                    :placeholder="t('bride_nickname_ph')"
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('bride_parents') }}</label>
                  <input
                    v-model="form.bride.parents"
                    type="text"
                    :placeholder="t('bride_parents_ph')"
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('bride_ig') }}</label>
                  <div class="relative">
                    <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                    <input
                      v-model="form.bride.instagram"
                      type="text"
                      placeholder="anisarahma"
                      class="w-full rounded-xl border border-gray-300 pl-8 pr-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 2: DATA ACARA -->
          <div v-show="activeTab === 'event_details'" class="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 sm:p-8 space-y-6 sm:space-y-8">
            <div>
              <h3 class="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                {{ t('event_header') }}
              </h3>
              <p class="text-xs text-gray-500 mt-1">{{ t('event_header_desc') }}</p>
            </div>

            <!-- Akad Nikah / Pemberkatan -->
            <div class="border-t border-gray-100 pt-5 sm:pt-6">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
                <h4 class="text-xs sm:text-sm font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{{ t('akad_title') }}</span>
                </h4>
                <span class="inline-flex self-start sm:self-auto text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {{ akadTimeSummary }}
                </span>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('akad_date') }} <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.event.akad_date"
                    type="date"
                    required
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('akad_time_label') }} <span class="text-red-500">*</span></label>
                  <div class="grid grid-cols-5 gap-1.5 items-center">
                    <div class="col-span-2">
                      <input
                        v-model="form.event.akad_time_start"
                        type="time"
                        required
                        class="w-full rounded-xl border border-gray-300 px-2.5 py-2 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                      />
                    </div>
                    <span class="text-xs text-gray-400 font-semibold text-center col-span-1">{{ t('to_time') }}</span>
                    <div class="col-span-2">
                      <input
                        v-model="form.event.akad_time_end"
                        type="time"
                        :disabled="form.event.akad_is_until_end"
                        class="w-full rounded-xl border border-gray-300 px-2.5 py-2 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-400 bg-white"
                      />
                    </div>
                  </div>
                  
                  <div class="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <select
                        v-model="form.event.akad_timezone"
                        class="rounded-xl border border-gray-300 px-2.5 py-1 text-xs font-semibold bg-white text-gray-700 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="WIB">WIB</option>
                        <option value="WITA">WITA</option>
                        <option value="WIT">WIT</option>
                      </select>
                      <label class="inline-flex items-center gap-1.5 cursor-pointer text-xs text-gray-600">
                        <input
                          type="checkbox"
                          v-model="form.event.akad_is_until_end"
                          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{{ t('until_finish') }}</span>
                      </label>
                    </div>

                    <div class="flex gap-1.5">
                      <button
                        type="button"
                        @click="setAkadPreset('08:00', '10:00', false)"
                        class="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors cursor-pointer"
                      >
                        08:00 - 10:00
                      </button>
                      <button
                        type="button"
                        @click="setAkadPreset('09:00', '11:00', false)"
                        class="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors cursor-pointer"
                      >
                        09:00 - 11:00
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resepsi Pernikahan -->
            <div class="border-t border-gray-100 pt-5 sm:pt-6">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
                <h4 class="text-xs sm:text-sm font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span>{{ t('reception_title') }}</span>
                </h4>
                <span class="inline-flex self-start sm:self-auto text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                  {{ receptionTimeSummary }}
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('reception_date') }} <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.event.reception_date"
                    type="date"
                    required
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('reception_time_label') }} <span class="text-red-500">*</span></label>
                  <div class="grid grid-cols-5 gap-1.5 items-center">
                    <div class="col-span-2">
                      <input
                        v-model="form.event.reception_time_start"
                        type="time"
                        required
                        class="w-full rounded-xl border border-gray-300 px-2.5 py-2 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                      />
                    </div>
                    <span class="text-xs text-gray-400 font-semibold text-center col-span-1">{{ t('to_time') }}</span>
                    <div class="col-span-2">
                      <input
                        v-model="form.event.reception_time_end"
                        type="time"
                        :disabled="form.event.reception_is_until_end"
                        class="w-full rounded-xl border border-gray-300 px-2.5 py-2 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-400 bg-white"
                      />
                    </div>
                  </div>

                  <div class="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <select
                        v-model="form.event.reception_timezone"
                        class="rounded-xl border border-gray-300 px-2.5 py-1 text-xs font-semibold bg-white text-gray-700 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="WIB">WIB</option>
                        <option value="WITA">WITA</option>
                        <option value="WIT">WIT</option>
                      </select>
                      <label class="inline-flex items-center gap-1.5 cursor-pointer text-xs text-gray-600">
                        <input
                          type="checkbox"
                          v-model="form.event.reception_is_until_end"
                          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{{ t('until_finish') }}</span>
                      </label>
                    </div>

                    <div class="flex gap-1.5">
                      <button
                        type="button"
                        @click="setReceptionPreset('11:00', '13:00', false)"
                        class="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors cursor-pointer"
                      >
                        11:00 - 13:00
                      </button>
                      <button
                        type="button"
                        @click="setReceptionPreset('18:30', '21:00', false)"
                        class="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors cursor-pointer"
                      >
                        18:30 - 21:00
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lokasi & Peta -->
            <div class="border-t border-gray-100 pt-5 sm:pt-6">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h4 class="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{{ t('location_title') }}</span>
                  </h4>
                  <p class="text-xs text-gray-500 mt-0.5">{{ t('location_desc') }}</p>
                </div>

                <!-- Toggle Sama / Beda Lokasi (Full width on mobile) -->
                <div class="grid grid-cols-2 p-1.5 bg-gray-100 rounded-xl w-full sm:w-auto">
                  <button
                    type="button"
                    @click="form.event.is_same_location = true"
                    class="px-3.5 py-2 text-xs font-bold rounded-lg transition-all text-center cursor-pointer"
                    :class="form.event.is_same_location ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'"
                  >
                    {{ t('same_location') }}
                  </button>
                  <button
                    type="button"
                    @click="form.event.is_same_location = false"
                    class="px-3.5 py-2 text-xs font-bold rounded-lg transition-all text-center cursor-pointer"
                    :class="!form.event.is_same_location ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'"
                  >
                    {{ t('diff_location') }}
                  </button>
                </div>
              </div>

              <!-- JIKA 1 LOKASI (SAMA) -->
              <div v-if="form.event.is_same_location" class="space-y-3.5 bg-gray-50/70 p-4 sm:p-5 rounded-2xl border border-gray-200">
                <div class="flex items-center gap-2 text-xs font-bold text-blue-800 mb-1">
                  <svg class="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{{ t('shared_location_title') }}</span>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('shared_venue_name') }} <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.event.venue_name"
                    type="text"
                    required
                    :placeholder="t('shared_venue_ph')"
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('full_address') }} <span class="text-red-500">*</span></label>
                  <textarea
                    v-model="form.event.address"
                    rows="2"
                    required
                    :placeholder="t('shared_address_ph')"
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('maps_link') }}</label>
                  <input
                    v-model="form.event.maps_url"
                    type="url"
                    placeholder="https://maps.app.goo.gl/..."
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                  />
                  <p class="text-[11px] text-gray-500 mt-1">
                    {{ t('maps_hint') }}
                  </p>
                </div>
              </div>

              <!-- JIKA BEDA LOKASI (2 LOKASI) -->
              <div v-else class="space-y-4 sm:space-y-6">
                <!-- Lokasi Akad -->
                <div class="space-y-3.5 bg-emerald-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-200">
                  <div class="flex items-center gap-2 text-xs font-bold text-emerald-800 mb-1">
                    <svg class="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{{ t('akad_loc_title') }}</span>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('akad_venue_name') }} <span class="text-red-500">*</span></label>
                    <input
                      v-model="form.event.akad_venue_name"
                      type="text"
                      required
                      :placeholder="t('akad_venue_ph')"
                      class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('full_address') }} <span class="text-red-500">*</span></label>
                    <textarea
                      v-model="form.event.akad_address"
                      rows="2"
                      required
                      :placeholder="t('akad_address_ph')"
                      class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('akad_maps_link') }}</label>
                    <input
                      v-model="form.event.akad_maps_url"
                      type="url"
                      placeholder="https://maps.app.goo.gl/..."
                      class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                    />
                  </div>
                </div>

                <!-- Lokasi Resepsi -->
                <div class="space-y-3.5 bg-indigo-50/50 p-4 sm:p-5 rounded-2xl border border-indigo-200">
                  <div class="flex items-center gap-2 text-xs font-bold text-indigo-800 mb-1">
                    <svg class="w-4 h-4 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{{ t('reception_loc_title') }}</span>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('reception_venue_name') }} <span class="text-red-500">*</span></label>
                    <input
                      v-model="form.event.reception_venue_name"
                      type="text"
                      required
                      :placeholder="t('reception_venue_ph')"
                      class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('full_address') }} <span class="text-red-500">*</span></label>
                    <textarea
                      v-model="form.event.reception_address"
                      rows="2"
                      required
                      :placeholder="t('reception_address_ph')"
                      class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('reception_maps_link') }}</label>
                    <input
                      v-model="form.event.reception_maps_url"
                      type="url"
                      placeholder="https://maps.app.goo.gl/..."
                      class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 3: TEMA & DESAIN -->
          <div v-show="activeTab === 'theme_design'" class="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 sm:p-8 space-y-6 sm:space-y-8">
            <div>
              <h3 class="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4 4 4 0 014-4h4a4 4 0 014 4 4 4 0 01-4 4H7zm0 0l9.657-9.657a2 2 0 012.828 0l1.414 1.414a2 2 0 010 2.828L11 21H7z" />
                  </svg>
                </span>
                {{ t('theme_header') }}
              </h3>
              <p class="text-xs text-gray-500 mt-1">{{ t('theme_header_desc') }}</p>
            </div>

            <!-- WARNING & NOTICE BANNER -->
            <!-- State 1: Locked (When editing an already saved invitation) -->
            <div
              v-if="isTemplateLocked"
              class="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 flex items-start gap-3.5 shadow-2xs"
            >
              <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <svg class="w-5 h-5 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="text-xs sm:text-sm font-bold text-amber-900">
                    {{ t('template_locked_title') }}
                  </h4>
                  <span class="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-800 text-[10px] font-bold">
                    {{ t('badge_permanent') }}
                  </span>
                </div>
                <p class="text-xs text-amber-900/80 mt-1 leading-relaxed">
                  {{ t('template_locked_desc') }}
                </p>
              </div>
            </div>

            <!-- State 2: Permanent Notice (Before saving for the first time) -->
            <div
              v-else
              class="p-4 sm:p-5 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-950 flex items-start gap-3.5 shadow-2xs"
            >
              <div class="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <svg class="w-5 h-5 text-rose-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="text-xs sm:text-sm font-bold text-rose-900">
                    {{ t('template_warning_title') }}
                  </h4>
                  <span class="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-extrabold tracking-wide uppercase shadow-2xs">
                    {{ t('badge_permanent') }}
                  </span>
                </div>
                <p class="text-xs text-rose-900/85 mt-1 leading-relaxed">
                  {{ t('template_warning_desc') }}
                </p>
              </div>
            </div>

            <!-- Template Picker -->
            <div class="border-t border-gray-100 pt-5 sm:pt-6">
              <div class="flex items-center justify-between mb-2">
                <label class="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                  {{ t('choose_template') }} <span class="text-red-500">*</span>
                </label>
                <span
                  v-if="isTemplateLocked"
                  class="text-xs text-amber-700 font-semibold flex items-center gap-1.5"
                >
                  <svg class="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>{{ t('badge_locked') }}</span>
                </span>
              </div>

              <!-- Search Bar & Category Filter Pills -->
              <div class="space-y-3 mb-4 mt-2">
                <!-- Search Box -->
                <div class="relative w-full sm:max-w-md">
                  <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    v-model="templateSearch"
                    type="text"
                    :placeholder="t('search_template_ph')"
                    class="w-full rounded-xl border border-gray-300 pl-9 pr-8 py-2 text-xs sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                  />
                  <button
                    v-if="templateSearch"
                    type="button"
                    @click="templateSearch = ''"
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full cursor-pointer"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                <!-- Category Pills (Horizontal Scroll on Mobile) -->
                <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    v-for="cat in templateCategories"
                    :key="cat.id"
                    type="button"
                    @click="selectedTemplateCategory = cat.id"
                    class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    :class="selectedTemplateCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  >
                    <span>{{ cat.label }}</span>
                    <span
                      class="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                      :class="selectedTemplateCategory === cat.id ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-700'"
                    >
                      {{ categoryCounts[cat.id] || 0 }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Empty State when filter or search returns 0 -->
              <div
                v-if="filteredTemplates.length === 0"
                class="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center bg-gray-50/50"
              >
                <div class="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <h4 class="text-sm font-bold text-gray-900">{{ t('empty_templates_title') }}</h4>
                <p class="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  {{ t('empty_templates_desc') }}
                </p>
                <div class="mt-4">
                  <button
                    type="button"
                    @click="templateSearch = ''; selectedTemplateCategory = 'all'"
                    class="px-3.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                  >
                    {{ t('btn_reset_filter') }}
                  </button>
                </div>
              </div>

              <!-- Template Grid (Displays up to 6 per page) -->
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="tpl in paginatedTemplates"
                  :key="tpl.id"
                  @click="!isTemplateLocked && selectTemplate(tpl)"
                  class="relative rounded-2xl border-2 p-3 sm:p-3.5 transition-all flex flex-col justify-between"
                  :class="[
                    isTemplateSelected(tpl)
                      ? isTemplateLocked
                        ? 'border-amber-500 bg-amber-50/30 shadow-xs ring-2 ring-amber-100'
                        : 'border-blue-600 bg-blue-50/40 shadow-xs ring-2 ring-blue-100 cursor-pointer'
                      : isTemplateLocked
                        ? 'border-gray-200 bg-gray-50/80 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50/50 bg-white cursor-pointer active:scale-[0.99]'
                  ]"
                >
                  <!-- Preview Box Container with Stylized Cover Mockup -->
                  <div class="h-36 sm:h-40 rounded-xl overflow-hidden mb-3 border border-gray-200 relative flex items-center justify-center">
                    <img
                      v-if="tpl.thumbnail_url"
                      :src="resolveImageUrl(tpl.thumbnail_url)"
                      :alt="tpl.name"
                      class="w-full h-full object-cover"
                      @error="tpl.thumbnail_url = ''"
                    />

                    <!-- Rich Stylized Preview Mockups matching screenshot design -->
                    <div
                      v-else
                      class="w-full h-full bg-gradient-to-br flex flex-col items-center justify-center p-3 text-center border-t-2"
                      :class="[tpl.gradient, tpl.border_accent]"
                    >
                      <svg v-if="tpl.icon_type === 'flower'" class="w-6 h-6 text-rose-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <svg v-else-if="tpl.icon_type === 'star'" class="w-6 h-6 text-amber-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <svg v-else-if="tpl.icon_type === 'leaf'" class="w-6 h-6 text-emerald-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M12 21a9 9 0 01-9-9c0-4.97 4.03-9 9-9 4.97 0 9 4.03 9 9-4.97 0-9 4.03-9 9z" />
                      </svg>
                      <svg v-else class="w-6 h-6 text-slate-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>

                      <div class="font-serif font-bold text-[10px] uppercase tracking-widest" :class="tpl.header_color">
                        {{ tpl.preview_header }}
                      </div>
                      <div class="font-serif italic text-sm font-bold mt-0.5 truncate max-w-[90%]" :class="tpl.couple_color">
                        {{ form.groom.nickname || 'Dimas' }} & {{ form.bride.nickname || 'Anisa' }}
                      </div>
                      <div class="text-[9px] mt-1 font-mono tracking-wider" :class="tpl.tag_color">
                        {{ tpl.preview_tag }}
                      </div>
                    </div>

                    <!-- Top Right Badge -->
                    <span
                      v-if="isTemplateSelected(tpl) && isTemplateLocked"
                      class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-600 text-white shadow-xs flex items-center gap-1 z-10"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>{{ t('badge_locked') }}</span>
                    </span>
                    <span
                      v-else-if="isTemplateSelected(tpl)"
                      class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-xs flex items-center gap-1 z-10"
                    >
                      <svg class="w-3 h-3 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{{ t('badge_selected') }}</span>
                    </span>
                    <span
                      v-else-if="isTemplateLocked"
                      class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-gray-200/90 text-gray-500 flex items-center gap-1 z-10"
                    >
                      <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>{{ t('badge_unavailable') }}</span>
                    </span>
                  </div>

                  <!-- Template Meta & Selector Indicator -->
                  <div class="flex items-center justify-between gap-2 pt-1">
                    <div class="min-w-0">
                      <div class="font-bold text-sm text-gray-900 truncate">{{ tpl.name }}</div>
                      <div class="text-[11px] text-gray-500 font-mono truncate">{{ tpl.nuxt_component }}</div>
                    </div>

                    <div
                      class="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 transition-colors"
                      :class="[
                        isTemplateSelected(tpl)
                          ? isTemplateLocked
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-blue-600 text-white shadow-xs'
                          : isTemplateLocked
                            ? 'bg-gray-100 text-gray-400 border border-gray-300'
                            : 'border border-gray-300 bg-white'
                      ]"
                    >
                      <svg v-if="isTemplateSelected(tpl) && !isTemplateLocked" class="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <svg v-else-if="isTemplateSelected(tpl) && isTemplateLocked" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <svg v-else-if="isTemplateLocked" class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pagination Controls (Rendered if total templates exceed 6) -->
              <div
                v-if="filteredTemplates.length > templatePageSize"
                class="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100"
              >
                <div class="text-xs text-gray-500 font-medium">
                  {{
                    t('showing_templates', {
                      start: (templateCurrentPage - 1) * templatePageSize + 1,
                      end: Math.min(templateCurrentPage * templatePageSize, filteredTemplates.length),
                      total: filteredTemplates.length
                    })
                  }}
                </div>

                <div class="inline-flex items-center gap-1.5">
                  <button
                    type="button"
                    :disabled="templateCurrentPage <= 1"
                    @click="templateCurrentPage--"
                    class="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    <span>{{ t('btn_prev') }}</span>
                  </button>

                  <div class="flex items-center gap-1">
                    <button
                      v-for="p in totalTemplatePages"
                      :key="p"
                      type="button"
                      @click="templateCurrentPage = p"
                      class="w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      :class="templateCurrentPage === p
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    >
                      {{ p }}
                    </button>
                  </div>

                  <button
                    type="button"
                    :disabled="templateCurrentPage >= totalTemplatePages"
                    @click="templateCurrentPage++"
                    class="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{{ t('btn_next') }}</span>
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Color Picker -->
            <div class="border-t border-gray-100 pt-5 sm:pt-6">
              <label class="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                {{ t('primary_color_title') }}
              </label>
              <p class="text-xs text-gray-500 mb-3.5">
                {{ t('primary_color_desc') }}
              </p>

              <div class="flex flex-wrap items-center gap-2 mb-4">
                <button
                  v-for="preset in colorPresets"
                  :key="preset.hex"
                  type="button"
                  @click="form.theme.primary_color = preset.hex"
                  class="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer"
                  :class="form.theme.primary_color.toLowerCase() === preset.hex.toLowerCase()
                    ? 'border-gray-900 bg-gray-50 font-bold shadow-xs ring-1 ring-gray-900'
                    : 'border-gray-200 hover:border-gray-300 bg-white'"
                >
                  <span class="w-4 h-4 rounded-full border border-black/10 shrink-0" :style="{ backgroundColor: preset.hex }" />
                  <span>{{ preset.name }}</span>
                </button>
              </div>

              <!-- Native Color Picker & Hex Input -->
              <div class="flex flex-wrap items-center gap-3">
                <div class="relative w-11 h-11 rounded-xl border border-gray-300 overflow-hidden cursor-pointer shadow-xs shrink-0">
                  <input
                    v-model="form.theme.primary_color"
                    type="color"
                    class="absolute -inset-2 w-16 h-16 cursor-pointer"
                  />
                </div>
                <div class="w-32 sm:w-36">
                  <input
                    v-model="form.theme.primary_color"
                    type="text"
                    placeholder="#B76E79"
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-base sm:text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                  />
                </div>
                <span class="text-xs text-gray-500">{{ t('color_picker_hint') }}</span>
              </div>
            </div>
          </div>

          <!-- SECTION 4: FITUR DINAMIS (v-if based on features_config) -->
          <div v-show="activeTab === 'features_dynamic'" class="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 sm:p-8 space-y-6 sm:space-y-8">
            <div>
              <h3 class="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </span>
                {{ t('features_header') }}
              </h3>
              <p class="text-xs text-gray-500 mt-1">
                {{ t('features_header_desc') }}
              </p>
            </div>

            <!-- Love Story Feature -->
            <div v-if="features.has_story" class="border-t border-gray-100 pt-5 sm:pt-6">
              <div class="flex items-center justify-between mb-2.5">
                <label class="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>{{ t('love_story_title') }}</span>
                </label>
                <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {{ t('active_feature_badge') }}
                </span>
              </div>
              <p class="text-xs text-gray-500 mb-3">
                {{ t('love_story_desc') }}
              </p>
              <textarea
                v-model="form.story"
                rows="5"
                :placeholder="t('love_story_ph')"
                class="w-full rounded-xl border border-gray-300 p-3.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
              />
            </div>

            <!-- Photo Gallery Feature -->
            <div v-if="features.has_gallery" class="border-t border-gray-100 pt-5 sm:pt-6">
              <div class="flex items-center justify-between mb-2.5">
                <label class="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{{ t('gallery_title') }}</span>
                </label>
                <span class="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {{ t('gallery_max', { limit: galleryLimit }) }}
                </span>
              </div>
              <p class="text-xs text-gray-500 mb-3.5">
                {{ t('gallery_desc') }}
              </p>

              <!-- Dynamic Gallery Rows -->
              <div class="space-y-2.5">
                <div
                  v-for="(link, index) in form.gallery"
                  :key="index"
                  class="flex items-center gap-2"
                >
                  <span class="w-6 text-xs font-bold text-gray-400 text-center shrink-0">{{ index + 1 }}.</span>
                  <input
                    v-model="form.gallery[index]"
                    type="url"
                    placeholder="https://drive.google.com/file/d/... or https://..."
                    class="flex-1 rounded-xl border border-gray-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                  />
                  <button
                    type="button"
                    @click="removeGalleryRow(index)"
                    class="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
                    :title="t('remove_photo_title')"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="mt-3.5">
                <button
                  type="button"
                  :disabled="form.gallery.length >= galleryLimit"
                  @click="addGalleryRow"
                  class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-blue-300 text-blue-600 bg-blue-50/50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{{ t('add_photo_btn', { current: form.gallery.length, limit: galleryLimit }) }}</span>
                </button>
              </div>
            </div>

            <!-- Digital Gift / Amplop Feature -->
            <div v-if="features.has_gift" class="border-t border-gray-100 pt-5 sm:pt-6">
              <div class="flex items-center justify-between mb-2.5">
                <label class="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V4.5a2.5 2.5 0 00-5 0V8h5zm0 0h5a2.5 2.5 0 000-5H12v5zm-7 0h14a1 1 0 011 1v3H4V9a1 1 0 011-1zm0 4h16v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7z" />
                  </svg>
                  <span>{{ t('gifts_title') }}</span>
                </label>
                <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {{ t('active_feature_badge') }}
                </span>
              </div>
              <p class="text-xs text-gray-500 mb-3.5">
                {{ t('gifts_desc') }}
              </p>

              <!-- List Rekening (Mobile Optimized Cards) -->
              <div class="space-y-4">
                <div
                  v-for="(item, index) in form.gifts"
                  :key="item.id || index"
                  class="bg-gray-50/80 p-4 sm:p-5 rounded-2xl border border-gray-200 relative transition-all"
                >
                  <div class="flex items-center justify-between mb-3">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-gray-700 border border-gray-200 shadow-2xs">
                      <svg class="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span>{{ t('account_badge') }} #{{ index + 1 }}</span>
                    </span>
                    <button
                      v-if="form.gifts.length > 1"
                      type="button"
                      @click="removeGiftAccount(index)"
                      class="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {{ t('remove_account') }}
                    </button>
                  </div>

                  <!-- Quick Bank Select (Large Touch Targets) -->
                  <div class="mb-3.5">
                    <span class="text-[11px] font-semibold text-gray-500 block mb-1.5">{{ t('quick_choice') }}</span>
                    <div class="flex flex-wrap gap-1.5">
                      <button
                        v-for="b in ['BCA', 'Mandiri', 'BRI', 'BNI', 'BSI', 'CIMB Niaga', 'GoPay', 'OVO', 'DANA', 'ShopeePay', 'QRIS']"
                        :key="b"
                        type="button"
                        @click="item.bank_name = b"
                        class="text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer"
                        :class="item.bank_name === b ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'"
                      >
                        {{ b }}
                      </button>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('bank_name') }} <span class="text-red-500">*</span></label>
                      <input
                        v-model="item.bank_name"
                        type="text"
                        required
                        :placeholder="t('bank_name_ph')"
                        class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('account_number') }} <span class="text-red-500">*</span></label>
                      <input
                        v-model="item.account_number"
                        type="text"
                        inputmode="numeric"
                        required
                        placeholder="1234567890"
                        class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 mb-1.5">{{ t('account_holder') }} <span class="text-red-500">*</span></label>
                      <input
                        v-model="item.account_holder"
                        type="text"
                        required
                        :placeholder="t('account_holder_ph')"
                        class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                      />
                    </div>
                  </div>

                  <div class="mt-3">
                    <label class="block text-[11px] font-medium text-gray-500 mb-1">{{ t('account_notes') }}</label>
                    <input
                      v-model="item.notes"
                      type="text"
                      :placeholder="t('account_notes_ph')"
                      class="w-full rounded-xl border border-gray-200 px-3 py-2 text-base sm:text-xs text-gray-600 bg-white focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              <!-- Button Tambah Rekening -->
              <div class="mt-4">
                <button
                  type="button"
                  @click="addGiftAccount"
                  class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{{ t('add_account_btn') }}</span>
                </button>
              </div>
            </div>

            <!-- QR Scanner Check-in Feature Card (v-if hasQrFeature) -->
            <div v-if="hasQrFeature" class="border-t border-gray-100 pt-5 sm:pt-6">
              <div class="flex items-center justify-between mb-2.5">
                <label class="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <span>{{ t('qr_scanner_title') }}</span>
                </label>
                <span class="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {{ t('active_feature_badge') }}
                </span>
              </div>
              <p class="text-xs text-gray-500 mb-3.5">
                {{ t('qr_scanner_desc') }}
              </p>

              <div class="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-start sm:items-center gap-3">
                  <div class="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <div>
                    <div class="text-sm font-bold text-gray-900">{{ t('scanner_app_title') }}</div>
                    <div class="text-xs text-gray-600 mt-0.5">
                      {{ t('scanner_app_hint') }}
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 sm:flex sm:items-center gap-2 shrink-0">
                  <button
                    type="button"
                    @click="copyScannerUrl"
                    class="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                    <span>{{ t('btn_copy_scanner') }}</span>
                  </button>
                  <a
                    :href="scannerUrl"
                    target="_blank"
                    class="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <span>{{ t('btn_open_scanner') }}</span>
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <!-- Other Active Features Summary -->
            <div class="border-t border-gray-100 pt-5 sm:pt-6">
              <span class="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
                {{ t('other_auto_features') }}
              </span>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div v-if="features.has_countdown" class="flex items-center gap-2 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                  <svg class="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div class="text-xs font-bold text-gray-800">{{ t('countdown_title') }}</div>
                    <div class="text-[10px] text-gray-500">{{ t('countdown_desc') }}</div>
                  </div>
                </div>
                <div v-if="features.has_maps" class="flex items-center gap-2 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <svg class="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <div>
                    <div class="text-xs font-bold text-gray-800">{{ t('maps_feature_title') }}</div>
                    <div class="text-[10px] text-gray-500">{{ t('maps_feature_desc') }}</div>
                  </div>
                </div>
                <div v-if="features.has_rsvp" class="flex items-center gap-2 p-3 rounded-xl bg-purple-50/60 border border-purple-100">
                  <svg class="w-5 h-5 text-purple-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <div>
                    <div class="text-xs font-bold text-gray-800">{{ t('rsvp_feature_title') }}</div>
                    <div class="text-[10px] text-gray-500">{{ t('rsvp_feature_desc') }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>

    <!-- Sticky Bottom Bar (Safe Area Aware for Mobile) -->
    <div v-if="!checkingToken && !authError" class="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40 shadow-lg pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div class="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        <button
          v-if="currentTabIndex > 0"
          type="button"
          @click="activeTab = tabs[currentTabIndex - 1].id"
          class="px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="hidden sm:inline">{{ t('btn_prev') }}</span>
        </button>
        <div v-else class="w-8 sm:w-0 shrink-0" />

        <div class="text-xs text-gray-500 font-medium sm:hidden">
          {{ currentTabIndex + 1 }} / {{ tabs.length }}
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            v-if="currentTabIndex < tabs.length - 1"
            type="button"
            @click="activeTab = tabs[currentTabIndex + 1].id"
            class="px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>{{ t('btn_next') }}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            type="button"
            :disabled="saving"
            @click="handleSaveInvitation"
            class="px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer"
          >
            <div v-if="saving" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            <span>{{ saving ? t('btn_saving') : t('btn_save') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useClientSetupService, type ClientAuthVerifyData } from '~/services/client-setup.service'
import { handleApiError } from '~/utils/errors'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Setup Undangan Pernikahan | Harsava',
  meta: [{ name: 'robots', content: 'noindex,nofollow' }]
})

const route = useRoute()
const toast = useToast()
const clientSetupService = useClientSetupService()

// Language switcher (EN & ID)
const langCookie = useCookie<'en' | 'id'>('client_setup_lang', { default: () => 'id', maxAge: 60 * 60 * 24 * 30 })
const lang = ref<'en' | 'id'>(langCookie.value || 'id')
watch(lang, (newLang) => {
  langCookie.value = newLang
})

const translations: Record<'id' | 'en', Record<string, string>> = {
  id: {
    portal_title: 'Setup Undangan Digital',
    portal_subtitle: 'Harsava Wedding Invitation Portal',
    nav_setup: 'Setup Undangan',
    nav_guests: 'Buku Tamu & RSVP',
    active_pkg: 'Paket Aktif',
    verifying_title: 'Memverifikasi Akses Klien...',
    verifying_desc: 'Mohon tunggu selagi kami memvalidasi token akses Anda.',
    invalid_token_title: 'Link Akses Tidak Valid',
    invalid_token_default: 'Token akses tidak ditemukan atau link sudah kedaluwarsa. Silakan periksa kembali link yang Anda terima melalui WhatsApp atau email.',
    back_to_home: 'Kembali ke Beranda',
    client_portal: 'Portal Klien',
    welcome: 'Selamat Datang',
    welcome_default_name: 'Calon Mempelai',
    welcome_desc: 'Lengkapi formulir di bawah ini untuk memulai pembuatan dan kustomisasi undangan digital Anda.',
    tab_couple: 'Data Mempelai',
    tab_event: 'Waktu & Lokasi',
    tab_theme: 'Tema & Desain',
    tab_features: 'Fitur Tambahan',
    couple_header: 'Data Calon Mempelai',
    couple_header_desc: 'Masukkan informasi lengkap pasangan pengantin pria dan wanita.',
    groom_title: 'Mempelai Pria (Groom)',
    groom_full_name: 'Nama Lengkap Pria',
    groom_full_name_ph: 'Contoh: Muhammad Dimas Pratama, S.T.',
    groom_nickname: 'Nama Panggilan Pria',
    groom_nickname_ph: 'Contoh: Dimas',
    groom_parents: 'Nama Orang Tua Pria',
    groom_parents_ph: 'Putra dari Bpk. Bambang & Ibu Sri',
    groom_ig: 'Akun Instagram Pria',
    bride_title: 'Mempelai Wanita (Bride)',
    bride_full_name: 'Nama Lengkap Wanita',
    bride_full_name_ph: 'Contoh: Anisa Rahmawati, S.Ked.',
    bride_nickname: 'Nama Panggilan Wanita',
    bride_nickname_ph: 'Contoh: Anisa',
    bride_parents: 'Nama Orang Tua Wanita',
    bride_parents_ph: 'Putri dari Bpk. Haryono & Ibu Endang',
    bride_ig: 'Akun Instagram Wanita',
    event_header: 'Data Waktu & Lokasi Acara',
    event_header_desc: 'Tentukan jadwal prosesi akad nikah / pemberkatan serta resepsi.',
    akad_title: 'Akad Nikah / Pemberkatan',
    time_not_set: 'Waktu belum diatur',
    at_time: 'Pukul',
    until_finish: 'Sampai Selesai',
    akad_date: 'Tanggal Akad',
    akad_time_label: 'Waktu Prosesi Akad',
    to_time: 's/d',
    reception_title: 'Resepsi Pernikahan',
    reception_date: 'Tanggal Resepsi',
    reception_time_label: 'Waktu Resepsi',
    location_title: 'Lokasi Acara & Navigasi Maps',
    location_desc: 'Tentukan lokasi akad dan resepsi (apakah sama atau berbeda tempat).',
    same_location: '1 Lokasi (Sama)',
    diff_location: '2 Lokasi (Beda)',
    shared_location_title: 'Lokasi Akad & Resepsi (Bersama)',
    shared_venue_name: 'Nama Tempat / Gedung / Masjid',
    shared_venue_ph: 'Contoh: Grand Ballroom Hotel Mulia Senayan',
    full_address: 'Alamat Lengkap',
    shared_address_ph: 'Jl. Asia Afrika No. 8, Gelora, Tanah Abang, Jakarta Pusat',
    maps_link: 'Link Google Maps (URL Navigasi)',
    maps_hint: 'Buka Google Maps, cari lokasi acara, klik Bagikan (Share) lalu salin tautan singkatnya.',
    akad_loc_title: '1. Lokasi Akad Nikah / Pemberkatan',
    akad_venue_name: 'Nama Tempat / Masjid / Gereja',
    akad_venue_ph: 'Contoh: Masjid Agung Al-Azhar Kebayoran Baru',
    akad_address_ph: 'Jl. Sisingamangaraja No. 1, Selong, Kebayoran Baru, Jakarta Selatan',
    akad_maps_link: 'Link Google Maps Lokasi Akad',
    reception_loc_title: '2. Lokasi Resepsi Pernikahan',
    reception_venue_name: 'Nama Gedung / Hotel / Ballroom',
    reception_venue_ph: 'Contoh: Grand Ballroom Hotel Mulia Senayan',
    reception_address_ph: 'Jl. Asia Afrika No. 8, Gelora, Tanah Abang, Jakarta Pusat',
    reception_maps_link: 'Link Google Maps Lokasi Resepsi',
    theme_header: 'Pilihan Tema & Desain',
    theme_header_desc: 'Pilih template desain undangan dan atur warna aksen utama.',
    choose_template: 'Pilih Template Desain',
    preview_design: 'Preview Desain',
    template_warning_title: 'PENTING: Pilihan Template Desain Bersifat Permanen',
    template_warning_desc: 'Template undangan yang Anda pilih TIDAK DAPAT DIUBAH LAGI setelah formulir ini disimpan/disubmit. Pastikan Anda telah memilih template yang benar-benar sesuai dengan konsep pernikahan Anda.',
    template_locked_title: 'Template Desain Telah Terkunci (Permanen)',
    template_locked_desc: 'Template undangan ini telah disimpan dan dikunci secara permanen. Anda tidak dapat mengganti template ini lagi, namun Anda tetap dapat menyesuaikan warna aksen utama serta detail acara lainnya.',
    badge_permanent: 'Permanen',
    badge_selected: 'Terpilih',
    badge_locked: 'Terkunci',
    badge_unavailable: 'Terkunci',
    locked_template_notice: 'Template desain sudah dikunci permanen dan tidak dapat diubah lagi.',
    primary_color_title: 'Warna Aksen Utama (Primary Color)',
    primary_color_desc: 'Warna ini akan menjadi aksen tombol, judul, dan dekorasi pada undangan digital Anda.',
    color_picker_hint: 'Pilih warna kustom dengan color picker',
    features_header: 'Fitur Paket & Konten Tambahan',
    features_header_desc: 'Formulir berikut aktif secara dinamis menyesuaikan paket langganan Anda.',
    active_feature_badge: 'Fitur Aktif',
    love_story_title: 'Kisah Cinta / Love Story',
    love_story_desc: 'Ceritakan kisah perjalanan cinta Anda berdua (awal perkenalan, momen berkesan, hingga lamaran).',
    love_story_ph: 'Tuliskan kisah cinta Anda di sini...',
    gallery_title: 'Galeri Foto (Google Drive Links)',
    gallery_max: 'Maks. {limit} Foto',
    gallery_desc: 'Sematkan tautan publik foto prewedding dari Google Drive / direct link gambar (Pastikan akses diset "Siapa saja yang memiliki link").',
    remove_photo_title: 'Hapus baris foto',
    add_photo_btn: 'Tambah Link Foto ({current} / {limit})',
    gifts_title: 'Amplop Digital & Hadiah Pernikahan',
    gifts_desc: 'Informasi rekening bank atau dompet digital untuk para tamu yang ingin mengirimkan hadiah kasih. Anda dapat menambahkan lebih dari 1 rekening/e-wallet.',
    account_badge: 'Rekening / E-Wallet',
    remove_account: 'Hapus',
    quick_choice: 'Pilihan Cepat:',
    bank_name: 'Nama Bank / e-Wallet',
    bank_name_ph: 'Contoh: BCA / Mandiri / GoPay',
    account_number: 'Nomor Rekening / No. HP',
    account_holder: 'Atas Nama Pemilik',
    account_holder_ph: 'Contoh: Dimas Pratama',
    account_notes: 'Catatan Tambahan (Opsional)',
    account_notes_ph: 'Contoh: Rekening Mempelai Pria / Khusus Dompet Digital',
    add_account_btn: 'Tambah Rekening / Dompet Digital Baru',
    other_auto_features: 'Fitur Unggulan Lainnya yang Otomatis Aktif',
    countdown_title: 'Countdown Timer',
    countdown_desc: 'Hitung mundur hari H',
    maps_feature_title: 'Navigasi Maps',
    maps_feature_desc: 'Panduan rute Google Maps',
    rsvp_feature_title: 'RSVP Online',
    rsvp_feature_desc: 'Konfirmasi kehadiran tamu',
    qr_feature_title: 'QR Check-in Tamu',
    qr_feature_desc: 'Sistem buku tamu digital',
    btn_prev: 'Sebelumnya',
    btn_next: 'Selanjutnya',
    btn_save: 'Simpan Data Undangan',
    nav_scanner: 'Scanner Check-in',
    qr_scanner_title: 'QR Code Scanner & Buku Tamu Digital',
    qr_scanner_desc: 'Fitur scanner check-in untuk memindai QR code tamu di hari H acara dan mencatat kehadiran secara langsung.',
    scanner_app_title: 'Buka Aplikasi QR Scanner Tamu',
    scanner_app_hint: 'Buka kamera browser smartphone panitia penerima tamu untuk mulai memindai QR code tamu di pintu masuk venue.',
    btn_open_scanner: 'Buka QR Scanner',
    btn_copy_scanner: 'Salin Link Scanner',
    toast_scanner_copied: 'Tautan QR Scanner berhasil disalin ke clipboard!',
    toast_fill_couple: 'Mohon lengkapi Nama Mempelai terlebih dahulu.',
    toast_invalid_token: 'Token akses tidak valid.',
    toast_local_fallback: 'Data berhasil disimpan secara lokal di browser Anda (Endpoint backend sedang disiapkan).',
    toast_save_success: 'Data undangan berhasil disimpan!',
    toast_save_error: 'Gagal menyimpan data undangan.',
    search_template_ph: 'Cari nama tema atau kategori desain...',
    cat_all: 'Semua Kategori',
    cat_romantic: 'Romantic & Floral',
    cat_classic: 'Classic & Elegant',
    cat_minimalist: 'Modern Minimalist',
    cat_rustic: 'Rustic & Nature',
    cat_islamic: 'Islami & Tradisi',
    empty_templates_title: 'Tidak Ada Template Ditemukan',
    empty_templates_desc: 'Coba ubah kata kunci pencarian atau pilih kategori lain.',
    btn_reset_filter: 'Reset Filter',
    showing_templates: 'Menampilkan {start} - {end} dari {total} template',
    page_of: 'Halaman {current} dari {total}'
  },
  en: {
    portal_title: 'Digital Invitation Setup',
    portal_subtitle: 'Harsava Wedding Invitation Portal',
    nav_setup: 'Invitation Setup',
    nav_guests: 'Guest List & RSVP',
    nav_scanner: 'Check-in Scanner',
    active_pkg: 'Active Package',
    verifying_title: 'Verifying Client Access...',
    verifying_desc: 'Please wait while we validate your access token.',
    invalid_token_title: 'Invalid Access Link',
    invalid_token_default: 'Access token not found or link has expired. Please check the official link you received via WhatsApp or email.',
    back_to_home: 'Back to Home',
    client_portal: 'Client Portal',
    welcome: 'Welcome',
    welcome_default_name: 'Happy Couple',
    welcome_desc: 'Fill out the form below to begin creating and customizing your digital wedding invitation.',
    tab_couple: 'Couple Info',
    tab_event: 'Time & Venue',
    tab_theme: 'Theme & Design',
    tab_features: 'Additional Features',
    couple_header: 'Bride & Groom Information',
    couple_header_desc: 'Enter complete information for both the groom and the bride.',
    groom_title: 'Groom Details',
    groom_full_name: 'Groom Full Name',
    groom_full_name_ph: 'e.g. Johnathan Smith, B.Sc.',
    groom_nickname: 'Groom Nickname',
    groom_nickname_ph: 'e.g. John',
    groom_parents: 'Groom Parents\' Names',
    groom_parents_ph: 'Son of Mr. Robert & Mrs. Sarah',
    groom_ig: 'Groom Instagram Username',
    bride_title: 'Bride Details',
    bride_full_name: 'Bride Full Name',
    bride_full_name_ph: 'e.g. Emily Watson, M.D.',
    bride_nickname: 'Bride Nickname',
    bride_nickname_ph: 'e.g. Emily',
    bride_parents: 'Bride Parents\' Names',
    bride_parents_ph: 'Daughter of Mr. Michael & Mrs. Laura',
    bride_ig: 'Bride Instagram Username',
    event_header: 'Event Schedule & Venue',
    event_header_desc: 'Specify the schedule for holy matrimony / akad and wedding reception.',
    akad_title: 'Holy Matrimony / Akad Nikah',
    time_not_set: 'Time not set',
    at_time: 'At',
    until_finish: 'Until Finish',
    akad_date: 'Matrimony / Akad Date',
    akad_time_label: 'Matrimony / Akad Time',
    to_time: 'to',
    reception_title: 'Wedding Reception',
    reception_date: 'Reception Date',
    reception_time_label: 'Reception Time',
    location_title: 'Venue Location & Maps Navigation',
    location_desc: 'Specify ceremony and reception locations (whether at the same venue or different venues).',
    same_location: '1 Venue (Same Location)',
    diff_location: '2 Venues (Different)',
    shared_location_title: 'Ceremony & Reception Venue (Combined)',
    shared_venue_name: 'Venue / Building / Hall Name',
    shared_venue_ph: 'e.g. Grand Ballroom Mulia Hotel',
    full_address: 'Full Address',
    shared_address_ph: '8th Asia Afrika St., Central Jakarta',
    maps_link: 'Google Maps Link (Navigation URL)',
    maps_hint: 'Open Google Maps, find your venue, click Share, then copy the short link.',
    akad_loc_title: '1. Ceremony / Akad Nikah Venue',
    akad_venue_name: 'Place / Mosque / Church Name',
    akad_venue_ph: 'e.g. Al-Azhar Grand Mosque',
    akad_address_ph: '1st Sisingamangaraja St., South Jakarta',
    akad_maps_link: 'Ceremony Google Maps Link',
    reception_loc_title: '2. Reception Venue',
    reception_venue_name: 'Building / Hotel / Ballroom Name',
    reception_venue_ph: 'e.g. Grand Ballroom Mulia Hotel',
    reception_address_ph: '8th Asia Afrika St., Central Jakarta',
    reception_maps_link: 'Reception Google Maps Link',
    theme_header: 'Theme & Design Selection',
    theme_header_desc: 'Select your preferred invitation design template and accent colors.',
    choose_template: 'Choose Design Template',
    preview_design: 'Design Preview',
    template_warning_title: 'IMPORTANT: Template Selection is Permanent',
    template_warning_desc: 'The invitation design template you select CANNOT BE CHANGED once this form is submitted or saved. Please ensure you choose the template that best fits your wedding concept.',
    template_locked_title: 'Design Template is Permanently Locked',
    template_locked_desc: 'This invitation template has been previously saved and permanently locked. You cannot switch to another template, but you can still adjust the primary accent color and other details.',
    badge_permanent: 'Permanent',
    badge_selected: 'Selected',
    badge_locked: 'Locked',
    badge_unavailable: 'Locked',
    locked_template_notice: 'The design template is permanently locked and cannot be changed.',
    primary_color_title: 'Primary Accent Color',
    primary_color_desc: 'This color accents buttons, headers, and decorative elements in your digital invitation.',
    color_picker_hint: 'Pick a custom color using color picker',
    features_header: 'Package Features & Additional Content',
    features_header_desc: 'The fields below are enabled dynamically according to your selected package.',
    active_feature_badge: 'Active Feature',
    love_story_title: 'Love Story / Journey',
    love_story_desc: 'Tell the story of your love journey (how you met, memorable milestones, and the proposal).',
    love_story_ph: 'Write your romantic love story here...',
    gallery_title: 'Photo Gallery (Google Drive Links)',
    gallery_max: 'Max {limit} Photos',
    gallery_desc: 'Embed public pre-wedding photo links from Google Drive or direct image URLs (make sure sharing permission is set to "Anyone with the link").',
    remove_photo_title: 'Remove photo row',
    add_photo_btn: 'Add Photo Link ({current} / {limit})',
    gifts_title: 'Digital Gift & Cash Registry',
    gifts_desc: 'Bank account or e-wallet details for guests wishing to send wedding gifts. You can add more than 1 account.',
    account_badge: 'Account / E-Wallet',
    remove_account: 'Remove',
    quick_choice: 'Quick Select:',
    bank_name: 'Bank / E-Wallet Name',
    bank_name_ph: 'e.g. BCA / Mandiri / PayPal',
    account_number: 'Account / Phone Number',
    account_holder: 'Account Holder Name',
    account_holder_ph: 'e.g. Johnathan Smith',
    account_notes: 'Additional Note (Optional)',
    account_notes_ph: 'e.g. Groom\'s Account / Digital Wallet only',
    add_account_btn: 'Add New Bank / Digital Wallet Account',
    other_auto_features: 'Other Automatically Included Features',
    countdown_title: 'Countdown Timer',
    countdown_desc: 'Countdown to the big day',
    maps_feature_title: 'Maps Navigation',
    maps_feature_desc: 'Interactive Google Maps directions',
    rsvp_feature_title: 'Online RSVP',
    rsvp_feature_desc: 'Guest attendance confirmation',
    qr_feature_title: 'Guest QR Check-in',
    qr_feature_desc: 'Digital guestbook system',
    qr_scanner_title: 'QR Code Scanner & Digital Guestbook',
    qr_scanner_desc: 'Check-in scanner tool to scan guest QR codes on the event day and record live attendance.',
    scanner_app_title: 'Open Event QR Scanner Tool',
    scanner_app_hint: 'Open reception smartphone camera browser to start scanning guest QR codes at venue entrance.',
    btn_open_scanner: 'Open QR Scanner',
    btn_copy_scanner: 'Copy Scanner Link',
    toast_scanner_copied: 'QR Scanner link copied to clipboard!',
    btn_prev: 'Previous',
    btn_next: 'Next',
    btn_save: 'Save Invitation Data',
    btn_saving: 'Saving Data...',
    toast_fill_couple: 'Please complete Bride & Groom information first.',
    toast_invalid_token: 'Invalid access token.',
    toast_local_fallback: 'Data saved locally in your browser (Backend endpoint is being prepared).',
    toast_save_success: 'Invitation data saved successfully!',
    toast_save_error: 'Failed to save invitation data.',
    search_template_ph: 'Search theme name or category...',
    cat_all: 'All Categories',
    cat_romantic: 'Romantic & Floral',
    cat_classic: 'Classic & Elegant',
    cat_minimalist: 'Modern Minimalist',
    cat_rustic: 'Rustic & Nature',
    cat_islamic: 'Islamic & Traditional',
    empty_templates_title: 'No Templates Found',
    empty_templates_desc: 'Try adjusting your search keyword or selecting another category.',
    btn_reset_filter: 'Reset Filter',
    showing_templates: 'Showing {start} - {end} of {total} templates',
    page_of: 'Page {current} of {total}'
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

// Token from query parameter
const tokenCookie = useCookie<string>('client_setup_token', { maxAge: 60 * 60 * 24 * 7 })
const rawToken = computed(() => String(route.query.token || route.query.auth || tokenCookie.value || ''))

const checkingToken = ref(true)
const authError = ref(false)
const authErrorMessage = ref('')
const verifyData = ref<ClientAuthVerifyData | null>(null)
const saving = ref(false)

const tabs = computed(() => [
  { id: 'bride_groom', label: t('tab_couple'), step: 1 },
  { id: 'event_details', label: t('tab_event'), step: 2 },
  { id: 'theme_design', label: t('tab_theme'), step: 3 },
  { id: 'features_dynamic', label: t('tab_features'), step: 4 }
])
const activeTab = ref('bride_groom')
const currentTabIndex = computed(() => tabs.value.findIndex(t => t.id === activeTab.value))
const progressPercentage = computed(() => {
  const total = tabs.value.length
  if (total === 0) return 0
  return Math.round(((currentTabIndex.value + 1) / total) * 100)
})

// Color Presets
const colorPresets = [
  { name: 'Rose Gold', hex: '#B76E79' },
  { name: 'Emerald', hex: '#047857' },
  { name: 'Royal Navy', hex: '#1E3A8A' },
  { name: 'Champagne Gold', hex: '#D4AF37' },
  { name: 'Terracotta', hex: '#C2410C' },
  { name: 'Charcoal', hex: '#27272A' }
]

const templateService = useTemplateService()
const config = useRuntimeConfig()
const apiBase = (config.public.apiBase as string || '').replace(/\/api\/v1\/?$/, '')

function resolveImageUrl(path?: string) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) return path
  return `${apiBase}${path.startsWith('/') ? '' : '/'}${path}`
}

function getCategoryGradient(cat?: string) {
  const c = (cat || '').toLowerCase()
  if (c.includes('romantic') || c.includes('floral')) return 'from-rose-50 via-pink-50/70 to-amber-50'
  if (c.includes('classic') || c.includes('elegant')) return 'from-amber-50 via-stone-50 to-amber-100/60'
  if (c.includes('minimal')) return 'from-slate-50 via-gray-50 to-zinc-100'
  if (c.includes('rustic') || c.includes('nature') || c.includes('dark')) return 'from-stone-900 via-amber-950 to-stone-800'
  if (c.includes('islamic') || c.includes('tradisi')) return 'from-emerald-50 via-green-50/50 to-amber-100/50'
  return 'from-sky-50 via-indigo-50/40 to-slate-50'
}

function getCategoryBorder(cat?: string) {
  const c = (cat || '').toLowerCase()
  if (c.includes('romantic') || c.includes('floral')) return 'border-rose-300'
  if (c.includes('classic') || c.includes('elegant')) return 'border-amber-400'
  if (c.includes('minimal')) return 'border-slate-400'
  if (c.includes('rustic') || c.includes('nature') || c.includes('dark')) return 'border-amber-700'
  if (c.includes('islamic') || c.includes('tradisi')) return 'border-emerald-400'
  return 'border-blue-300'
}

function getCategoryIconType(cat?: string) {
  const c = (cat || '').toLowerCase()
  if (c.includes('romantic') || c.includes('floral')) return 'flower'
  if (c.includes('classic') || c.includes('elegant')) return 'star'
  if (c.includes('rustic') || c.includes('nature') || c.includes('dark')) return 'leaf'
  return 'sparkles'
}

// Default Fallback Templates in case database is empty or offline
const defaultTemplatesFallback = [
  {
    id: 'tpl-1',
    name: 'Romantic Floral',
    category: 'romantic',
    nuxt_component: 'TemplateRomanticFloral',
    thumbnail_url: '',
    preview_header: 'The Wedding Of',
    preview_tag: 'ROMANTIC FLORAL',
    gradient: 'from-rose-50 via-pink-50/70 to-amber-50',
    border_accent: 'border-rose-300',
    header_color: 'text-rose-950',
    couple_color: 'text-rose-800',
    tag_color: 'text-rose-500',
    icon_type: 'flower'
  },
  {
    id: 'tpl-2',
    name: 'Classic Elegance',
    category: 'classic',
    nuxt_component: 'TemplateClassicElegance',
    thumbnail_url: '',
    preview_header: 'Wedding Celebration',
    preview_tag: 'CLASSIC ELEGANCE',
    gradient: 'from-amber-50 via-stone-50 to-amber-100/60',
    border_accent: 'border-amber-400',
    header_color: 'text-stone-900',
    couple_color: 'text-stone-800',
    tag_color: 'text-amber-700',
    icon_type: 'star'
  },
  {
    id: 'tpl-3',
    name: 'Modern Minimalist',
    category: 'minimalist',
    nuxt_component: 'TemplateModernMinimalist',
    thumbnail_url: '',
    preview_header: 'Save The Date',
    preview_tag: 'MODERN MINIMALIST',
    gradient: 'from-slate-50 via-gray-50 to-zinc-100',
    border_accent: 'border-slate-400',
    header_color: 'text-slate-800',
    couple_color: 'text-slate-900',
    tag_color: 'text-slate-500',
    icon_type: 'sparkles'
  },
  {
    id: 'tpl-4',
    name: 'Botanical Garden',
    category: 'romantic',
    nuxt_component: 'TemplateBotanicalGarden',
    thumbnail_url: '',
    preview_header: 'Wedding Invitation',
    preview_tag: 'BOTANICAL GARDEN',
    gradient: 'from-emerald-50 via-teal-50/60 to-lime-50',
    border_accent: 'border-emerald-300',
    header_color: 'text-emerald-950',
    couple_color: 'text-emerald-800',
    tag_color: 'text-emerald-600',
    icon_type: 'leaf'
  },
  {
    id: 'tpl-5',
    name: 'Royal Heritage',
    category: 'classic',
    nuxt_component: 'TemplateRoyalHeritage',
    thumbnail_url: '',
    preview_header: 'The Royal Union',
    preview_tag: 'ROYAL HERITAGE',
    gradient: 'from-indigo-50 via-purple-50/60 to-amber-50',
    border_accent: 'border-indigo-300',
    header_color: 'text-indigo-950',
    couple_color: 'text-indigo-900',
    tag_color: 'text-indigo-600',
    icon_type: 'star'
  },
  {
    id: 'tpl-6',
    name: 'Nordic Clean',
    category: 'minimalist',
    nuxt_component: 'TemplateNordicClean',
    thumbnail_url: '',
    preview_header: 'Special Celebration',
    preview_tag: 'NORDIC CLEAN',
    gradient: 'from-sky-50 via-slate-50 to-cyan-50',
    border_accent: 'border-sky-300',
    header_color: 'text-sky-950',
    couple_color: 'text-sky-900',
    tag_color: 'text-sky-600',
    icon_type: 'sparkles'
  },
  {
    id: 'tpl-7',
    name: 'Rustic Autumn',
    category: 'rustic',
    nuxt_component: 'TemplateRusticAutumn',
    thumbnail_url: '',
    preview_header: 'Together Forever',
    preview_tag: 'RUSTIC AUTUMN',
    gradient: 'from-orange-50 via-amber-50/70 to-yellow-50',
    border_accent: 'border-amber-400',
    header_color: 'text-amber-950',
    couple_color: 'text-amber-900',
    tag_color: 'text-amber-700',
    icon_type: 'leaf'
  },
  {
    id: 'tpl-8',
    name: 'Golden Islamic',
    category: 'islamic',
    nuxt_component: 'TemplateGoldenIslamic',
    thumbnail_url: '',
    preview_header: 'Walimatul Ursy',
    preview_tag: 'GOLDEN ISLAMIC',
    gradient: 'from-emerald-50 via-green-50/50 to-amber-100/50',
    border_accent: 'border-emerald-400',
    header_color: 'text-emerald-950',
    couple_color: 'text-emerald-900',
    tag_color: 'text-emerald-700',
    icon_type: 'star'
  }
]

// Dynamic templates fetched from Database
const availableTemplates = ref<any[]>([...defaultTemplatesFallback])
const loadingTemplates = ref(true)

async function fetchDatabaseTemplates() {
  loadingTemplates.value = true
  try {
    const res = await templateService.getPublicTemplates({ is_active: true, per_page: 50 })
    const list = res?.data || (Array.isArray(res) ? res : [])
    if (Array.isArray(list) && list.length > 0) {
      availableTemplates.value = list.map((t: any) => ({
        id: t.id,
        name: t.name,
        category: (t.category || 'classic').toLowerCase(),
        nuxt_component: t.nuxt_component,
        thumbnail_url: t.thumbnail_url || '',
        preview_header: (t.name || '').toLowerCase().includes('wedding') ? 'Wedding Invitation' : 'The Wedding Of',
        preview_tag: (t.name || 'TEMPLATE').toUpperCase(),
        gradient: getCategoryGradient(t.category),
        border_accent: getCategoryBorder(t.category),
        header_color: 'text-gray-900',
        couple_color: 'text-gray-800',
        tag_color: 'text-gray-600',
        icon_type: getCategoryIconType(t.category)
      }))

      // If form.theme is already populated, synchronize selection
      if (form.value.theme.template_component || form.value.theme.template_id) {
        const found = availableTemplates.value.find(
          tpl => tpl.id === form.value.theme.template_id || tpl.nuxt_component === form.value.theme.template_component
        )
        if (found) {
          form.value.theme.template_id = found.id
          form.value.theme.template_component = found.nuxt_component
        }
      }
    }
  } catch (err) {
    console.warn('Failed to fetch templates from database API, using fallback templates:', err)
  } finally {
    loadingTemplates.value = false
  }
}

// Search, Filter, and Pagination for Template Selection
const templateSearch = ref('')
const selectedTemplateCategory = ref('all')
const templateCurrentPage = ref(1)
const templatePageSize = 6

const templateCategories = computed(() => {
  const catSet = new Set<string>()
  availableTemplates.value.forEach(tpl => {
    if (tpl.category) catSet.add(tpl.category.toLowerCase())
  })

  const list: Array<{ id: string; label: string }> = [{ id: 'all', label: t('cat_all') }]
  catSet.forEach(c => {
    const key = `cat_${c}`
    const label = t(key) !== key ? t(key) : (c.charAt(0).toUpperCase() + c.slice(1))
    list.push({ id: c, label })
  })
  return list
})

const categoryCounts = computed(() => {
  const counts: Record<string, number> = { all: availableTemplates.value.length }
  availableTemplates.value.forEach(tpl => {
    if (tpl.category) {
      const c = tpl.category.toLowerCase()
      counts[c] = (counts[c] || 0) + 1
    }
  })
  return counts
})

const filteredTemplates = computed(() => {
  let list = availableTemplates.value

  // Filter by category
  if (selectedTemplateCategory.value && selectedTemplateCategory.value !== 'all') {
    list = list.filter(tpl => (tpl.category || '').toLowerCase() === selectedTemplateCategory.value.toLowerCase())
  }

  // Filter by search query
  const q = templateSearch.value.trim().toLowerCase()
  if (q) {
    list = list.filter(tpl => {
      const nameMatch = (tpl.name || '').toLowerCase().includes(q)
      const compMatch = (tpl.nuxt_component || '').toLowerCase().includes(q)
      const catMatch = (tpl.category || '').toLowerCase().includes(q)
      return nameMatch || compMatch || catMatch
    })
  }

  return list
})

const totalTemplatePages = computed(() => {
  return Math.ceil(filteredTemplates.value.length / templatePageSize) || 1
})

const paginatedTemplates = computed(() => {
  const start = (templateCurrentPage.value - 1) * templatePageSize
  return filteredTemplates.value.slice(start, start + templatePageSize)
})

watch([templateSearch, selectedTemplateCategory], () => {
  templateCurrentPage.value = 1
})

// State to track if template has already been saved and is permanently locked
const hasSubmittedInvitation = ref(false)
const originalTemplateTheme = ref<{ template_id: string; template_component: string } | null>(null)

const isTemplateLocked = computed(() => {
  if (hasSubmittedInvitation.value) return true
  const inv = verifyData.value?.invitation
  if (!inv) return false

  // Only lock if the invitation ALREADY has client submitted couple names or event details
  const hasGroom = Boolean(inv.groom && (inv.groom.full_name?.trim() || inv.groom.nickname?.trim()))
  const hasBride = Boolean(inv.bride && (inv.bride.full_name?.trim() || inv.bride.nickname?.trim()))
  const hasEvent = Boolean(inv.event && (inv.event.akad_date || inv.event.reception_date || inv.event.venue_name?.trim() || inv.event.address?.trim()))
  const hasSavedContent = (hasGroom || hasBride) && (hasEvent || (hasGroom && hasBride))

  return Boolean(hasSavedContent && (originalTemplateTheme.value?.template_component || inv.theme?.template_component))
})

function isTemplateSelected(tpl: { id?: string; nuxt_component?: string }) {
  if (!tpl) return false
  return (
    form.value.theme.template_component === tpl.nuxt_component ||
    form.value.theme.template_id === tpl.id ||
    form.value.theme.template_id === tpl.nuxt_component
  )
}

// Reactive Form State
const form = ref({
  title: '',
  slug: '',
  groom: {
    full_name: '',
    nickname: '',
    parents: '',
    instagram: ''
  },
  bride: {
    full_name: '',
    nickname: '',
    parents: '',
    instagram: ''
  },
  event: {
    // Akad Nikah
    akad_date: '',
    akad_time: '',
    akad_time_start: '08:00',
    akad_time_end: '10:00',
    akad_is_until_end: false,
    akad_timezone: 'WIB',

    // Resepsi
    reception_date: '',
    reception_time: '',
    reception_time_start: '11:00',
    reception_time_end: '13:00',
    reception_is_until_end: false,
    reception_timezone: 'WIB',

    // Lokasi (Sama vs Beda)
    is_same_location: true,
    venue_name: '',
    address: '',
    maps_url: '',
    akad_venue_name: '',
    akad_address: '',
    akad_maps_url: '',
    reception_venue_name: '',
    reception_address: '',
    reception_maps_url: ''
  },
  theme: {
    template_id: 'tpl-1',
    template_component: 'TemplateRomanticFloral',
    primary_color: '#B76E79'
  },
  story: '',
  gallery: [''],
  gifts: [
    {
      id: 'gift-1',
      bank_name: 'BCA',
      account_number: '',
      account_holder: '',
      notes: ''
    }
  ]
})

// Time Summary Computed
const akadTimeSummary = computed(() => {
  if (!form.value.event.akad_time_start) return t('time_not_set')
  if (form.value.event.akad_is_until_end) {
    return `${t('at_time')} ${form.value.event.akad_time_start} ${form.value.event.akad_timezone} - ${t('until_finish')}`
  }
  return `${t('at_time')} ${form.value.event.akad_time_start} - ${form.value.event.akad_time_end || t('until_finish')} ${form.value.event.akad_timezone}`
})

const receptionTimeSummary = computed(() => {
  if (!form.value.event.reception_time_start) return t('time_not_set')
  if (form.value.event.reception_is_until_end) {
    return `${t('at_time')} ${form.value.event.reception_time_start} ${form.value.event.reception_timezone} - ${t('until_finish')}`
  }
  return `${t('at_time')} ${form.value.event.reception_time_start} - ${form.value.event.reception_time_end || t('until_finish')} ${form.value.event.reception_timezone}`
})

function setAkadPreset(start: string, end: string, isUntilEnd: boolean) {
  form.value.event.akad_time_start = start
  form.value.event.akad_time_end = end
  form.value.event.akad_is_until_end = isUntilEnd
}

function setReceptionPreset(start: string, end: string, isUntilEnd: boolean) {
  form.value.event.reception_time_start = start
  form.value.event.reception_time_end = end
  form.value.event.reception_is_until_end = isUntilEnd
}

function addGiftAccount() {
  form.value.gifts.push({
    id: `gift-${Date.now()}`,
    bank_name: 'BCA',
    account_number: '',
    account_holder: form.value.groom.full_name || form.value.bride.full_name || '',
    notes: ''
  })
}

function removeGiftAccount(index: number) {
  if (form.value.gifts.length > 1) {
    form.value.gifts.splice(index, 1)
  }
}

// Dynamic Features Config from verify response
const features = computed(() => {
  return verifyData.value?.features_config || {
    has_story: true,
    has_gallery: true,
    gallery_limit: 10,
    has_gift: true,
    has_countdown: true,
    has_maps: true,
    has_rsvp: true,
    has_qr: true
  }
})

// QR Scanner Feature Availability & URLs
const hasQrFeature = computed(() => {
  return Boolean(
    features.value?.has_qr ||
    verifyData.value?.features_config?.has_qr ||
    verifyData.value?.package?.features_config?.has_qr ||
    verifyData.value?.order?.package?.features_config?.has_qr ||
    verifyData.value?.scanner_token ||
    verifyData.value?.order?.scanner_token ||
    verifyData.value?.scanner_link ||
    verifyData.value?.order?.scanner_link
  )
})

const scannerUrl = computed(() => {
  const tokenVal = verifyData.value?.scanner_token || verifyData.value?.order?.scanner_token
  const linkVal = verifyData.value?.scanner_link || verifyData.value?.order?.scanner_link
  if (linkVal) return linkVal
  if (tokenVal && typeof window !== 'undefined') {
    return `${window.location.origin}/checkin/scanner/${tokenVal}`
  }
  const orderId = verifyData.value?.order?.id
  if (orderId && typeof window !== 'undefined') {
    return `${window.location.origin}/checkin/${orderId}/scanner`
  }
  if (typeof window !== 'undefined' && rawToken.value) {
    return `${window.location.origin}/checkin/scanner?token=${encodeURIComponent(rawToken.value)}`
  }
  return '#'
})

async function copyScannerUrl() {
  if (!scannerUrl.value || scannerUrl.value === '#') return
  try {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(scannerUrl.value)
      toast.success(t('toast_scanner_copied'))
    } else {
      toast.success(`URL: ${scannerUrl.value}`)
    }
  } catch {
    toast.error('Gagal menyalin tautan scanner.')
  }
}

const galleryLimit = computed(() => {
  return features.value.gallery_limit || 10
})

function selectTemplate(tpl: (typeof availableTemplates.value)[0]) {
  if (isTemplateLocked.value) {
    toast.error(t('locked_template_notice'))
    return
  }
  form.value.theme.template_id = tpl.id
  form.value.theme.template_component = tpl.nuxt_component
}

function addGalleryRow() {
  if (form.value.gallery.length < galleryLimit.value) {
    form.value.gallery.push('')
  }
}

function removeGalleryRow(index: number) {
  if (form.value.gallery.length > 1) {
    form.value.gallery.splice(index, 1)
  } else {
    form.value.gallery[0] = ''
  }
}

async function verifyClientAccess() {
  const token = rawToken.value.trim()
  if (!token) {
    checkingToken.value = false
    authError.value = true
    authErrorMessage.value = 'Token akses tidak ditemukan pada URL. Mohon gunakan link resmi yang Anda terima.'
    return
  }

  checkingToken.value = true
  authError.value = false

  try {
    const res = await clientSetupService.verifyToken(token)
    verifyData.value = res

    // Persist token in cookie for subsequent requests
    tokenCookie.value = token

    // Pre-populate if client or invitation data already exists
    if (res.client?.name && !form.value.groom.full_name && !form.value.bride.full_name) {
      const parts = res.client.name.split('&').map(s => s.trim())
      if (parts.length >= 2) {
        form.value.groom.nickname = parts[0]
        form.value.bride.nickname = parts[1]
      }
    }

    if (res.invitation) {
      const inv = res.invitation
      if (inv.title) form.value.title = inv.title
      if (inv.slug) form.value.slug = inv.slug
      if (inv.groom) form.value.groom = { ...form.value.groom, ...inv.groom }
      if (inv.bride) form.value.bride = { ...form.value.bride, ...inv.bride }
      if (inv.event) {
        form.value.event = {
          ...form.value.event,
          ...inv.event,
          is_same_location: inv.event.is_same_location ?? true
        }
      }
      if (inv.theme) {
        form.value.theme = { ...form.value.theme, ...inv.theme }
        const matched = availableTemplates.value.find(
          t => t.nuxt_component === inv.theme.template_component || t.id === inv.theme.template_id
        )
        if (matched) {
          form.value.theme.template_id = matched.id
          form.value.theme.template_component = matched.nuxt_component
        }

        const hasGroom = Boolean(inv.groom && (inv.groom.full_name?.trim() || inv.groom.nickname?.trim()))
        const hasBride = Boolean(inv.bride && (inv.bride.full_name?.trim() || inv.bride.nickname?.trim()))
        const hasEvent = Boolean(inv.event && (inv.event.akad_date || inv.event.reception_date || inv.event.venue_name?.trim() || inv.event.address?.trim()))
        const hasSavedContent = (hasGroom || hasBride) && (hasEvent || (hasGroom && hasBride))

        // Only pre-lock originalTemplateTheme if invitation has previously saved client content
        if (hasSavedContent && (inv.theme.template_component || inv.theme.template_id)) {
          originalTemplateTheme.value = {
            template_id: form.value.theme.template_id,
            template_component: form.value.theme.template_component
          }
        }
      }
      if (Array.isArray(inv.gallery) && inv.gallery.length > 0) form.value.gallery = [...inv.gallery]

      // Populate gifts
      if (Array.isArray(inv.gifts) && inv.gifts.length > 0) {
        form.value.gifts = inv.gifts.map((g: any, idx: number) => ({
          id: g.id || `gift-${idx}`,
          bank_name: g.bank_name || '',
          account_number: g.account_number || '',
          account_holder: g.account_holder || '',
          notes: g.notes || ''
        }))
      } else if (inv.gift && (inv.gift.bank_name || inv.gift.account_number)) {
        form.value.gifts = [
          {
            id: 'gift-1',
            bank_name: inv.gift.bank_name || '',
            account_number: inv.gift.account_number || '',
            account_holder: inv.gift.account_holder || '',
            notes: ''
          }
        ]
      }
    }
  } catch (err: any) {
    authError.value = true
    authErrorMessage.value = handleApiError(err).message || t('invalid_token_default')
  } finally {
    checkingToken.value = false
  }
}

async function handleSaveInvitation() {
  // Validate basic required fields
  if (!form.value.groom.full_name || !form.value.bride.full_name) {
    toast.error(t('toast_fill_couple'))
    activeTab.value = 'bride_groom'
    return
  }

  const token = rawToken.value.trim()
  if (!token) {
    toast.error(t('toast_invalid_token'))
    return
  }

  saving.value = true
  try {
    // Generate standardized time strings
    form.value.event.akad_time = akadTimeSummary.value
    form.value.event.reception_time = receptionTimeSummary.value

    // Auto-sync locations based on toggle
    if (form.value.event.is_same_location) {
      form.value.event.akad_venue_name = form.value.event.venue_name
      form.value.event.akad_address = form.value.event.address
      form.value.event.akad_maps_url = form.value.event.maps_url
      form.value.event.reception_venue_name = form.value.event.venue_name
      form.value.event.reception_address = form.value.event.address
      form.value.event.reception_maps_url = form.value.event.maps_url
    } else {
      form.value.event.venue_name = form.value.event.reception_venue_name || form.value.event.akad_venue_name
      form.value.event.address = form.value.event.reception_address || form.value.event.akad_address
      form.value.event.maps_url = form.value.event.reception_maps_url || form.value.event.akad_maps_url
    }

    const validGifts = form.value.gifts.filter(g => g.bank_name.trim() !== '' || g.account_number.trim() !== '')

    const groomNick = form.value.groom.nickname || form.value.groom.full_name || 'Pria'
    const brideNick = form.value.bride.nickname || form.value.bride.full_name || 'Wanita'
    const title = form.value.title || `Pernikahan ${groomNick} & ${brideNick}`
    const slug = form.value.slug || `${groomNick}-${brideNick}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Strict enforcement: if template is locked, preserve original template theme
    if (isTemplateLocked.value && originalTemplateTheme.value?.template_component) {
      form.value.theme.template_id = originalTemplateTheme.value.template_id || form.value.theme.template_id
      form.value.theme.template_component = originalTemplateTheme.value.template_component
    }

    const payload = {
      title,
      slug,
      groom: { ...form.value.groom },
      bride: { ...form.value.bride },
      event: { ...form.value.event },
      theme: { ...form.value.theme },
      story: form.value.story,
      gallery: form.value.gallery.filter(link => link.trim() !== ''),
      gift: validGifts.length > 0 ? { ...validGifts[0] } : { bank_name: '', account_number: '', account_holder: '' },
      gifts: validGifts.map(g => ({ ...g }))
    }

    const saveRes = await clientSetupService.saveInvitation(token, payload)
    
    // Mark template as permanently locked upon first successful save
    hasSubmittedInvitation.value = true
    if (!originalTemplateTheme.value) {
      originalTemplateTheme.value = {
        template_id: form.value.theme.template_id,
        template_component: form.value.theme.template_component
      }
    }

    if (saveRes?.is_local_fallback) {
      toast.info(t('toast_local_fallback'))
    } else {
      toast.success(t('toast_save_success'))
    }
  } catch (err: any) {
    toast.error(handleApiError(err).message || t('toast_save_error'))
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await fetchDatabaseTemplates()
  verifyClientAccess()
})
</script>
