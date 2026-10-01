export interface OrderClient {
  id?: string
  name: string
  email: string
  whatsapp?: string | null
  phone?: string | null
}

export interface OrderPackage {
  id?: string
  name: string
  price?: number
}

export type OrderStatus = 'paid' | 'unpaid' | 'expired' | 'pending' | 'cancelled'

export interface Order {
  id: string
  invoice_number: string
  client_id?: string
  client?: OrderClient
  client_name?: string
  client_email?: string
  client_whatsapp?: string
  package_id?: string
  package?: OrderPackage
  package_name?: string
  total_amount: number
  status: OrderStatus
  magic_link?: string | null
  scanner_link?: string | null
  payment_url?: string | null
  created_at: string
  updated_at?: string
  deleted_at?: string | null
}

export interface CheckoutPayload {
  package_id: string
  name: string
  email: string
  whatsapp: string
}

export interface CheckoutResponse {
  payment_url: string
  order?: Order
  invoice_number?: string
  order_id?: string
}
