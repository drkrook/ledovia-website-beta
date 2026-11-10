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
 assert.ok(!/localStorage|serviceWorker/.test(html));
 if(route!=='contact/') assert.ok(!/<form/.test(html));
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
assert.ok(!/<iframe|<video/i.test(pricing));
assert.ok(!/href="(?:tel:|[^"]*(?:checkout|subscribe|purchase))/i.test(pricing));
const contact=await readFile(path.join(root,'contact/index.html'),'utf8');
const {inquiryEmail,validateInquiryDraft,publicContactEmail,inquiryInterest}=await import('../src/lib/professional-inquiries.ts');
assert.equal(publicContactEmail,'contact@getledovia.com');
for(const product of ['response','government']) {
 const link=new URL(inquiryEmail(product));
 assert.equal(link.protocol,'mailto:');assert.equal(link.pathname,publicContactEmail);
 assert.ok(link.searchParams.get('subject').includes(product==='response'?'Ledovia Response':'Ledovia Government'));
 assert.ok(link.searchParams.get('body').includes('Current workflow:'));
 assert.ok(link.searchParams.get('body').includes('Requirements:'));
}
const validDraft={name:'Example User',organization:'Example Organization',email:'name@example.com',product:'response',needs:'We would like to discuss future field-team mapping needs.'};
assert.deepEqual(validateInquiryDraft(validDraft),{});
assert.deepEqual(validateInquiryDraft({...validDraft,product:'government'}),{});
assert.deepEqual(Object.keys(validateInquiryDraft({name:' ',organization:' ',email:'invalid',product:'other',needs:'short'})).sort(),['email','name','needs','organization','product']);
for(const email of ['first@second','first@@example.com','person@example.com\nBcc:other@example.com','a'.repeat(255)+'@example.com']) assert.ok(validateInquiryDraft({...validDraft,email}).email);
for(const name of [' ', 'a', 'a'.repeat(101)]) assert.ok(validateInquiryDraft({...validDraft,name}).name);
for(const organization of [' ', 'a', 'a'.repeat(101)]) assert.ok(validateInquiryDraft({...validDraft,organization}).organization);
for(const needs of [' '.repeat(30),'a'.repeat(19),'a'.repeat(2001)]) assert.ok(validateInquiryDraft({...validDraft,needs}).needs);
assert.deepEqual(validateInquiryDraft({...validDraft,needs:'a'.repeat(20)}),{});
assert.deepEqual(validateInquiryDraft({...validDraft,needs:'a'.repeat(2000)}),{});
assert.equal((pricing.match(/<form\b/g)||[]).length,0);
assert.equal((contact.match(/<form\b/g)||[]).length,1);
const inquiryForm=contact.match(/<form\b[^>]*>[\s\S]*?<\/form>/)?.[0];
assert.ok(inquiryForm);assert.match(inquiryForm,/id="professional-inquiry"/);assert.match(inquiryForm,/data-delivery="inactive"/);
assert.ok(!/\saction=|\sname=|type="submit"/.test(inquiryForm));
assert.match(inquiryForm,/id="inquiry-check"[^>]*type="button"[^>]*disabled/);
assert.ok(contact.includes('Form preview — sending is not available yet.'));
assert.ok(contact.includes('This form does not send or save them.'));
for(const [id,type] of [['name','text'],['organization','text'],['email','email']]) {
 assert.match(inquiryForm,new RegExp(`<label[^>]*for="inquiry-${id}"`));
 assert.match(inquiryForm,new RegExp(`<input[^>]*id="inquiry-${id}"[^>]*type="${type}"[^>]*required`));
 assert.ok(inquiryForm.includes(`id="inquiry-${id}-error"`));
}
assert.match(inquiryForm,/<select[^>]*id="inquiry-product"[^>]*required/);
assert.match(inquiryForm,/<textarea[^>]*id="inquiry-needs"[^>]*required[^>]*minlength="20"[^>]*maxlength="2000"/);
const mailLinks=[...(pricing+contact).matchAll(/href="(mailto:[^"]+)"/g)].map(match=>new URL(match[1].replaceAll('&amp;','&')));
assert.equal(mailLinks.length,5);
for(const mail of mailLinks) assert.equal(mail.pathname,publicContactEmail);
assert.ok(!pricing.includes('taponte'+'@getledovia.com'));
assert.equal((pricing.match(/class="planned-badge"[^>]*>Planned</g)||[]).length,2);
assert.equal((pricing.match(/Contact for Pricing — Planned Offering/g)||[]).length,2);
assert.ok(pricing.includes('Choose Your Ledovia.'));
assert.ok(!/<section[^>]*class="adventure-intro"/.test(pricing));
assert.equal((pricing.match(/Source-confirmed common capability; not a finalized package entitlement/g)||[]).length,10);
assert.equal((pricing.match(/aria-hidden="true" class="foundation-check"/g)||[]).length,10);
assert.ok(pricing.includes('Proposed package direction'));
console.log('PASS inquiry validation: required fields, trimming, email format, invalid product, length boundaries; 5 mailto links across Pricing and Contact target approved address and product-specific subjects.');
assert.ok(!(await readdir(root)).includes('CNAME'));
console.log('PASS pricing content: illustrative labels, selector fallback, seven comparison rows, Planned professional cards; only an inactive local-validation form, no purchase controls.');
console.log(`PASS ${live?'LIVE HTTP + exact built bytes':'STATIC'}: ${routes.length} pages, ${links} link/asset references, ${resources.size} unique resources; base paths, fragments, metadata, landmarks, inactive inquiry form only; no storage/CNAME.`);

