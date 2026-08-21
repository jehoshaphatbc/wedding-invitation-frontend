import type { Permission } from './permission'

export interface Role {
  id: string
  name: string
  display_name: string
  description?: string | null
  is_system?: boolean
  permissions?: Permission[]
}
