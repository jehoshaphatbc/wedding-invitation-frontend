import type { Role } from './role'

export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  avatar_url: string | null
  status: string
  roles: Role[]
  created_at: string
  last_login_at?: string | null
  email_verified_at?: string | null
}