for(const [query,expected] of [['','general'],['?interest=response','response'],['?interest=government','government'],['?interest=general','general'],['?interest=other','general'],['?interest=%3Cscript%3E','general'],['?interest=RESPONSE','general']]) assert.equal(inquiryInterest(query),expected);
assert.deepEqual(validateInquiryDraft({...validDraft,product:'general'}),{});
assert.match(contact,/<option value="general" selected/);
for(const product of ['response','government']) assert.ok(pricing.includes(`href="${base}contact/?interest=${product}"`));
assert.ok(!pricing.includes('href="#professional-inquiries"'));
for(const route of routes){const html=await readFile(path.join(root,route.endsWith('.html')?route:route+'index.html'),'utf8');assert.ok(html.includes(`href="${base}contact/"`));}
const formSource=await readFile('src/components/InquiryForm.astro','utf8');
assert.ok(formSource.includes('product.value=inquiryInterest(window.location.search)'));
assert.ok(formSource.includes("form.addEventListener('submit',event=>event.preventDefault())"));
assert.ok(!/fetch\(|XMLHttpRequest|sessionStorage|localStorage/.test(formSource));
console.log('PASS Contact routes, recognized product preselection and safe fallback, general inquiry, navigation destinations, local-only form safeguards and approved email addresses. Browser interaction unverified.');

const photoManifest=JSON.parse(await readFile('docs/V1.7A.3-ASSET-PROVENANCE.json','utf8'));
const {default:sharp}=await import('sharp');
assert.deepEqual(photoManifest.assets.map(a=>a.package),['response','government']);
for(const asset of photoManifest.assets){
 assert.ok(asset.photographer && asset.source_page.startsWith('https://') && asset.license_url.startsWith('https://'));
 assert.match(asset.source_sha256,/^[a-f0-9]{64}$/);
 assert.deepEqual(asset.exports.map(e=>e.width),[480,800]);
 for(const output of asset.exports){
  const bytes=await readFile(output.path);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),output.sha256);
  assert.equal(bytes.length,output.bytes);
  const image=await sharp(bytes).metadata();
  assert.equal(image.format,'webp');assert.equal(image.width,output.width);assert.equal(image.height,output.height);
  assert.ok(pricing.includes(output.path.replace('public/',base)));
 }
 assert.ok(pricing.includes(asset.source_page));
}
assert.ok(pricing.includes('The appearance of U.S. Department of War (DoW) visual information does not imply or constitute DoW endorsement.'));
console.log('PASS professional photography: four responsive WebP variants decoded, dimensions/bytes/SHA-256 match provenance; source credits and non-endorsement notice present.');
