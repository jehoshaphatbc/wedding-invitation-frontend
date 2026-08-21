export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: import('./user').User
}

export interface RegisterRequest {
  name: string
  email: string
  phone?: string
  password: string
  password_confirmation?: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

export interface VerifyEmailRequest {
  token: string
}

export interface ChangeEmailRequest {
  new_email: string
}
