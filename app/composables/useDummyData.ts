import { ref } from 'vue'

export interface DummyClient {
  id: string
  name: string
  email: string
  whatsapp: string
  created_at: string
}

export interface DummyOrder {
  id: string
  invoice_number: string
  client: {
    id: string
    name: string
    email: string
    whatsapp: string
  }
  package_name: string
  total_amount: number
  status: 'paid' | 'unpaid' | 'expired'
  form_token: string
  scanner_token: string
  magic_link?: string
  scanner_link?: string
  created_at: string
}

export interface DummyGuest {
  id: string
  guest_name: string
  qr_token: string
  rsvp_status: 'pending' | 'hadir' | 'tidak_hadir'
  actual_attendance: boolean
  pax?: number
  table_number?: string
  created_at: string
}

export function useDummyData() {
  const dummyClients = ref<DummyClient[]>([
    {
      id: 'client-001',
      name: 'Dimas Prasetyo & Anisa Rahma',
      email: 'dimas.anisa@gmail.com',
      whatsapp: '081234567801',
      created_at: '2023-10-01T08:30:00Z'
    },
    {
      id: 'client-002',
      name: 'Rizky Ramadhan & Nadia Salsabila',
      email: 'rizky.nadia@yahoo.com',
      whatsapp: '081298765402',
      created_at: '2023-10-02T09:15:00Z'
    },
    {
      id: 'client-003',
      name: 'Fajar Hidayat & Dinda Permata',
      email: 'fajar.dinda@outlook.com',
      whatsapp: '081377889903',
      created_at: '2023-10-03T11:45:00Z'
    },
    {
      id: 'client-004',
      name: 'Bayu Wicaksono & Tiara Maharani',
      email: 'bayu.tiara@gmail.com',
      whatsapp: '085712345604',
      created_at: '2023-10-04T14:20:00Z'
    },
    {
      id: 'client-005',
      name: 'Aditya Pratama & Putri Anggraini',
      email: 'adit.putri@gmail.com',
      whatsapp: '082165432105',
      created_at: '2023-10-05T10:10:00Z'
    },
    {
      id: 'client-006',
      name: 'Galih Mahendra & Ratna Sari',
      email: 'galih.ratna@hotmail.com',
      whatsapp: '081288990006',
      created_at: '2023-10-06T13:00:00Z'
    },
    {
      id: 'client-007',
      name: 'Gilang Ramadan & Maya Kusuma',
      email: 'gilang.maya@gmail.com',
      whatsapp: '087812349907',
      created_at: '2023-10-07T15:30:00Z'
    },
    {
      id: 'client-008',
      name: 'Hendra Saputra & Dewi Lestari',
      email: 'hendra.dewi@gmail.com',
      whatsapp: '081909876508',
      created_at: '2023-10-08T08:00:00Z'
    },
    {
      id: 'client-009',
      name: 'Ilham Fauzi & Bella Safitri',
      email: 'ilham.bella@yahoo.co.id',
      whatsapp: '085611223309',
      created_at: '2023-10-09T16:45:00Z'
    },
    {
      id: 'client-010',
      name: 'Bagas Sanjaya & Citra Kirana',
      email: 'bagas.citra@gmail.com',
      whatsapp: '082233445510',
      created_at: '2023-10-10T12:20:00Z'
    },
    {
      id: 'client-011',
      name: 'Yoga Pamungkas & Aulia Zahra',
      email: 'yoga.aulia@gmail.com',
      whatsapp: '081399887711',
      created_at: '2023-10-11T17:10:00Z'
    },
    {
      id: 'client-012',
      name: 'Kevin Ardiansyah & Fitri Handayani',
      email: 'kevin.fitri@gmail.com',
      whatsapp: '081255443312',
      created_at: '2023-10-12T19:00:00Z'
    }
  ])

  const dummyOrders = ref<DummyOrder[]>([
    {
      id: 'ord-001',
      invoice_number: 'INV-202310-001',
      client: {
        id: 'client-001',
        name: 'Dimas Prasetyo & Anisa Rahma',
        email: 'dimas.anisa@gmail.com',
        whatsapp: '081234567801'
      },
      package_name: 'Paket Platinum',
      total_amount: 500000,
      status: 'paid',
      form_token: 'ftok_202310_001_9a8b',
      scanner_token: 'scnt_202310_001_c7d6',
      magic_link: 'https://harsava.id/invitation/ord-001?auth=ftok_202310_001_9a8b',
      scanner_link: 'https://harsava.id/checkin/ord-001/scanner?token=scnt_202310_001_c7d6',
      created_at: '2023-10-01T08:45:00Z'
    },
    {
      id: 'ord-002',
      invoice_number: 'INV-202310-002',
      client: {
        id: 'client-002',
        name: 'Rizky Ramadhan & Nadia Salsabila',
        email: 'rizky.nadia@yahoo.com',
        whatsapp: '081298765402'
      },
      package_name: 'Paket Gold',
      total_amount: 350000,
      status: 'paid',
      form_token: 'ftok_202310_002_1b2c',
      scanner_token: 'scnt_202310_002_3d4e',
      magic_link: 'https://harsava.id/invitation/ord-002?auth=ftok_202310_002_1b2c',
      scanner_link: 'https://harsava.id/checkin/ord-002/scanner?token=scnt_202310_002_3d4e',
      created_at: '2023-10-02T09:30:00Z'
    },
    {
      id: 'ord-003',
      invoice_number: 'INV-202310-003',
      client: {
        id: 'client-003',
        name: 'Fajar Hidayat & Dinda Permata',
        email: 'fajar.dinda@outlook.com',
        whatsapp: '081377889903'
      },
      package_name: 'Paket Silver',
      total_amount: 200000,
      status: 'unpaid',
      form_token: 'ftok_202310_003_5f6g',
      scanner_token: 'scnt_202310_003_7h8i',
      magic_link: 'https://harsava.id/invitation/ord-003?auth=ftok_202310_003_5f6g',
      scanner_link: 'https://harsava.id/checkin/ord-003/scanner?token=scnt_202310_003_7h8i',
      created_at: '2023-10-03T11:50:00Z'
    },
    {
      id: 'ord-004',
      invoice_number: 'INV-202310-004',
      client: {
        id: 'client-004',
        name: 'Bayu Wicaksono & Tiara Maharani',
        email: 'bayu.tiara@gmail.com',
        whatsapp: '085712345604'
      },
      package_name: 'Paket Diamond Exclusive',
      total_amount: 750000,
      status: 'paid',
      form_token: 'ftok_202310_004_9j0k',
      scanner_token: 'scnt_202310_004_1l2m',
      magic_link: 'https://harsava.id/invitation/ord-004?auth=ftok_202310_004_9j0k',
      scanner_link: 'https://harsava.id/checkin/ord-004/scanner?token=scnt_202310_004_1l2m',
      created_at: '2023-10-04T14:35:00Z'
    },
    {
      id: 'ord-005',
      invoice_number: 'INV-202310-005',
      client: {
        id: 'client-005',
        name: 'Aditya Pratama & Putri Anggraini',
        email: 'adit.putri@gmail.com',
        whatsapp: '082165432105'
      },
      package_name: 'Paket Gold',
      total_amount: 350000,
      status: 'expired',
      form_token: 'ftok_202310_005_3n4o',
      scanner_token: 'scnt_202310_005_5p6q',
      magic_link: 'https://harsava.id/invitation/ord-005?auth=ftok_202310_005_3n4o',
      scanner_link: 'https://harsava.id/checkin/ord-005/scanner?token=scnt_202310_005_5p6q',
      created_at: '2023-10-05T10:15:00Z'
    },
    {
      id: 'ord-006',
      invoice_number: 'INV-202310-006',
      client: {
        id: 'client-006',
        name: 'Galih Mahendra & Ratna Sari',
        email: 'galih.ratna@hotmail.com',
        whatsapp: '081288990006'
      },
      package_name: 'Paket Platinum',
      total_amount: 500000,
      status: 'paid',
      form_token: 'ftok_202310_006_7r8s',
      scanner_token: 'scnt_202310_006_9t0u',
      magic_link: 'https://harsava.id/invitation/ord-006?auth=ftok_202310_006_7r8s',
      scanner_link: 'https://harsava.id/checkin/ord-006/scanner?token=scnt_202310_006_9t0u',
      created_at: '2023-10-06T13:10:00Z'
    },
    {
      id: 'ord-007',
      invoice_number: 'INV-202310-007',
      client: {
        id: 'client-007',
        name: 'Gilang Ramadan & Maya Kusuma',
        email: 'gilang.maya@gmail.com',
        whatsapp: '087812349907'
      },
      package_name: 'Paket Silver',
      total_amount: 200000,
      status: 'unpaid',
      form_token: 'ftok_202310_007_1v2w',
      scanner_token: 'scnt_202310_007_3x4y',
      magic_link: 'https://harsava.id/invitation/ord-007?auth=ftok_202310_007_1v2w',
      scanner_link: 'https://harsava.id/checkin/ord-007/scanner?token=scnt_202310_007_3x4y',
      created_at: '2023-10-07T15:40:00Z'
    },
    {
      id: 'ord-008',
      invoice_number: 'INV-202310-008',
      client: {
        id: 'client-008',
        name: 'Hendra Saputra & Dewi Lestari',
        email: 'hendra.dewi@gmail.com',
        whatsapp: '081909876508'
      },
      package_name: 'Paket Gold',
      total_amount: 350000,
      status: 'paid',
      form_token: 'ftok_202310_008_5z6a',
      scanner_token: 'scnt_202310_008_7b8c',
      magic_link: 'https://harsava.id/invitation/ord-008?auth=ftok_202310_008_5z6a',
      scanner_link: 'https://harsava.id/checkin/ord-008/scanner?token=scnt_202310_008_7b8c',
      created_at: '2023-10-08T08:20:00Z'
    },
    {
      id: 'ord-009',
      invoice_number: 'INV-202310-009',
      client: {
        id: 'client-009',
        name: 'Ilham Fauzi & Bella Safitri',
        email: 'ilham.bella@yahoo.co.id',
        whatsapp: '085611223309'
      },
      package_name: 'Paket Platinum',
      total_amount: 500000,
      status: 'expired',
      form_token: 'ftok_202310_009_9d0e',
      scanner_token: 'scnt_202310_009_1f2g',
      magic_link: 'https://harsava.id/invitation/ord-009?auth=ftok_202310_009_9d0e',
      scanner_link: 'https://harsava.id/checkin/ord-009/scanner?token=scnt_202310_009_1f2g',
      created_at: '2023-10-09T17:00:00Z'
    },
    {
      id: 'ord-010',
      invoice_number: 'INV-202310-010',
      client: {
        id: 'client-010',
        name: 'Bagas Sanjaya & Citra Kirana',
        email: 'bagas.citra@gmail.com',
        whatsapp: '082233445510'
      },
      package_name: 'Paket Gold',
      total_amount: 350000,
      status: 'paid',
      form_token: 'ftok_202310_010_3h4i',
      scanner_token: 'scnt_202310_010_5j6k',
      magic_link: 'https://harsava.id/invitation/ord-010?auth=ftok_202310_010_3h4i',
      scanner_link: 'https://harsava.id/checkin/ord-010/scanner?token=scnt_202310_010_5j6k',
      created_at: '2023-10-10T12:35:00Z'
    },
    {
      id: 'ord-011',
      invoice_number: 'INV-202310-011',
      client: {
        id: 'client-011',
        name: 'Yoga Pamungkas & Aulia Zahra',
        email: 'yoga.aulia@gmail.com',
        whatsapp: '081399887711'
      },
      package_name: 'Paket Silver',
      total_amount: 200000,
      status: 'unpaid',
      form_token: 'ftok_202310_011_7l8m',
      scanner_token: 'scnt_202310_011_9n0o',
      magic_link: 'https://harsava.id/invitation/ord-011?auth=ftok_202310_011_7l8m',
      scanner_link: 'https://harsava.id/checkin/ord-011/scanner?token=scnt_202310_011_9n0o',
      created_at: '2023-10-11T17:25:00Z'
    },
    {
      id: 'ord-012',
      invoice_number: 'INV-202310-012',
      client: {
        id: 'client-012',
        name: 'Kevin Ardiansyah & Fitri Handayani',
        email: 'kevin.fitri@gmail.com',
        whatsapp: '081255443312'
      },
      package_name: 'Paket Diamond Exclusive',
      total_amount: 750000,
      status: 'paid',
      form_token: 'ftok_202310_012_1p2q',
      scanner_token: 'scnt_202310_012_3r4s',
      magic_link: 'https://harsava.id/invitation/ord-012?auth=ftok_202310_012_1p2q',
      scanner_link: 'https://harsava.id/checkin/ord-012/scanner?token=scnt_202310_012_3r4s',
      created_at: '2023-10-12T19:15:00Z'
    },
    {
      id: 'ord-013',
      invoice_number: 'INV-202310-013',
      client: {
        id: 'client-001',
        name: 'Dimas Prasetyo & Anisa Rahma',
        email: 'dimas.anisa@gmail.com',
        whatsapp: '081234567801'
      },
      package_name: 'Add-on WhatsApp Broadcast 1000',
      total_amount: 150000,
      status: 'paid',
      form_token: 'ftok_202310_013_5t6u',
      scanner_token: 'scnt_202310_013_7v8w',
      magic_link: 'https://harsava.id/invitation/ord-013?auth=ftok_202310_013_5t6u',
      scanner_link: 'https://harsava.id/checkin/ord-013/scanner?token=scnt_202310_013_7v8w',
      created_at: '2023-10-13T10:00:00Z'
    },
    {
      id: 'ord-014',
      invoice_number: 'INV-202310-014',
      client: {
        id: 'client-003',
        name: 'Fajar Hidayat & Dinda Permata',
        email: 'fajar.dinda@outlook.com',
        whatsapp: '081377889903'
      },
      package_name: 'Paket Gold',
      total_amount: 350000,
      status: 'expired',
      form_token: 'ftok_202310_014_9x0y',
      scanner_token: 'scnt_202310_014_1z2a',
      magic_link: 'https://harsava.id/invitation/ord-014?auth=ftok_202310_014_9x0y',
      scanner_link: 'https://harsava.id/checkin/ord-014/scanner?token=scnt_202310_014_1z2a',
      created_at: '2023-10-14T11:20:00Z'
    },
    {
      id: 'ord-015',
      invoice_number: 'INV-202310-015',
      client: {
        id: 'client-004',
        name: 'Bayu Wicaksono & Tiara Maharani',
        email: 'bayu.tiara@gmail.com',
        whatsapp: '085712345604'
      },
      package_name: 'Add-on Custom Domain (.com)',
      total_amount: 175000,
      status: 'unpaid',
      form_token: 'ftok_202310_015_3b4c',
      scanner_token: 'scnt_202310_015_5d6e',
      magic_link: 'https://harsava.id/invitation/ord-015?auth=ftok_202310_015_3b4c',
      scanner_link: 'https://harsava.id/checkin/ord-015/scanner?token=scnt_202310_015_5d6e',
      created_at: '2023-10-15T16:00:00Z'
    }
  ])

  const dummyGuests = ref<DummyGuest[]>([
    { id: 'gst-001', guest_name: 'Budi Santoso', qr_token: 'QR-GST-001-A9B1', rsvp_status: 'hadir', actual_attendance: true, pax: 2, table_number: 'VIP 1', created_at: '2023-10-01T10:00:00Z' },
    { id: 'gst-002', guest_name: 'Siti Nurhaliza', qr_token: 'QR-GST-002-C3D2', rsvp_status: 'hadir', actual_attendance: true, pax: 1, table_number: 'VIP 1', created_at: '2023-10-01T10:05:00Z' },
    { id: 'gst-003', guest_name: 'Ir. H. Bambang Soeprapto', qr_token: 'QR-GST-003-E5F3', rsvp_status: 'hadir', actual_attendance: true, pax: 2, table_number: 'VIP 2', created_at: '2023-10-01T10:10:00Z' },
    { id: 'gst-004', guest_name: 'Dr. Ratna Juwita, Sp.A', qr_token: 'QR-GST-004-G7H4', rsvp_status: 'hadir', actual_attendance: false, pax: 2, table_number: 'VIP 2', created_at: '2023-10-01T10:15:00Z' },
    { id: 'gst-005', guest_name: 'Agus Setiawan', qr_token: 'QR-GST-005-I9J5', rsvp_status: 'tidak_hadir', actual_attendance: false, pax: 1, table_number: 'Reguler A', created_at: '2023-10-01T10:20:00Z' },
    { id: 'gst-006', guest_name: 'Rina Marlina, S.Kom', qr_token: 'QR-GST-006-K1L6', rsvp_status: 'hadir', actual_attendance: true, pax: 2, table_number: 'Reguler A', created_at: '2023-10-01T10:25:00Z' },
    { id: 'gst-007', guest_name: 'Eko Prasetyo', qr_token: 'QR-GST-007-M3N7', rsvp_status: 'pending', actual_attendance: false, pax: 1, table_number: 'Reguler A', created_at: '2023-10-01T10:30:00Z' },
    { id: 'gst-008', guest_name: 'Dewi Sartika', qr_token: 'QR-GST-008-O5P8', rsvp_status: 'hadir', actual_attendance: true, pax: 2, table_number: 'Reguler B', created_at: '2023-10-01T10:35:00Z' },
    { id: 'gst-009', guest_name: 'Hendra Gunawan', qr_token: 'QR-GST-009-Q7R9', rsvp_status: 'hadir', actual_attendance: true, pax: 1, table_number: 'Reguler B', created_at: '2023-10-01T10:40:00Z' },
    { id: 'gst-010', guest_name: 'Maya Indah Sari', qr_token: 'QR-GST-010-S9T0', rsvp_status: 'pending', actual_attendance: false, pax: 2, table_number: 'Reguler B', created_at: '2023-10-01T10:45:00Z' },
    { id: 'gst-011', guest_name: 'Ahmad Fauzi', qr_token: 'QR-GST-011-U1V1', rsvp_status: 'hadir', actual_attendance: false, pax: 2, table_number: 'Reguler C', created_at: '2023-10-01T10:50:00Z' },
    { id: 'gst-012', guest_name: 'Nurul Hidayah', qr_token: 'QR-GST-012-W3X2', rsvp_status: 'tidak_hadir', actual_attendance: false, pax: 1, table_number: 'Reguler C', created_at: '2023-10-01T10:55:00Z' },
    { id: 'gst-013', guest_name: 'Doni Kusuma', qr_token: 'QR-GST-013-Y5Z3', rsvp_status: 'hadir', actual_attendance: true, pax: 2, table_number: 'Reguler C', created_at: '2023-10-01T11:00:00Z' },
    { id: 'gst-014', guest_name: 'Lestari Widyaningrum', qr_token: 'QR-GST-014-A7B4', rsvp_status: 'pending', actual_attendance: false, pax: 1, table_number: 'Reguler D', created_at: '2023-10-01T11:05:00Z' },
    { id: 'gst-015', guest_name: 'Wahyu Hidayatullah', qr_token: 'QR-GST-015-C9D5', rsvp_status: 'hadir', actual_attendance: true, pax: 3, table_number: 'Reguler D', created_at: '2023-10-01T11:10:00Z' },
    { id: 'gst-016', guest_name: 'Tari Puspitasari', qr_token: 'QR-GST-016-E1F6', rsvp_status: 'hadir', actual_attendance: true, pax: 2, table_number: 'Reguler D', created_at: '2023-10-01T11:15:00Z' },
    { id: 'gst-017', guest_name: 'Dedi Irawan', qr_token: 'QR-GST-017-G3H7', rsvp_status: 'tidak_hadir', actual_attendance: false, pax: 1, table_number: 'Reguler E', created_at: '2023-10-01T11:20:00Z' },
    { id: 'gst-018', guest_name: 'Hj. Sri Wahyuni', qr_token: 'QR-GST-018-I5J8', rsvp_status: 'hadir', actual_attendance: true, pax: 2, table_number: 'VIP 3', created_at: '2023-10-01T11:25:00Z' },
    { id: 'gst-019', guest_name: 'Ferry Kurniawan', qr_token: 'QR-GST-019-K7L9', rsvp_status: 'pending', actual_attendance: false, pax: 2, table_number: 'Reguler E', created_at: '2023-10-01T11:30:00Z' },
    { id: 'gst-020', guest_name: 'Yuliana Sari', qr_token: 'QR-GST-020-M9N0', rsvp_status: 'hadir', actual_attendance: true, pax: 1, table_number: 'Reguler E', created_at: '2023-10-01T11:35:00Z' },
    { id: 'gst-021', guest_name: 'Guntur Wibowo', qr_token: 'QR-GST-021-O1P1', rsvp_status: 'hadir', actual_attendance: true, pax: 2, table_number: 'Reguler F', created_at: '2023-10-01T11:40:00Z' },
    { id: 'gst-022', guest_name: 'Endah Sulistyowati', qr_token: 'QR-GST-022-Q3R2', rsvp_status: 'pending', actual_attendance: false, pax: 1, table_number: 'Reguler F', created_at: '2023-10-01T11:45:00Z' },
    { id: 'gst-023', guest_name: 'Hadi Prayitno', qr_token: 'QR-GST-023-S5T3', rsvp_status: 'hadir', actual_attendance: true, pax: 2, table_number: 'Reguler F', created_at: '2023-10-01T11:50:00Z' },
    { id: 'gst-024', guest_name: 'Ika Permatasari', qr_token: 'QR-GST-024-U7V4', rsvp_status: 'hadir', actual_attendance: false, pax: 1, table_number: 'Reguler G', created_at: '2023-10-01T11:55:00Z' },
    { id: 'gst-025', guest_name: 'Rian Haryanto', qr_token: 'QR-GST-025-W9X5', rsvp_status: 'tidak_hadir', actual_attendance: false, pax: 2, table_number: 'Reguler G', created_at: '2023-10-01T12:00:00Z' }
  ])

  return {
    dummyClients,
    dummyOrders,
    dummyGuests
  }
}
