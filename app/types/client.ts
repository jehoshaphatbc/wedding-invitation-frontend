import type { Order } from '~/types/order'

export interface Client {
  id: string // UUID v4
  name: string
  email: string
  whatsapp: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
  orders?: Order[] // Eager-loaded orders milik klien beserta relasi packagenya
  phone?: string | null
  orders_count?: number
  magic_link?: string | null
}

export interface ClientFormData {
  name: string
  email: string
  whatsapp: string
}
