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
            <h1 class="text-base font-bold text-gray-900 leading-tight">Setup Undangan Digital</h1>
            <p class="text-xs text-gray-500">Harsava Wedding Invitation Portal</p>
          </div>
        </div>

        <div v-if="verifyData?.package" class="hidden sm:flex items-center gap-2">
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {{ verifyData.package.name }}
          </span>
        </div>
      </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <!-- Loading State -->
      <div v-if="checkingToken" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center my-8">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
        <h2 class="text-base font-semibold text-gray-900">Memverifikasi Akses Klien...</h2>
        <p class="text-xs text-gray-500 mt-1">Mohon tunggu selagi kami memvalidasi token akses Anda.</p>
      </div>

      <!-- Invalid Token / Error State -->
      <div v-else-if="authError" class="bg-white rounded-2xl shadow-sm border border-red-100 p-8 sm:p-12 text-center my-8 max-w-lg mx-auto">
        <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Link Akses Tidak Valid</h2>
        <p class="text-sm text-gray-600 mb-6">
          {{ authErrorMessage || 'Token akses tidak ditemukan atau link sudah kedaluwarsa. Silakan periksa kembali link yang Anda terima melalui WhatsApp atau email.' }}
        </p>
        <NuxtLink
          to="/"
          class="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
        >
          Kembali ke Beranda
        </NuxtLink>
      </div>

      <!-- Setup Form (Authorized) -->
      <div v-else>
        <!-- Welcome Banner -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mb-6 shadow-sm">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span class="text-xs uppercase font-bold tracking-wider text-blue-200">Portal Klien</span>
              <h2 class="text-xl sm:text-2xl font-bold mt-0.5">
                Selamat Datang, {{ verifyData?.client?.name || 'Calon Mempelai' }}!
              </h2>
              <p class="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
                Lengkapi formulir di bawah ini untuk memulai pembuatan dan kustomisasi undangan digital Anda.
              </p>
            </div>
            <div v-if="verifyData?.package" class="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs border border-white/20">
              <span class="text-blue-200 block text-[10px] uppercase font-bold">Paket Aktif</span>
              <span class="font-bold text-white">{{ verifyData.package.name }}</span>
            </div>
          </div>
        </div>

        <!-- Navigation Stepper Tabs (Mobile Friendly) -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            @click="activeTab = tab.id"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border"
            :class="activeTab === tab.id
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'"
          >
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-[11px]" :class="activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'">
              {{ tab.step }}
            </span>
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <!-- Form Sections Container -->
        <form @submit.prevent="handleSaveInvitation" class="space-y-6">
          <!-- SECTION 1: DATA MEMPELAI -->
          <div v-show="activeTab === 'bride_groom'" class="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 sm:p-8 space-y-8">
            <div>
              <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </span>
                Data Calon Mempelai
              </h3>
              <p class="text-xs text-gray-500 mt-1">Masukkan informasi lengkap pasangan pengantin pria dan wanita.</p>
            </div>

            <!-- Mempelai Pria -->
            <div class="border-t border-gray-100 pt-6">
              <h4 class="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <span>🤵</span> Mempelai Pria (Groom)
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap Pria <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.groom.full_name"
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Dimas Pratama, S.T."
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Nama Panggilan Pria <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.groom.nickname"
                    type="text"
                    required
                    placeholder="Contoh: Dimas"
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Nama Orang Tua Pria</label>
                  <input
                    v-model="form.groom.parents"
                    type="text"
                    placeholder="Putra dari Bpk. Bambang & Ibu Sri"
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Akun Instagram Pria</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                    <input
                      v-model="form.groom.instagram"
                      type="text"
                      placeholder="dimaspratama"
                      class="w-full rounded-xl border border-gray-300 pl-8 pr-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Mempelai Wanita -->
            <div class="border-t border-gray-100 pt-6">
              <h4 class="text-sm font-bold text-pink-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <span>👰</span> Mempelai Wanita (Bride)
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap Wanita <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.bride.full_name"
                    type="text"
                    required
                    placeholder="Contoh: Anisa Rahmawati, S.Ked."
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Nama Panggilan Wanita <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.bride.nickname"
                    type="text"
                    required
                    placeholder="Contoh: Anisa"
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Nama Orang Tua Wanita</label>
                  <input
                    v-model="form.bride.parents"
                    type="text"
                    placeholder="Putri dari Bpk. Haryono & Ibu Endang"
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Akun Instagram Wanita</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                    <input
                      v-model="form.bride.instagram"
                      type="text"
                      placeholder="anisarahma"
                      class="w-full rounded-xl border border-gray-300 pl-8 pr-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 2: DATA ACARA -->
          <div v-show="activeTab === 'event_details'" class="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 sm:p-8 space-y-8">
            <div>
              <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                Data Waktu & Lokasi Acara
              </h3>
              <p class="text-xs text-gray-500 mt-1">Tentukan jadwal prosesi akad nikah / pemberkatan serta resepsi.</p>
            </div>

            <!-- Akad Nikah / Pemberkatan -->
            <div class="border-t border-gray-100 pt-6">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-sm font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span>💍</span> Akad Nikah / Pemberkatan
                </h4>
                <span class="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {{ akadTimeSummary }}
                </span>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Tanggal Akad <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.event.akad_date"
                    type="date"
                    required
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Waktu Prosesi Akad <span class="text-red-500">*</span></label>
                  <div class="flex items-center gap-2">
                    <div class="flex-1">
                      <input
                        v-model="form.event.akad_time_start"
                        type="time"
                        required
                        class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <span class="text-xs text-gray-500 font-semibold">s/d</span>
                    <div class="flex-1">
                      <input
                        v-model="form.event.akad_time_end"
                        type="time"
                        :disabled="form.event.akad_is_until_end"
                        class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </div>
                    <select
                      v-model="form.event.akad_timezone"
                      class="rounded-xl border border-gray-300 px-2.5 py-2 text-xs font-semibold bg-white text-gray-700 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="WIB">WIB</option>
                      <option value="WITA">WITA</option>
                      <option value="WIT">WIT</option>
                    </select>
                  </div>
                  <div class="mt-2 flex items-center justify-between">
                    <label class="inline-flex items-center gap-2 cursor-pointer text-xs text-gray-600">
                      <input
                        type="checkbox"
                        v-model="form.event.akad_is_until_end"
                        class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Sampai Selesai</span>
                    </label>
                    <div class="flex gap-1">
                      <button
                        type="button"
                        @click="setAkadPreset('08:00', '10:00', false)"
                        class="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        08:00 - 10:00
                      </button>
                      <button
                        type="button"
                        @click="setAkadPreset('09:00', '11:00', false)"
                        class="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        09:00 - 11:00
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resepsi Pernikahan -->
            <div class="border-t border-gray-100 pt-6">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-sm font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🎉</span> Resepsi Pernikahan
                </h4>
                <span class="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                  {{ receptionTimeSummary }}
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Tanggal Resepsi <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.event.reception_date"
                    type="date"
                    required
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Waktu Resepsi <span class="text-red-500">*</span></label>
                  <div class="flex items-center gap-2">
                    <div class="flex-1">
                      <input
                        v-model="form.event.reception_time_start"
                        type="time"
                        required
                        class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <span class="text-xs text-gray-500 font-semibold">s/d</span>
                    <div class="flex-1">
                      <input
                        v-model="form.event.reception_time_end"
                        type="time"
                        :disabled="form.event.reception_is_until_end"
                        class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </div>
                    <select
                      v-model="form.event.reception_timezone"
                      class="rounded-xl border border-gray-300 px-2.5 py-2 text-xs font-semibold bg-white text-gray-700 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="WIB">WIB</option>
                      <option value="WITA">WITA</option>
                      <option value="WIT">WIT</option>
                    </select>
                  </div>
                  <div class="mt-2 flex items-center justify-between">
                    <label class="inline-flex items-center gap-2 cursor-pointer text-xs text-gray-600">
                      <input
                        type="checkbox"
                        v-model="form.event.reception_is_until_end"
                        class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Sampai Selesai</span>
                    </label>
                    <div class="flex gap-1">
                      <button
                        type="button"
                        @click="setReceptionPreset('11:00', '13:00', false)"
                        class="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        11:00 - 13:00
                      </button>
                      <button
                        type="button"
                        @click="setReceptionPreset('18:30', '21:00', false)"
                        class="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        18:30 - 21:00
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lokasi & Peta -->
            <div class="border-t border-gray-100 pt-6">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h4 class="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📍</span> Lokasi Acara & Navigasi Maps
                  </h4>
                  <p class="text-xs text-gray-500 mt-0.5">Tentukan lokasi akad dan resepsi (apakah sama atau berbeda tempat).</p>
                </div>

                <!-- Toggle Sama / Beda Lokasi -->
                <div class="flex items-center gap-2 p-1.5 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    @click="form.event.is_same_location = true"
                    class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                    :class="form.event.is_same_location ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'"
                  >
                    1 Lokasi (Sama)
                  </button>
                  <button
                    type="button"
                    @click="form.event.is_same_location = false"
                    class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                    :class="!form.event.is_same_location ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'"
                  >
                    2 Lokasi (Beda)
                  </button>
                </div>
              </div>

              <!-- JIKA 1 LOKASI (SAMA) -->
              <div v-if="form.event.is_same_location" class="space-y-4 bg-gray-50/70 p-4 sm:p-5 rounded-2xl border border-gray-200">
                <div class="flex items-center gap-2 text-xs font-bold text-blue-800 mb-1">
                  <span>🏛️</span>
                  <span>Lokasi Akad & Resepsi (Bersama)</span>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Nama Tempat / Gedung / Masjid <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.event.venue_name"
                    type="text"
                    required
                    placeholder="Contoh: Grand Ballroom Hotel Mulia Senayan"
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Alamat Lengkap <span class="text-red-500">*</span></label>
                  <textarea
                    v-model="form.event.address"
                    rows="2"
                    required
                    placeholder="Jl. Asia Afrika No. 8, Gelora, Tanah Abang, Jakarta Pusat"
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Link Google Maps (URL Navigasi)</label>
                  <input
                    v-model="form.event.maps_url"
                    type="url"
                    placeholder="https://maps.app.goo.gl/..."
                    class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                  <p class="text-[11px] text-gray-500 mt-1">
                    Buka Google Maps, cari lokasi acara, klik Bagikan (Share) lalu salin tautan singkatnya.
                  </p>
                </div>
              </div>

              <!-- JIKA BEDA LOKASI (2 LOKASI) -->
              <div v-else class="space-y-6">
                <!-- Lokasi Akad -->
                <div class="space-y-4 bg-emerald-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-200">
                  <div class="flex items-center gap-2 text-xs font-bold text-emerald-800 mb-1">
                    <span>💍</span>
                    <span>1. Lokasi Akad Nikah / Pemberkatan</span>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Nama Tempat / Masjid / Gereja <span class="text-red-500">*</span></label>
                    <input
                      v-model="form.event.akad_venue_name"
                      type="text"
                      required
                      placeholder="Contoh: Masjid Agung Al-Azhar Kebayoran Baru"
                      class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Alamat Lengkap Akad <span class="text-red-500">*</span></label>
                    <textarea
                      v-model="form.event.akad_address"
                      rows="2"
                      required
                      placeholder="Jl. Sisingamangaraja No. 1, Selong, Kebayoran Baru, Jakarta Selatan"
                      class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Link Google Maps Lokasi Akad</label>
                    <input
                      v-model="form.event.akad_maps_url"
                      type="url"
                      placeholder="https://maps.app.goo.gl/..."
                      class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                <!-- Lokasi Resepsi -->
                <div class="space-y-4 bg-indigo-50/50 p-4 sm:p-5 rounded-2xl border border-indigo-200">
                  <div class="flex items-center gap-2 text-xs font-bold text-indigo-800 mb-1">
                    <span>🎉</span>
                    <span>2. Lokasi Resepsi Pernikahan</span>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Nama Gedung / Hotel / Ballroom <span class="text-red-500">*</span></label>
                    <input
                      v-model="form.event.reception_venue_name"
                      type="text"
                      required
                      placeholder="Contoh: Grand Ballroom Hotel Mulia Senayan"
                      class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Alamat Lengkap Resepsi <span class="text-red-500">*</span></label>
                    <textarea
                      v-model="form.event.reception_address"
                      rows="2"
                      required
                      placeholder="Jl. Asia Afrika No. 8, Gelora, Tanah Abang, Jakarta Pusat"
                      class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Link Google Maps Lokasi Resepsi</label>
                    <input
                      v-model="form.event.reception_maps_url"
                      type="url"
                      placeholder="https://maps.app.goo.gl/..."
                      class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 3: TEMA & DESAIN -->
          <div v-show="activeTab === 'theme_design'" class="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 sm:p-8 space-y-8">
            <div>
              <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4 4 4 0 014-4h4a4 4 0 014 4 4 4 0 01-4 4H7zm0 0l9.657-9.657a2 2 0 012.828 0l1.414 1.414a2 2 0 010 2.828L11 21H7z" />
                  </svg>
                </span>
                Pilihan Tema & Desain
              </h3>
              <p class="text-xs text-gray-500 mt-1">Pilih template desain undangan dan atur warna aksen utama.</p>
            </div>

            <!-- Template Picker -->
            <div class="border-t border-gray-100 pt-6">
              <label class="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
                Pilih Template Desain <span class="text-red-500">*</span>
              </label>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  v-for="tpl in availableTemplates"
                  :key="tpl.id"
                  @click="selectTemplate(tpl)"
                  class="relative cursor-pointer rounded-2xl border-2 p-3 transition-all flex flex-col justify-between"
                  :class="form.theme.template_component === tpl.nuxt_component
                    ? 'border-blue-600 bg-blue-50/40 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'"
                >
                  <div class="aspect-4/3 rounded-xl bg-gray-100 overflow-hidden mb-3 border border-gray-200 flex items-center justify-center">
                    <img
                      v-if="tpl.thumbnail_url"
                      :src="tpl.thumbnail_url"
                      :alt="tpl.name"
                      class="w-full h-full object-cover"
                      @error="(e: any) => e.target.style.display = 'none'"
                    />
                    <span v-else class="text-xs text-gray-400 font-medium">Preview Desain</span>
                  </div>

                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-bold text-sm text-gray-900">{{ tpl.name }}</div>
                      <div class="text-[11px] text-gray-500 font-mono">{{ tpl.nuxt_component }}</div>
                    </div>
                    <div
                      class="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                      :class="form.theme.template_component === tpl.nuxt_component ? 'bg-blue-600 text-white' : 'border border-gray-300'"
                    >
                      <svg v-if="form.theme.template_component === tpl.nuxt_component" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Color Picker -->
            <div class="border-t border-gray-100 pt-6">
              <label class="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                Warna Aksen Utama (Primary Color)
              </label>
              <p class="text-xs text-gray-500 mb-4">
                Warna ini akan menjadi aksen tombol, judul, dan dekorasi pada undangan digital Anda.
              </p>

              <div class="flex flex-wrap items-center gap-3 mb-4">
                <button
                  v-for="preset in colorPresets"
                  :key="preset.hex"
                  type="button"
                  @click="form.theme.primary_color = preset.hex"
                  class="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all"
                  :class="form.theme.primary_color.toLowerCase() === preset.hex.toLowerCase()
                    ? 'border-gray-900 bg-gray-50 font-bold shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'"
                >
                  <span class="w-4 h-4 rounded-full border border-black/10" :style="{ backgroundColor: preset.hex }" />
                  <span>{{ preset.name }}</span>
                </button>
              </div>

              <!-- Native Color Picker & Hex Input -->
              <div class="flex items-center gap-3">
                <div class="relative w-11 h-11 rounded-xl border border-gray-300 overflow-hidden cursor-pointer shadow-xs">
                  <input
                    v-model="form.theme.primary_color"
                    type="color"
                    class="absolute -inset-2 w-16 h-16 cursor-pointer"
                  />
                </div>
                <div class="w-36">
                  <input
                    v-model="form.theme.primary_color"
                    type="text"
                    placeholder="#B76E79"
                    class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <span class="text-xs text-gray-500">Pilih warna kustom dengan color picker</span>
              </div>
            </div>
          </div>

          <!-- SECTION 4: FITUR DINAMIS (v-if based on features_config) -->
          <div v-show="activeTab === 'features_dynamic'" class="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 sm:p-8 space-y-8">
            <div>
              <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </span>
                Fitur Paket & Konten Tambahan
              </h3>
              <p class="text-xs text-gray-500 mt-1">
                Formulir berikut aktif secara dinamis menyesuaikan paket langganan Anda.
              </p>
            </div>

            <!-- Love Story Feature -->
            <div v-if="features.has_story" class="border-t border-gray-100 pt-6">
              <div class="flex items-center justify-between mb-3">
                <label class="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📖</span> Kisah Cinta / Love Story
                </label>
                <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Fitur Aktif
                </span>
              </div>
              <p class="text-xs text-gray-500 mb-3">
                Ceritakan kisah perjalanan cinta Anda berdua (awal perkenalan, momen berkesan, hingga lamaran).
              </p>
              <textarea
                v-model="form.story"
                rows="5"
                placeholder="Tuliskan kisah cinta Anda di sini..."
                class="w-full rounded-xl border border-gray-300 p-3.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <!-- Photo Gallery Feature -->
            <div v-if="features.has_gallery" class="border-t border-gray-100 pt-6">
              <div class="flex items-center justify-between mb-3">
                <label class="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📸</span> Galeri Foto (Google Drive Links)
                </label>
                <span class="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Maks. {{ galleryLimit }} Foto
                </span>
              </div>
              <p class="text-xs text-gray-500 mb-4">
                Sematkan tautan publik foto prewedding dari Google Drive / direct link gambar (Pastikan akses diset "Siapa saja yang memiliki link").
              </p>

              <!-- Dynamic Gallery Rows -->
              <div class="space-y-3">
                <div
                  v-for="(link, index) in form.gallery"
                  :key="index"
                  class="flex items-center gap-2"
                >
                  <span class="w-6 text-xs font-semibold text-gray-400 text-center">{{ index + 1 }}.</span>
                  <input
                    v-model="form.gallery[index]"
                    type="url"
                    placeholder="https://drive.google.com/file/d/... atau https://..."
                    class="flex-1 rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    @click="removeGalleryRow(index)"
                    class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus baris foto"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  :disabled="form.gallery.length >= galleryLimit"
                  @click="addGalleryRow"
                  class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-blue-300 text-blue-600 bg-blue-50/50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Link Foto ({{ form.gallery.length }} / {{ galleryLimit }})
                </button>
              </div>
            </div>

            <!-- Digital Gift / Amplop Feature -->
            <div v-if="features.has_gift" class="border-t border-gray-100 pt-6">
              <div class="flex items-center justify-between mb-3">
                <label class="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🎁</span> Amplop Digital & Hadiah Pernikahan
                </label>
                <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Fitur Aktif
                </span>
              </div>
              <p class="text-xs text-gray-500 mb-4">
                Informasi rekening bank atau dompet digital untuk para tamu yang ingin mengirimkan hadiah kasih. Anda dapat menambahkan lebih dari 1 rekening/e-wallet.
              </p>

              <!-- List Rekening -->
              <div class="space-y-4">
                <div
                  v-for="(item, index) in form.gifts"
                  :key="item.id || index"
                  class="bg-gray-50/80 p-4 sm:p-5 rounded-2xl border border-gray-200 relative transition-all"
                >
                  <div class="flex items-center justify-between mb-3">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-gray-700 border border-gray-200 shadow-2xs">
                      💳 Rekening / E-Wallet #{{ index + 1 }}
                    </span>
                    <button
                      v-if="form.gifts.length > 1"
                      type="button"
                      @click="removeGiftAccount(index)"
                      class="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Hapus
                    </button>
                  </div>

                  <!-- Quick Bank Select -->
                  <div class="mb-3">
                    <span class="text-[11px] font-semibold text-gray-500 block mb-1.5">Pilihan Cepat:</span>
                    <div class="flex flex-wrap gap-1.5">
                      <button
                        v-for="b in ['BCA', 'Mandiri', 'BRI', 'BNI', 'BSI', 'CIMB Niaga', 'GoPay', 'OVO', 'DANA', 'ShopeePay', 'QRIS']"
                        :key="b"
                        type="button"
                        @click="item.bank_name = b"
                        class="text-[10px] font-medium px-2 py-1 rounded-lg border transition-all"
                        :class="item.bank_name === b ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'"
                      >
                        {{ b }}
                      </button>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 mb-1">Nama Bank / e-Wallet <span class="text-red-500">*</span></label>
                      <input
                        v-model="item.bank_name"
                        type="text"
                        required
                        placeholder="Contoh: BCA / Mandiri / GoPay"
                        class="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 mb-1">Nomor Rekening / No. HP <span class="text-red-500">*</span></label>
                      <input
                        v-model="item.account_number"
                        type="text"
                        required
                        placeholder="1234567890"
                        class="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 mb-1">Atas Nama Pemilik <span class="text-red-500">*</span></label>
                      <input
                        v-model="item.account_holder"
                        type="text"
                        required
                        placeholder="Contoh: Dimas Pratama"
                        class="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>

                  <div class="mt-2.5">
                    <label class="block text-[11px] font-medium text-gray-500 mb-1">Catatan Tambahan (Opsional)</label>
                    <input
                      v-model="item.notes"
                      type="text"
                      placeholder="Contoh: Rekening Mempelai Pria / Khusus Dompet Digital"
                      class="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              <!-- Button Tambah Rekening -->
              <div class="mt-4">
                <button
                  type="button"
                  @click="addGiftAccount"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Tambah Rekening / Dompet Digital Baru</span>
                </button>
              </div>
            </div>

            <!-- Other Active Features Summary -->
            <div class="border-t border-gray-100 pt-6">
              <span class="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
                Fitur Unggulan Lainnya yang Otomatis Aktif
              </span>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div v-if="features.has_countdown" class="flex items-center gap-2 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                  <span class="text-base">⏳</span>
                  <div>
                    <div class="text-xs font-bold text-gray-800">Countdown Timer</div>
                    <div class="text-[10px] text-gray-500">Hitung mundur hari H</div>
                  </div>
                </div>
                <div v-if="features.has_maps" class="flex items-center gap-2 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <span class="text-base">🗺️</span>
                  <div>
                    <div class="text-xs font-bold text-gray-800">Navigasi Maps</div>
                    <div class="text-[10px] text-gray-500">Panduan rute Google Maps</div>
                  </div>
                </div>
                <div v-if="features.has_rsvp" class="flex items-center gap-2 p-3 rounded-xl bg-purple-50/60 border border-purple-100">
                  <span class="text-base">📝</span>
                  <div>
                    <div class="text-xs font-bold text-gray-800">RSVP Online</div>
                    <div class="text-[10px] text-gray-500">Konfirmasi kehadiran tamu</div>
                  </div>
                </div>
                <div v-if="features.has_qr" class="flex items-center gap-2 p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                  <span class="text-base">📲</span>
                  <div>
                    <div class="text-xs font-bold text-gray-800">QR Check-in Tamu</div>
                    <div class="text-[10px] text-gray-500">Sistem buku tamu digital</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>

    <!-- Sticky Bottom Bar -->
    <div v-if="!checkingToken && !authError" class="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40 shadow-lg">
      <div class="max-w-4xl mx-auto flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <button
            v-if="currentTabIndex > 0"
            type="button"
            @click="activeTab = tabs[currentTabIndex - 1].id"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="hidden sm:inline">Sebelumnya</span>
          </button>

          <button
            v-if="currentTabIndex < tabs.length - 1"
            type="button"
            @click="activeTab = tabs[currentTabIndex + 1].id"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1"
          >
            <span>Selanjutnya</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          :disabled="saving"
          @click="handleSaveInvitation"
          class="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 transition-all ml-auto"
        >
          <div v-if="saving" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          <span>{{ saving ? 'Menyimpan Data...' : 'Simpan Data Undangan' }}</span>
        </button>
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

