import type { ApiResponse } from '~/types/api'
import type { LoginRequest, LoginResponse, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest, VerifyEmailRequest } from '~/types/auth'
import type { User } from '~/types/user'

export function useAuthService() {
  const api = useApi()

  return {
    login(data: LoginRequest) {
      return api.post<ApiResponse<LoginResponse>>('/auth/login', data as any)
    },

    register(data: RegisterRequest) {
      return api.post<ApiResponse<{ message: string }>>('/auth/register', data as any)
    },

    logout() {
      return api.post<ApiResponse<null>>('/auth/logout')
    },

    logoutAll() {
      return api.post<ApiResponse<null>>('/auth/logout-all')
    },

    refresh() {
      return api.post<ApiResponse<{ access_token: string }>>('/auth/refresh')
    },

    forgotPassword(data: ForgotPasswordRequest) {
      return api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', data as any)
    },

    resetPassword(data: ResetPasswordRequest) {
      return api.post<ApiResponse<{ message: string }>>('/auth/reset-password', data as any)
    },

    changePassword(data: ChangePasswordRequest) {
      return api.post<ApiResponse<{ message: string }>>('/auth/change-password', data as any)
    },

    verifyEmail(data: VerifyEmailRequest) {
      return api.post<ApiResponse<{ message: string }>>('/auth/verify-email', data as any)
    },

    getMe() {
      return api.get<ApiResponse<User>>('/me')
    },
  }
}
