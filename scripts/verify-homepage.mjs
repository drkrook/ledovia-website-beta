// Source/runtime checks; these do not replace browser rendering or assistive-technology tests.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';
import sharp from 'sharp';
const home=await readFile('dist/index.html','utf8');
assert.match(home,/Adventure Starts/);
assert.ok(home.includes('Solutions for'));
assert.ok(home.includes('Real-World Needs'));
assert.ok(home.includes('Ready for the Adventure.<br>Prepared for the Unexpected.'));
assert.match(home,/<header[^>]*class="cinematic-header"/);
assert.ok(home.includes('brand/ledovia-logo-white.svg'));
assert.match(home,/<video[^>]*muted[^>]*loop[^>]*playsinline[^>]*preload="none"/);
assert.ok(!/<video[^>]*autoplay/.test(home));
for(const source of home.matchAll(/<source\b([^>]+)>/g)){
 assert.ok(/\bdata-src=/.test(source[1]));
 assert.ok(!/(?:^|\s)src=/.test(source[1]),'Static source must not initiate a video download');
}
assert.match(home,/<button[^>]*id="film-toggle"[^>]*type="button"[^>]*aria-controls="adventure-film"/);
for(const destination of ['pricing/#travel-title','pricing/#survival-title','contact/?interest=response','contact/?interest=government']) assert.ok(home.includes(`/ledovia-website-beta/${destination}`));
assert.ok(home.includes('id="how-it-works"'));
assert.ok(home.includes('Professional offerings planned.'));
assert.ok(!/type="submit"|checkout|free trial/i.test(home));
const manifest=JSON.parse(await readFile('docs/V1.7B.1-MEDIA-PROVENANCE.json','utf8'));
for(const asset of manifest.exports){
 const bytes=await readFile(asset.path);
 assert.ok(home.includes(asset.path.replace('public/','/ledovia-website-beta/')+'?'+manifest.cache_query));
 if(process.argv.includes('--live')){
  const response=await fetch('https://drkrook.github.io/ledovia-website-beta/'+asset.path.slice('public/'.length)+'?'+manifest.cache_query,{cache:'no-store'});
  assert.equal(response.status,200);const published=Buffer.from(await response.arrayBuffer());
  assert.equal(createHash('sha256').update(published).digest('hex'),asset.sha256);
 }
 assert.equal(bytes.length,asset.bytes);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
 if(asset.path.endsWith('.webp')){const metadata=await sharp(bytes).metadata();assert.equal(metadata.width,asset.width);assert.equal(metadata.height,asset.height);}
 else{assert.ok(asset.duration>=25 && asset.duration<=35);assert.equal(asset.audio_streams,0);assert.equal(asset.width,1280);assert.equal(asset.height,720);assert.ok(asset.bytes<8_000_000);}
}
for(const source of manifest.sources){assert.equal(source.license,'https://www.pexels.com/license/');assert.ok(source.creator);assert.match(source.source_sha256,/^[a-f0-9]{64}$/);assert.ok(home.includes(source.source_page));}
assert.ok(!home.includes('9210957'), 'Passive campsite scene must not remain in homepage credits');
assert.ok(home.includes('6942274'));
assert.ok(home.includes('home-refresh'));
// Execute the shipped film controller with small DOM/media doubles to test download policy.
const filmSource=await readFile('src/components/AdventureFilm.astro','utf8');
const script=filmSource.match(/<script>([\s\S]*?)<\/script>/)[1];
const compiled=ts.transpileModule(script,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
function scenario({mobile=false,reduced=false,saveData=false}={}){
 class Events{events={};addEventListener(type,fn){(this.events[type]??=[]).push(fn);}emit(type){for(const fn of this.events[type]??[]) fn();}}
 const sources=[{dataset:{src:'film.webm'},removeAttribute(){delete this.src;}},{dataset:{src:'film.mp4'},removeAttribute(){delete this.src;}}];
 const film=Object.assign(new Events(),{paused:true,muted:true,loads:0,plays:0,classList:{add(){},remove(){}},querySelectorAll:()=>sources,load(){this.loads++;},pause(){this.paused=true;this.emit('pause');},async play(){this.plays++;this.paused=false;this.emit('playing');}});
 const toggle=Object.assign(new Events(),{hidden:true,textContent:''});const status={textContent:''};
 const motion=Object.assign(new Events(),{matches:reduced});const screen=Object.assign(new Events(),{matches:mobile});const connection=Object.assign(new Events(),{saveData});
 const document=Object.assign(new Events(),{hidden:false,querySelector:selector=>selector==='#adventure-film'?film:selector==='#film-toggle'?toggle:status});
 vm.runInNewContext(compiled,{document,navigator:{connection},window:{matchMedia:query=>query.includes('reduced-motion')?motion:screen}},{timeout:1000});
 return {film,toggle,sources,motion,screen,connection,document};
}
for(const options of [{mobile:true},{reduced:true},{saveData:true},{mobile:true,reduced:true}]){
 const s=scenario(options);assert.equal(s.film.plays,0);assert.ok(s.sources.every(source=>!source.src));assert.equal(s.toggle.hidden,false);
 s.toggle.emit('click');assert.equal(s.film.plays,1);assert.equal(s.film.muted,true);assert.ok(s.sources.every(source=>source.src));
}
const desktop=scenario();assert.equal(desktop.film.plays,1);desktop.toggle.emit('click');assert.equal(desktop.film.paused,true);desktop.document.emit('visibilitychange');assert.equal(desktop.film.plays,1,'User pause must survive policy checks');
const changed=scenario();changed.motion.matches=true;changed.motion.emit('change');assert.equal(changed.film.paused,true);assert.ok(changed.sources.every(source=>!source.src));
console.log('PASS homepage: licensed media hashes/dimensions, silent 25–35s encodes, source-only video loading; mobile/reduced-motion/data-saving poster policy, explicit play/pause and motion preference changes tested using DOM/media doubles. Browser rendering unverified.');
