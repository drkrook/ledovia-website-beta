import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const baseline=JSON.parse(await readFile('docs/V1.7B.2-BASELINE-CHECKS.json','utf8'));
for(const [file,expected] of Object.entries(baseline.content_sha256)){
 const source=(await readFile(file,'utf8')).replace(/<style>[\s\S]*?<\/style>/g,'').replace(/aria-hidden="true">[↗→]/g,'aria-hidden="true">ARROW').trim();
 assert.equal(hash(source),expected,`Protected content/logic changed: ${file}`);
}
for(const [file,expected] of Object.entries(baseline.protected_file_sha256)) assert.equal(hash(await readFile(file)),expected,`Protected asset/module changed: ${file}`);
const css=await readFile('src/styles/global.css','utf8');
for(const [name,value] of Object.entries({night:'#07191C',expedition:'#113E41',trail:'#17646A',amber:'#EDAA43',mist:'#F4F6F2',frost:'#E8F5F1',white:'#FFFFFF'})) assert.ok(css.includes(`--${name}:${value}`));
for(const route of ['','pricing/','contact/','about/','how-it-works/','solutions/travel/','solutions/outdoors/','solutions/response/','solutions/government/','404.html']){
 const html=await readFile('dist/'+(route.endsWith('.html')?route:route+'index.html'),'utf8');
 assert.match(html,/<header[^>]*class="cinematic-header"/);assert.ok(html.includes('/brand/ledovia-logo-white.svg'));
}
const lum=color=>{const values=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return values.reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);};
for(const [fg,bg] of [['#E8F5F1','#113E41'],['#E8F5F1','#07191C'],['#EDAA43','#113E41'],['#EDAA43','#07191C'],['#07191C','#EDAA43'],['#113E41','#F4F6F2']]){const values=[lum(fg),lum(bg)].sort((a,b)=>a-b);assert.ok((values[1]+.05)/(values[0]+.05)>=4.5);}
console.log('PASS shared theme: approved palette, white-logo dark headers on 10 routes, protected content/logic and original image/video/module bytes unchanged, principal text contrast >=4.5:1.');
