export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface ApiValidationError {
  success: false
  message: string
  errors: Record<string, string[]>
}

export interface ApiPaginationMeta {
  page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiPaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  meta: ApiPaginationMeta
}
