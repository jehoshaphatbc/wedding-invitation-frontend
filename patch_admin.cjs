const fs = require('fs');

function patchUsers() {
  let code = fs.readFileSync('app/pages/dashboard/users/index.vue', 'utf8');
  
  // Hide trash from Admin
  code = code.replace(
    /const canViewTrash = computed\(\(\) => isSuperAdmin\.value \|\| isAdmin\.value\)/g,
    'const canViewTrash = computed(() => isSuperAdmin.value)'
  );
  
  // Fix canManageTarget logic to just check if target has 'customer' in roles (if admin)
  const oldFunc = `function canManageTarget(target: User) {
  if (isSuperAdmin.value) return true
  if (isAdmin.value && !isSuperAdmin.value) {
    // Admin can only delete users who have 'customer' role and aren't admin themselves
    const isCustomer = target.roles?.some(r => r.name.toLowerCase().includes('customer'))
    const isHigherLevel = target.roles?.some(r => r.name.toLowerCase().includes('admin'))
    return isCustomer && !isHigherLevel
  }
  return false
}`;

  const newFunc = `function canManageTarget(target: User) {
  if (isSuperAdmin.value) return true
  if (isAdmin.value) {
    // Admin can ONLY manage customers
    return target.roles?.some(r => r.name.toLowerCase().includes('customer')) || false
  }
  return false
}`;
  code = code.replace(oldFunc, newFunc);
  
  // Update Delete button v-if
  code = code.replace(
    /v-if="\(isSuperAdmin \|\| hasPermission\('user\.delete'\)\) && canManageTarget\(u\)"/g,
    'v-if="canManageTarget(u)"'
  );
  
  fs.writeFileSync('app/pages/dashboard/users/index.vue', code);
}

function patchRoles() {
  let code = fs.readFileSync('app/pages/dashboard/roles/index.vue', 'utf8');
  
  // Hide trash from Admin
  code = code.replace(
    /const canViewTrash = computed\(\(\) => isSuperAdmin\.value \|\| isAdmin\.value\)/g,
    'const canViewTrash = computed(() => isSuperAdmin.value)'
  );
  
  fs.writeFileSync('app/pages/dashboard/roles/index.vue', code);
}

patchUsers();
patchRoles();
console.log('Patched Admin permissions');
