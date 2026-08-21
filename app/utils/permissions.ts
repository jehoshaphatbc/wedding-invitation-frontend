import type { Permission } from '~/types/permission'

export function extractPermissions(permissions: Permission[]): string[] {
  return permissions.map((p) => p.name)
}

export function filterPermissionsByGroup(permissions: Permission[], group: string): Permission[] {
  return permissions.filter((p) => p.name.startsWith(`${group}.`))
}

export function groupPermissions(permissions: Permission[]): Record<string, Permission[]> {
  const groups: Record<string, Permission[]> = {}
  for (const permission of permissions) {
    const [group] = permission.name.split('.')
    if (!groups[group]) groups[group] = []
    groups[group].push(permission)
  }
  return groups
}
