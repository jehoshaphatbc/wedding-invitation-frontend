export interface Feature {
  id?: string
  key: string
  name: string
  feature_key?: string
  feature_name?: string
  input_type: 'boolean' | 'number'
  default_value: string
  created_at?: string
  updated_at?: string
}

export interface FeatureFormData {
  key: string
  name: string
  input_type: 'boolean' | 'number'
  default_value: string
}
