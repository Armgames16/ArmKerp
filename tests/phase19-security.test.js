const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
test('Phase 19 scripts parse as JavaScript',()=>{
 for(const name of ['admin-grant.js','admin-server.js','admin-schema.js','admin.js','phase9-server.js'])assert.doesNotThrow(()=>new vm.Script(read(name),{filename:name}));
});
test('admin API is protected by Online authentication and admin role',()=>{
 assert.match(read('server.js'),/onlineRouter\.onlineAuth,require\('\.\/admin-server'\)/);
 assert.match(read('admin-server.js'),/SELECT 1 FROM admin_users WHERE user_id=\?/);
 assert.match(read('admin-server.js'),/Cannot suspend an admin account/);
});
test('suspended accounts lose sessions and cannot log in',()=>{
 assert.match(read('admin-server.js'),/DELETE FROM online_sessions WHERE user_id=\?/);
 assert.match(read('phase9-server.js'),/SELECT 1 FROM admin_suspensions WHERE user_id=\?/);
});
test('admin page has no embedded credentials',()=>{
 assert.match(read('admin.js'),/sessionStorage\.getItem\('armkerp_online_v1'\)/);
 assert.doesNotMatch(read('admin.js'),/innerHTML\s*=/);
});
