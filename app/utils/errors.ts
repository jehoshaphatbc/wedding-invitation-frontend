export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (error && typeof error === 'object' && 'data' in error) {
    const apiError = error as { status?: number; data?: { message?: string; errors?: Record<string, string[]> }; statusCode?: number }
    const status = apiError.status || apiError.statusCode || 500
    const data = apiError.data
    return new ApiError(
      data?.message || error.message || String(error) || 'An unexpected error occurred.',
      status,
      data?.errors,
    )
  }

  return new ApiError(error instanceof Error ? (error.name + ': ' + error.message) : String(error), 500)
}
