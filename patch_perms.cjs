const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace(
    /v-if="hasPermission\('user\.delete'\) && canManageTarget\(u\)"/g,
    'v-if="(isSuperAdmin || hasPermission(\'user.delete\')) && canManageTarget(u)"'
  );
  
  code = code.replace(
    /v-if="hasPermission\('user\.update'\)"/g,
    'v-if="isSuperAdmin || hasPermission(\'user.update\')"'
  );

  code = code.replace(
    /v-if="hasPermission\('user\.view'\)"/g,
    'v-if="isSuperAdmin || hasPermission(\'user.view\')"'
  );
  
  code = code.replace(
    /v-if="viewMode === 'active' && hasPermission\('user\.create'\)"/g,
    'v-if="viewMode === \'active\' && (isSuperAdmin || hasPermission(\'user.create\'))"'
  );

  fs.writeFileSync(file, code);
}

function patchRoles(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace(
    /v-if="hasPermission\('role\.delete'\) && !role\.is_system"/g,
    'v-if="(isSuperAdmin || hasPermission(\'role.delete\')) && !role.is_system"'
  );
  
  code = code.replace(
    /v-if="hasPermission\('role\.update'\)"/g,
    'v-if="isSuperAdmin || hasPermission(\'role.update\')"'
  );

  code = code.replace(
    /v-if="hasPermission\('permission\.assign'\)"/g,
    'v-if="isSuperAdmin || hasPermission(\'permission.assign\')"'
  );
  
  code = code.replace(
    /v-if="viewMode === 'active' && hasPermission\('role\.create'\)"/g,
    'v-if="viewMode === \'active\' && (isSuperAdmin || hasPermission(\'role.create\'))"'
  );

  fs.writeFileSync(file, code);
}

patchFile('app/pages/dashboard/users/index.vue');
patchRoles('app/pages/dashboard/roles/index.vue');
console.log('Patched Perms');
