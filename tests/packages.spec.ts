import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import PackagesPage from '../app/pages/dashboard/packages/index.vue'

// --- Mocking Nuxt Composables & Modules ---
const mockToast = {
  success: vi.fn(),
  error: vi.fn()
}

const mockPackageService = {
  getPackages: vi.fn(),
  getTrashedPackages: vi.fn(),
  createPackage: vi.fn(),
  updatePackage: vi.fn(),
  deletePackage: vi.fn(),
  restorePackage: vi.fn(),
  forceDeletePackage: vi.fn(),
}

const mockFeatureService = {
  getFeatures: vi.fn()
}

const mockAuthStore = {
  user: {
    id: 'user-1',
    name: 'Super Admin',
    roles: [{ id: 'role-1', name: 'superadmin' }]
  }
}

vi.stubGlobal('useToast', () => mockToast)
vi.stubGlobal('usePackageService', () => mockPackageService)
vi.stubGlobal('useFeatureService', () => mockFeatureService)
vi.stubGlobal('useAuthStore', () => mockAuthStore)
vi.stubGlobal('definePageMeta', vi.fn())
vi.stubGlobal('useHead', vi.fn())

describe('Dashboard Packages - Dynamic Form Generation & CRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPackageService.getPackages.mockResolvedValue({
      data: [
        {
          id: 'pkg-1',
          name: 'Paket Basic',
          price: 150000,
          features_config: { has_gallery: true, gallery_limit: 10 },
          created_at: '2026-10-01T10:00:00Z'
        }
      ],
      meta: { page: 1, per_page: 15, total: 1 }
    })
  })

  /**
   * Skenario 1: Dynamic Render Test
   * Mock API /api/features mengembalikan 2 data: 1 boolean (has_gallery) dan 1 number (gallery_limit).
   * Pastikan komponen merender tepat 1 toggle switch dan 1 input type="number".
   */
  it('1. Dynamic Render Test: harus merender tepat 1 toggle dan 1 number input berdasarkan API features', async () => {
    mockFeatureService.getFeatures.mockResolvedValue([
      { key: 'has_gallery', name: 'Fitur Galeri Foto', input_type: 'boolean', default_value: 'false' },
      { key: 'gallery_limit', name: 'Limit Foto Galeri', input_type: 'number', default_value: '10' }
    ])

    const wrapper = mount(PackagesPage, {
      global: {
        stubs: {
          NuxtLink: true,
          UiConfirmModal: true
        }
      }
    })
    await flushPromises()

    // Buka modal Tambah Paket
    const tambahBtn = wrapper.findAll('button').find(b => b.text().includes('Tambah Baru'))
    expect(tambahBtn).toBeDefined()
    await tambahBtn!.trigger('click')
    await flushPromises()

    // Toggle Galeri Foto harus ada
    const galleryToggle = wrapper.find('input[type="checkbox"]')
    expect(galleryToggle.exists()).toBe(true)

    // Aktifkan toggle galeri agar sub-field input number muncul
    await galleryToggle.setValue(true)
    await flushPromises()

    // Input number batas maksimal foto harus dirender
    const numberInputs = wrapper.findAll('input[type="number"]')
    expect(numberInputs.length).toBe(1)
  })

  /**
   * Skenario 2: State Binding Test (Payload Builder)
   * Simulasikan user mencentang checkbox dan mengisi angka 15 pada input number.
   * Pastikan payload yang dikirim saat submit menjadi: {"has_gallery": true, "gallery_limit": 15}.
   */
  it('2. State Binding Test: reactive configPayload harus dikirim ke API dengan format yang tepat', async () => {
    mockFeatureService.getFeatures.mockResolvedValue([
      { key: 'has_gallery', name: 'Fitur Galeri Foto', input_type: 'boolean', default_value: 'false' },
      { key: 'gallery_limit', name: 'Limit Foto Galeri', input_type: 'number', default_value: '10' }
    ])
    mockPackageService.createPackage.mockResolvedValue({ id: 'pkg-new' })

    const wrapper = mount(PackagesPage, {
      global: {
        stubs: {
          NuxtLink: true,
          UiConfirmModal: true
        }
      }
    })
    await flushPromises()

    // Buka create modal
    const tambahBtn = wrapper.findAll('button').find(b => b.text().includes('Tambah Baru'))
    await tambahBtn!.trigger('click')
    await flushPromises()

    // Isi Nama Paket
    const nameInput = wrapper.find('input[required][type="text"]')
    await nameInput.setValue('Paket Eksklusif')

    // Centang toggle Galeri
    const galleryToggle = wrapper.find('input[type="checkbox"]')
    await galleryToggle.setValue(true)
    await flushPromises()

    // Masukkan angka 15 ke input number gallery_limit
    const numberInput = wrapper.find('input[type="number"]')
    await numberInput.setValue(15)
    await flushPromises()

    // Submit form paket
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    // Verifikasi pemanggilan API createPackage dengan payload yang tepat
    expect(mockPackageService.createPackage).toHaveBeenCalledTimes(1)
    expect(mockPackageService.createPackage).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Paket Eksklusif',
        features_config: expect.objectContaining({
          has_gallery: true,
          gallery_limit: 15
        })
      })
    )
    expect(mockToast.success).toHaveBeenCalledWith('Paket berhasil ditambahkan')
  })

  /**
   * Skenario 3: Delete Feature Scenario (The Missing Key Test)
   * Mock edit paket lama dengan config {"has_gallery": true, "has_video": true}.
   * API master features saat ini HANYA mengembalikan has_gallery (has_video telah dihapus dari sistem).
   * Ekspektasi: Form tidak boleh crash, input has_video tidak dirender, dan payload update HANYA menyertakan has_gallery.
   */
  it('3. Delete Feature Scenario: form tidak crash dan payload update hanya menyertakan master features yang aktif', async () => {
    // Master features saat ini HANYA has_gallery
    mockFeatureService.getFeatures.mockResolvedValue([
      { key: 'has_gallery', name: 'Fitur Galeri Foto', input_type: 'boolean', default_value: 'false' },
      { key: 'gallery_limit', name: 'Limit Foto Galeri', input_type: 'number', default_value: '10' }
    ])

    // Paket lama di database masih mengandung has_video: true
    const oldPackage = {
      id: 'pkg-legacy-1',
      name: 'Paket Legacy',
      price: 250000,
      features_config: {
        has_gallery: true,
        gallery_limit: 10,
        has_video: true // FITUR YANG SUDAH DIHAPUS DARI MASTER
      },
      created_at: '2026-09-01T10:00:00Z'
    }

    mockPackageService.getPackages.mockResolvedValue({
      data: [oldPackage],
      meta: { page: 1, per_page: 15, total: 1 }
    })
    mockPackageService.updatePackage.mockResolvedValue({ ...oldPackage })

    const wrapper = mount(PackagesPage, {
      global: {
        stubs: {
          NuxtLink: true,
          UiConfirmModal: true
        }
      }
    })
    await flushPromises()

    // Buka menu dropdown aksi dan klik Edit pada paket legacy
    const editBtn = wrapper.findAll('button').find(b => b.text().includes('Edit'))
    expect(editBtn).toBeDefined()
    await editBtn!.trigger('click')
    await flushPromises()

    // Pastikan modal terbuka dan tidak crash
    expect(wrapper.text()).toContain('Edit Package')

    // Pastikan teks atau input 'has_video' TIDAK dirender di dalam form
    expect(wrapper.html()).not.toContain('has_video')
    expect(wrapper.html()).not.toContain('Fitur Video')

    // Simpan paket
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await flushPromises()

    // Verifikasi payload yang dikirim ke updatePackage TIDAK menyertakan has_video
    expect(mockPackageService.updatePackage).toHaveBeenCalledTimes(1)
    const calledPayload = mockPackageService.updatePackage.mock.calls[0][1]

    expect(calledPayload.features_config).toHaveProperty('has_gallery', true)
    expect(calledPayload.features_config).toHaveProperty('gallery_limit', 10)
    expect(calledPayload.features_config).not.toHaveProperty('has_video')
    expect(mockToast.success).toHaveBeenCalledWith('Paket berhasil diperbarui')
  })

  /**
   * Skenario 4: Delete Package Test
   * Klik tombol Hapus pada tabel Packages.
   * Pastikan muncul Confirmation Modal.
   * Setelah dikonfirmasi, API DELETE dipanggil, lalu tabel data me-refresh (fetch ulang).
   */
  it('4. Delete Package Test: menampilkan confirmation modal, memanggil DELETE API, dan me-refresh tabel', async () => {
    mockPackageService.deletePackage.mockResolvedValue({ success: true })

    const wrapper = mount(PackagesPage, {
      global: {
        stubs: {
          NuxtLink: true,
          UiConfirmModal: {
            props: ['title', 'message'],
            template: `
              <div class="confirm-modal-stub">
                <span>{{ title }}</span>
                <p>{{ message }}</p>
                <button class="confirm-btn" @click="$emit('confirm')">Confirm</button>
                <button class="cancel-btn" @click="$emit('cancel')">Cancel</button>
              </div>
            `
          }
        }
      }
    })
    await flushPromises()

    // Reset hitungan fetch awal
    mockPackageService.getPackages.mockClear()

    // Klik tombol Delete pada baris tabel
    const deleteBtn = wrapper.findAll('button').find(b => b.text().includes('Delete'))
    expect(deleteBtn).toBeDefined()
    await deleteBtn!.trigger('click')
    await flushPromises()

    // Pastikan confirmation modal muncul
    const confirmModal = wrapper.find('.confirm-modal-stub')
    expect(confirmModal.exists()).toBe(true)
    expect(confirmModal.text()).toContain('Hapus Paket')

    // Klik tombol konfirmasi hapus pada modal
    const confirmActionBtn = confirmModal.find('.confirm-btn')
    await confirmActionBtn.trigger('click')
    await flushPromises()

    // Verifikasi pemanggilan API DELETE dengan ID paket
    expect(mockPackageService.deletePackage).toHaveBeenCalledWith('pkg-1')
    expect(mockToast.success).toHaveBeenCalledWith('Paket berhasil dipindahkan ke sampah')

    // Verifikasi tabel melakukan refresh data (getPackages dipanggil kembali)
    expect(mockPackageService.getPackages).toHaveBeenCalledTimes(1)
  })
})
