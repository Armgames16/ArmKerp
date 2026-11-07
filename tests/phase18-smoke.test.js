const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
test('all local JS assets parse and contain no Markdown fences',()=>{
 for(const file of fs.readdirSync(root).filter(n=>n.endsWith('.js'))){
  const code=read(file);
  assert.ok(!code.trimStart().startsWith('```'),file+' starts with Markdown');
  assert.doesNotThrow(()=>new (require('node:vm').Script)(code,{filename:file}),file);
 }
});
test('every local script and stylesheet linked in HTML exists',()=>{
 const html=read('index.html');
 for(const match of html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css|svg))["']/g)){
  if(!match[1].startsWith('http'))assert.ok(fs.existsSync(path.join(root,match[1])),match[1]);
 }
});
test('Phase 18 regression checks for lobby and friends',()=>{
 const lobby=read('phase10.js');
 const friends=read('phase17.js');
 assert.match(lobby,/function renderLobby\(controls,host,busy\)/);
 assert.match(lobby,/for\(const p of latest\.members\)/);
 assert.doesNotMatch(lobby,/\bps\.id\b/);
 assert.match(friends,/p17-friend-username/);
 assert.match(friends,/refreshQueued/);
 assert.match(friends,/editing.*previousInput/);
});
test('health endpoint and favicon are provided',()=>{
 assert.match(read('server.js'),/app\.get\('\/api\/health'/);
 assert.match(read('index.html'),/favicon\.svg/);
 assert.ok(fs.statSync(path.join(root,'favicon.svg')).size>0);
});
