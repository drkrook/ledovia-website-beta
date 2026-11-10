import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve('dist');
const origin='https://drkrook.github.io';
const base='/ledovia-website-beta/';
const routes=['','solutions/travel/','solutions/outdoors/','solutions/response/','solutions/government/','how-it-works/','about/','contact/','pricing/','404.html'];
const live=process.argv.includes('--live');
const {getPriceExample}=await import('../src/lib/illustrative-pricing.ts');
for(const [period,travel,survival,suffix] of [
 ['monthly','$4.99','$7.99','/ month'],
 ['annual','$49.99','$79.99','/ year'],
 ['monthly','$4.99','$7.99','/ month'],
]) {
 assert.deepEqual(getPriceExample('travel',period),{amount:travel,suffix});
 assert.deepEqual(getPriceExample('survival',period),{amount:survival,suffix});
}
console.log('PASS selector price logic: monthly → annual → monthly; exact owner-supplied amounts and billing labels.');
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
 for(const [,srcset] of html.matchAll(/srcset="([^"]+)"/g)) {
  for(const candidate of srcset.split(',')) {
   const [asset,descriptor]=candidate.trim().split(/\s+/);
   assert.match(descriptor,/^\d+w$/);
   const parsed=new URL(asset,origin+base+route);
   assert.ok(parsed.pathname.startsWith(base),`Srcset base escape: ${asset}`);
   assert.ok((await stat(path.join(root,parsed.pathname.slice(base.length)))).isFile(),`Missing srcset asset: ${asset}`);
   resources.add(parsed.pathname);links++;
  }
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
async function inspectPublic(directory,relative='') {
 for(const entry of await readdir(directory,{withFileTypes:true})) {
  const name=path.posix.join(relative,entry.name);
  if(entry.isDirectory()){await inspectPublic(path.join(directory,entry.name),name);continue;}
  const source=await readFile(path.join(directory,entry.name));
  const built=await readFile(path.join(root,name));
  assert.ok(source.equals(built),`Public asset changed or missing: ${name}`);
  resources.add(base+name);
 }
}
await inspectPublic('public');
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
const pricing=await readFile(path.join(root,'pricing/index.html'),'utf8');
assert.ok(pricing.includes('BETA PREVIEW — ILLUSTRATIVE PRICING ONLY'));
assert.ok(pricing.includes('Prices, billing periods, package features, and availability are examples for evaluation and may change before launch. Subscriptions and purchases are not currently available.'));
assert.equal((pricing.match(/>Illustrative Beta price</g)||[]).length,2);
assert.match(pricing, /data-example-price="travel"[^>]*>\$4\.99</);
assert.match(pricing, /data-example-price="survival"[^>]*>\$7\.99</);
assert.match(pricing,/<fieldset[^>]*id="billing-selector"[^>]*disabled/);
assert.match(pricing,/<input[^>]*name="illustrative-billing"[^>]*value="monthly"[^>]*checked/);
assert.match(pricing,/<input[^>]*name="illustrative-billing"[^>]*value="annual"/);
assert.match(pricing,/id="billing-status"[^>]*role="status"/);
assert.ok(pricing.includes('Enable JavaScript to compare annual examples'));
assert.equal((pricing.match(/scope="row"/g)||[]).length,7);
assert.ok(!/<form|<iframe|<video|<button/i.test(pricing));
assert.ok(!/href="(?:mailto:|tel:|[^"]*(?:checkout|subscribe|purchase))/i.test(pricing));
const professional=pricing.slice(pricing.indexOf('<section class="professional-section'),pricing.indexOf('<section class="container pricing-section faq-section'));
assert.equal((professional.match(/>Planned</g)||[]).length,2);
assert.equal((professional.match(/>Contact Us</g)||[]).length,2);
assert.ok(!/<a\s|<button/.test(professional));
assert.ok(!(await readdir(root)).includes('CNAME'));
console.log('PASS pricing content: conspicuous illustrative labels, disabled no-JS selector fallback, seven qualified comparison rows, Planned professional sections, no purchase controls.');
console.log(`PASS ${live?'LIVE HTTP + exact built bytes':'STATIC'}: ${routes.length} pages, ${links} link/asset references, ${resources.size} unique resources; base paths, fragments, metadata, landmarks, no forms/storage/CNAME.`);
