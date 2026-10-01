export type OrderStatus = 'unpaid' | 'paid' | 'expired' | 'pending' | 'cancelled'

export interface PackageFeatureConfig {
  has_gallery?: boolean
  gallery_limit?: number
  has_video?: boolean
  has_qr?: boolean
  has_rsvp?: boolean
  has_countdown?: boolean
  has_maps?: boolean
  has_gift?: boolean
  [key: string]: any
}

export interface PackageBrief {
  id: string
  name: string
  price: number
  features_config?: PackageFeatureConfig
}

export interface ClientBrief {
  id: string
  name: string
  email: string
  whatsapp: string
}

export interface Order {
  id: string // UUID v4
  invoice_number: string // e.g. "INV-20261001-ABCDE"
  client_id: string
  package_id: string
  total_amount: number
  status: OrderStatus
  payment_url: string
  form_token?: string | null // Filled if status: 'paid'
  scanner_token?: string | null // Filled if status: 'paid' & package.features_config.has_qr == true
  created_at: string // ISO 8601
  updated_at: string
  deleted_at?: string | null
  client?: ClientBrief
  package?: PackageBrief
  // Backward compatibility fields:
  client_name?: string
  client_email?: string
  client_whatsapp?: string
  package_name?: string
  magic_link?: string | null
  scanner_link?: string | null
}

export interface PaginationMeta {
  page: number
  per_page: number
  total: number
  last_page?: number
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
  client?: ClientBrief
  package?: PackageBrief
}
