import fs from 'node:fs/promises';
import path from 'node:path';
const origin='https://www.project-eyeopener.org';
const pages=[['','Home'],['about-the-project','About Us'],['recent-findings','Recent Findings'],['perceptual-learning','Development & Learning'],['ophthamology','Ophthalmology'],['publications','Publications'],['people','People'],['funding','Funding'],['s-projects-side-by-side','Research Highlights'],['contact-us','Contact Us']];
await fs.mkdir('archive',{recursive:true}); await fs.mkdir('public/assets',{recursive:true});
const assets=new Map();
const attr=(s,n)=>s.match(new RegExp('\\b'+n+'="([^"]*)"','i'))?.[1]||'';
const clean=s=>s.replace(/<span\b[^>]*>|<\/span>/g,'').replace(/\s(?:class|style|data-[\w-]+|id|target)="[^"]*"/g,'').replace(/\u200b/g,'').replace(/<p>\s*(?:&nbsp;|<br\s*\/?>)*\s*<\/p>/g,'').replace(/Eye Opner/g,'Eye Opener');
async function localize(url){
 if(!url.startsWith('https://static.wixstatic.com/')&&!url.startsWith('https://video.wixstatic.com/')) return url;
 if(assets.has(url))return assets.get(url);
 const ext=new URL(url).pathname.match(/\.(jpe?g|png|gif|svg|webp|pdf|mp4)(?:\/|$)/i)?.[1]||'bin';
 const name=`assets/${String(assets.size+1).padStart(3,'0')}.${ext}`;assets.set(url,name);
 const res=await fetch(url); if(!res.ok)throw Error(`${res.status} ${url}`);
 await fs.writeFile('public/'+name,Buffer.from(await res.arrayBuffer()));return name;
}
const data=[];
for(const [slug,title] of pages){
 const response=await fetch(origin+'/'+slug);if(!response.ok)throw Error(response.status+' '+slug);
 const html=await response.text();await fs.writeFile('archive/'+(slug||'home')+'.html',html);
 const main=html.match(/<main\b[\s\S]*?<\/main>/)?.[0]||'';
 const blocks=[];
 const rx=/<div\b[^>]*data-testid="richTextElement"[^>]*>([\s\S]*?)<\/div>|<img\b[^>]*>|<a\b[^>]*class="[^"]*wixui-button[^"]*"[^>]*>[\s\S]*?<\/a>|<iframe\b[^>]*>/g;
 for(const m of main.matchAll(rx)){
  if(m[1]){let text=clean(m[1]);for(const a of text.matchAll(/href="([^"]+)"/g)){const local=await localize(a[1]);text=text.replace(a[1],local);}if(text.replace(/<[^>]+>/g,'').trim())blocks.push({type:'text',html:text});}
  else if(m[0].startsWith('<img')){const src=attr(m[0],'src');if(src)blocks.push({type:'image',src:await localize(src),alt:attr(m[0],'alt')});}
  else if(m[0].startsWith('<a'))blocks.push({type:'text',html:clean(m[0])});
  else blocks.push({type:'embed',src:attr(m[0],'src')});
 }
 data.push({slug,title,blocks}); console.log(slug||'home',blocks.length,'blocks');
}
const home=await fs.readFile('archive/home.html','utf8');
const logos=[];for(const m of home.split('<main')[0].matchAll(/<img\b[^>]*>/g))logos.push(await localize(attr(m[0],'src')));
await fs.writeFile('content.json',JSON.stringify({pages:data,logos},null,2));
await fs.writeFile('archive/asset-manifest.json',JSON.stringify(Object.fromEntries(assets),null,2));
console.log('Downloaded',assets.size,'assets');
