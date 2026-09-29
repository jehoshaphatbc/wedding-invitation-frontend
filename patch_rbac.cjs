const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  const oldSuperAdmin = "const isSuperAdmin = computed(() => authStore.user?.roles?.some(r => r.name === 'superadmin'))";
  const newSuperAdmin = "const isSuperAdmin = computed(() => authStore.user?.roles?.some(r => r.name.toLowerCase().includes('super')))";
  
  const oldAdmin = "const isAdmin = computed(() => authStore.user?.roles?.some(r => r.name === 'admin'))";
  const newAdmin = "const isAdmin = computed(() => authStore.user?.roles?.some(r => r.name.toLowerCase().includes('admin') && !r.name.toLowerCase().includes('super')))";
  
  code = code.replace(oldSuperAdmin, newSuperAdmin);
  code = code.replace(oldAdmin, newAdmin);
  
  fs.writeFileSync(file, code);
}

patchFile('app/pages/dashboard/users/index.vue');
patchFile('app/pages/dashboard/roles/index.vue');
console.log('Patched RBAC');
