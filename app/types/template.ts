export interface Template {
  id: string
  name: string
  nuxt_component: string
  thumbnail_url: string
  category?: string
  category_name?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TemplateFormData {
  name: string
  nuxt_component: string
  thumbnail_url: string
  category?: string
  is_active: boolean
}
