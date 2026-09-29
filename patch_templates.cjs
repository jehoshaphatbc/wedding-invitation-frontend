const fs = require('fs');

// Patch types
let typesCode = fs.readFileSync('app/types/template.ts', 'utf8');
typesCode = typesCode.replace(/component_name/g, 'nuxt_component');
fs.writeFileSync('app/types/template.ts', typesCode);

// Patch service
let serviceCode = fs.readFileSync('app/services/template.service.ts', 'utf8');
serviceCode = serviceCode.replace(/component_name/g, 'nuxt_component');
fs.writeFileSync('app/services/template.service.ts', serviceCode);

// Patch index.vue
let vueCode = fs.readFileSync('app/pages/dashboard/templates/index.vue', 'utf8');
vueCode = vueCode.replace(/component_name/g, 'nuxt_component');
fs.writeFileSync('app/pages/dashboard/templates/index.vue', vueCode);

console.log('Patched component_name to nuxt_component');
