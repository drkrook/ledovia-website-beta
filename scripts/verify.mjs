import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve('dist');
const origin='https://drkrook.github.io';
const base='/ledovia-website-beta/';
const routes=['','solutions/travel/','solutions/outdoors/','solutions/response/','solutions/government/','how-it-works/','about/','contact/','404.html'];
const live=process.argv.includes('--live');
const resources=new Set();
let links=0;
for(const route of routes){
 const local=path.join(root,route.endsWith('.html')?route:route+'index.html');
 const html=await readFile(local,'utf8');
 assert.match(html,/<html lang="en"/);
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
 assert.match(html,/<main[^>]*id="main"/);
 assert.match(html,/name="robots" content="noindex,nofollow"/);
 assert.match(html,/name="description"/);
 assert.ok(html.includes(`rel="canonical" href="${origin}${base}${route}"`));
 assert.ok(!/<form|localStorage|serviceWorker/.test(html));
 for(const [,href] of html.matchAll(/(?:href|src)="([^" ]+)"/g)){
  if(/^(?:https?:|data:|mailto:)/.test(href))continue;
  const parsed=new URL(href,origin+base+route);
  assert.ok(parsed.pathname.startsWith(base),`Base escape: ${href}`);
  const relative=decodeURIComponent(parsed.pathname.slice(base.length));
  const target=path.join(root,relative.endsWith('/')||!relative?relative+'index.html':relative);
  assert.ok((await stat(target)).isFile(),`Missing link/asset ${href}`);
  if(parsed.hash){const dest=await readFile(target,'utf8');assert.ok(dest.includes(`id="${parsed.hash.slice(1)}"`),`Missing fragment ${href}`)}
  resources.add(parsed.pathname); links++;
 }
 if(live){
  const response=await fetch(origin+base+route,{cache:'no-store'});
  assert.equal(response.status,200,`Live route ${route}`);
  const deployed=await response.text();
  assert.equal(deployed,html,`Live HTML differs: ${route}`);
 }
}
for(const name of await readdir(path.join(root,'_astro'))){
 const file=path.join(root,'_astro',name);
 if(!(await stat(file)).isFile())continue;
 resources.add(base+'_astro/'+name);
 if(name.endsWith('.css')){
  const css=await readFile(file,'utf8');
  for(const [,asset] of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)){
   if(asset.startsWith('data:'))continue;
   const resolved=new URL(asset,origin+base+'_astro/'+name);
   assert.ok(resolved.pathname.startsWith(base));
   assert.ok((await stat(path.join(root,resolved.pathname.slice(base.length)))).isFile());
   resources.add(resolved.pathname);
  }
 }
}
resources.add(base+'robots.txt');
if(live){
 for(const resource of resources){
  const response=await fetch(origin+resource,{cache:'no-store'});
  assert.equal(response.status,200,`Live resource ${resource}`);
  const local=path.join(root,resource.slice(base.length));
  if((await stat(local)).isFile()){
   const bytes=await readFile(local);
   const remote=Buffer.from(await response.arrayBuffer());
   const hash=b=>createHash('sha256').update(b).digest('hex');
   assert.equal(hash(bytes),hash(remote),`Live asset differs: ${resource}`);
  }
 }
}
assert.ok(!(await readdir(root)).includes('CNAME'));
console.log(`PASS ${live?'LIVE HTTP + exact built bytes':'STATIC'}: ${routes.length} pages, ${links} link/asset references, ${resources.size} unique resources; base paths, fragments, metadata, landmarks, no forms/storage/CNAME.`);
