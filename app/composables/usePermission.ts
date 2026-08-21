import type { User } from '~/types/user'

export function usePermission() {
  const authStore = useAuthStore()

  const userPermissions = computed(() => {
    if (!authStore.user?.roles) return []
    const permissions: string[] = []
    for (const role of authStore.user.roles) {
      if (role.permissions) {
        for (const perm of role.permissions) {
          if (!permissions.includes(perm.name)) {
            permissions.push(perm.name)
          }
        }
      }
    }
    return permissions
  })

  function hasPermission(permission: string): boolean {
    return userPermissions.value.includes(permission)
  }

  function hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((p) => userPermissions.value.includes(p))
  }

  function hasAllPermissions(permissions: string[]): boolean {
    return permissions.every((p) => userPermissions.value.includes(p))
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userPermissions,
  }
}
