const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=n=>fs.readFileSync(path.join(root,n),'utf8');
test('Phase 20: navigation JS parses and exposes all panels',()=>{
 assert.doesNotThrow(()=>new vm.Script(read('phase20.js')));
 const html=read('index.html');
 for(const id of ['local','online','friends','rewards']){
  assert.match(html,new RegExp('id="p20-'+id+'"'));
  assert.match(html,new RegExp('id="p20-tab-'+id+'"'));
 }
});
test('Phase 20: old functional mount points and scripts retained',()=>{
 const html=read('index.html');
 for(const id of ['teams-container','category-select','time-input','rounds-input','phase7-setup','phase8-setup','phase9-setup','phase10-setup','phase17-setup'])
  assert.match(html,new RegExp('id="'+id+'"'));
 for(const name of ['script.js','phase9.js','phase10.js','phase13.js','phase15.js','phase17.js','phase20.js'])
  assert.match(html,new RegExp('src="'+name.replace('.','\.')+'"'));
});
test('Phase 20: accessible tabs and hidden panel treatment',()=>{
 const html=read('index.html');
 assert.match(html,/role="tablist"/);
 assert.match(html,/role="tabpanel"/);
 assert.match(read('phase20.css'),/\.p20-panel\[hidden\]\s*\{display:none!important/);
 assert.match(read('phase20.js'),/ArrowRight/);
 assert.match(read('phase20.js'),/aria-selected/);
});
