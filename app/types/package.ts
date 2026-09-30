export interface PackageFeatures {
  has_gallery?: boolean
  gallery_limit?: number
  has_rsvp?: boolean
  has_story?: boolean
  has_wishes?: boolean
  has_video?: boolean
  has_qr?: boolean
  max_guests?: number
}

export interface Package {
  id: string
  name: string
  price: number
  features_config: PackageFeatures
  is_active: boolean
  created_at: string
  updated_at: string
}
