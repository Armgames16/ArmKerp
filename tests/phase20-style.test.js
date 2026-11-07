const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'phase20.css'),'utf8');
test('Phase 20.1: latest stylesheet is linked after the legacy phase styles',()=>{
  assert.match(html,/href="phase20\.css"/);
  assert.ok(html.indexOf('href="phase20.css"')>html.indexOf('href="phase17.css"'));
});
test('Phase 20.1: mobile and light theme rules are present',()=>{
  assert.match(css,/@media\(max-width:520px\)/);
  assert.match(css,/:root\[data-theme="light"\]/);
  assert.match(css,/\.p20-panel\[hidden\]/);
});
