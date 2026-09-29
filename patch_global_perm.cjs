const fs = require('fs');
let code = fs.readFileSync('app/composables/usePermission.ts', 'utf8');

const newCode = `import type { User } from '~/types/user'

export function usePermission() {
  const authStore = useAuthStore()

  const isSuperAdmin = computed(() => {
    return authStore.user?.roles?.some(r => r.name.toLowerCase().includes('super')) || false
  })

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
    if (isSuperAdmin.value) return true
    return userPermissions.value.includes(permission)
  }

  function hasAnyPermission(permissions: string[]): boolean {
    if (isSuperAdmin.value) return true
    return permissions.some((p) => userPermissions.value.includes(p))
  }

  function hasAllPermissions(permissions: string[]): boolean {
    if (isSuperAdmin.value) return true
    return permissions.every((p) => userPermissions.value.includes(p))
  }

  return {
    isSuperAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userPermissions,
  }
}
`;

fs.writeFileSync('app/composables/usePermission.ts', newCode);
console.log('Patched usePermission.ts');