// Token from query parameter
const tokenCookie = useCookie<string>('client_setup_token', { maxAge: 60 * 60 * 24 * 7 })
const rawToken = computed(() => String(route.query.token || route.query.auth || tokenCookie.value || ''))

const checkingToken = ref(true)
const authError = ref(false)
const authErrorMessage = ref('')
const verifyData = ref<ClientAuthVerifyData | null>(null)
const saving = ref(false)

const tabs = [
  { id: 'bride_groom', label: 'Data Mempelai', step: 1 },
  { id: 'event_details', label: 'Waktu & Lokasi', step: 2 },
  { id: 'theme_design', label: 'Tema & Desain', step: 3 },
  { id: 'features_dynamic', label: 'Fitur Tambahan', step: 4 }
]
const activeTab = ref('bride_groom')
const currentTabIndex = computed(() => tabs.findIndex(t => t.id === activeTab.value))

// Color Presets
const colorPresets = [
  { name: 'Rose Gold', hex: '#B76E79' },
  { name: 'Emerald', hex: '#047857' },
  { name: 'Royal Navy', hex: '#1E3A8A' },
  { name: 'Champagne Gold', hex: '#D4AF37' },
  { name: 'Terracotta', hex: '#C2410C' },
  { name: 'Charcoal', hex: '#27272A' }
]

