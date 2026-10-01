export interface Client {
  id: string
  name: string
  email: string
  whatsapp?: string | null
  phone?: string | null
  created_at: string
  updated_at?: string
  deleted_at?: string | null
  orders_count?: number
}

export interface ClientFormData {
  name: string
  email: string
  whatsapp: string
}
