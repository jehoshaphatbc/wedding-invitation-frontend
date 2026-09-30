export interface PackageFeatures {
  has_gallery: boolean
  gallery_limit: number
  has_video: boolean
  has_qr: boolean
}

export interface Package {
  id: string
  name: string
  price: number
  features_config: PackageFeatures
  created_at: string
  updated_at: string
}
