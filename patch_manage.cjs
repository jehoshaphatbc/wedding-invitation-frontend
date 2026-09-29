const fs = require('fs');
let code = fs.readFileSync('app/pages/dashboard/users/index.vue', 'utf8');

const oldFunc = `function canManageTarget(target: User) {
  if (isSuperAdmin.value) return true
  if (isAdmin.value && !isSuperAdmin.value) {
    // Admin can only delete users who have 'customer' role and aren't admin themselves
    const isCustomer = target.roles?.some(r => r.name === 'customer')
    const isHigherLevel = target.roles?.some(r => ['admin', 'superadmin'].includes(r.name))
    return isCustomer && !isHigherLevel
  }
  return false
}`;

const newFunc = `function canManageTarget(target: User) {
  if (isSuperAdmin.value) return true
  if (isAdmin.value && !isSuperAdmin.value) {
    // Admin can only delete users who have 'customer' role and aren't admin themselves
    const isCustomer = target.roles?.some(r => r.name.toLowerCase().includes('customer'))
    const isHigherLevel = target.roles?.some(r => r.name.toLowerCase().includes('admin'))
    return isCustomer && !isHigherLevel
  }
  return false
}`;

code = code.replace(oldFunc, newFunc);
fs.writeFileSync('app/pages/dashboard/users/index.vue', code);
console.log('Patched manage target');
