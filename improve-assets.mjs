import fs from 'node:fs/promises';
const manifest=JSON.parse(await fs.readFile('archive/asset-manifest.json','utf8'));
const jobs=new Map();
for(const name of await fs.readdir('archive')){if(!name.endsWith('.html'))continue;const html=await fs.readFile('archive/'+name,'utf8');for(const m of html.matchAll(/<img\b[^>]+>/g)){
 const tag=m[0];const src=tag.match(/\bsrc="([^"]+)"/)?.[1];if(!manifest[src])continue;
 const width=Number(tag.match(/\bwidth="(\d+)"/)?.[1]);const height=Number(tag.match(/\bheight="(\d+)"/)?.[1]);
 if(!width||!height)continue;const scale=Math.min(2,1400/Math.max(width,height));
 const url=src.replace(/\/fill\/w_\d+,h_\d+/,`/fill/w_${Math.round(width*scale)},h_${Math.round(height*scale)}`).replace(/,blur_\d+/g,'');
 jobs.set(manifest[src],url);
}}
const queue=[...jobs];for(let i=0;i<queue.length;i+=8)await Promise.all(queue.slice(i,i+8).map(async([file,url])=>{const r=await fetch(url);if(!r.ok)throw Error(r.status+' '+url);await fs.writeFile('public/'+file,Buffer.from(await r.arrayBuffer()));}));
await fs.writeFile('archive/full-resolution-assets.json',JSON.stringify(Object.fromEntries(queue),null,2));console.log('Updated',queue.length,'images at display resolution.');