// Available Template Options
const availableTemplates = [
  {
    id: 'tpl-1',
    name: 'Romantic Floral',
    nuxt_component: 'TemplateRomanticFloral',
    thumbnail_url: ''
  },
  {
    id: 'tpl-2',
    name: 'Classic Elegance',
    nuxt_component: 'TemplateClassicElegance',
    thumbnail_url: ''
  },
  {
    id: 'tpl-3',
    name: 'Modern Minimalist',
    nuxt_component: 'TemplateModernMinimalist',
    thumbnail_url: ''
  }
]

// Reactive Form State
const form = ref({
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
  if (!form.value.event.akad_time_start) return 'Waktu belum diatur'
  if (form.value.event.akad_is_until_end) {
    return `Pukul ${form.value.event.akad_time_start} ${form.value.event.akad_timezone} - Selesai`
  }
  return `Pukul ${form.value.event.akad_time_start} - ${form.value.event.akad_time_end || 'Selesai'} ${form.value.event.akad_timezone}`
})

const receptionTimeSummary = computed(() => {
  if (!form.value.event.reception_time_start) return 'Waktu belum diatur'
  if (form.value.event.reception_is_until_end) {
    return `Pukul ${form.value.event.reception_time_start} ${form.value.event.reception_timezone} - Selesai`
  }
  return `Pukul ${form.value.event.reception_time_start} - ${form.value.event.reception_time_end || 'Selesai'} ${form.value.event.reception_timezone}`
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
    has_rsvp: true
  }
})

const galleryLimit = computed(() => {
  return features.value.gallery_limit || 10
})

function selectTemplate(tpl: typeof availableTemplates[0]) {
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
      if (inv.groom) form.value.groom = { ...form.value.groom, ...inv.groom }
      if (inv.bride) form.value.bride = { ...form.value.bride, ...inv.bride }
      if (inv.event) {
        form.value.event = {
          ...form.value.event,
          ...inv.event,
          is_same_location: inv.event.is_same_location ?? true
        }
      }
      if (inv.theme) form.value.theme = { ...form.value.theme, ...inv.theme }
      if (inv.story) form.value.story = inv.story
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
    authErrorMessage.value = handleApiError(err).message || 'Link Akses Tidak Valid atau sudah kedaluwarsa.'
  } finally {
    checkingToken.value = false
  }
}

async function handleSaveInvitation() {
  // Validate basic required fields
  if (!form.value.groom.full_name || !form.value.bride.full_name) {
    toast.error('Mohon lengkapi Nama Mempelai terlebih dahulu.')
    activeTab.value = 'bride_groom'
    return
  }

  const token = rawToken.value.trim()
  if (!token) {
    toast.error('Token akses tidak valid.')
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

    const payload = {
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
    
    if (saveRes?.is_local_fallback) {
      toast.info('Data berhasil disimpan secara lokal di browser Anda (Endpoint backend sedang disiapkan).')
    } else {
      toast.success('Data undangan berhasil disimpan!')
    }
  } catch (err: any) {
    toast.error(handleApiError(err).message || 'Gagal menyimpan data undangan.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  verifyClientAccess()
})
</script>
