import fs from 'node:fs/promises';
const data=JSON.parse(await fs.readFile('content.json','utf8'));
const manifest=JSON.parse(await fs.readFile('archive/asset-manifest.json','utf8'));
const pending=[];
function asset(url){
 if(manifest[url])return manifest[url];
 const name='assets/'+new URL(url).pathname.split('/').pop();manifest[url]=name;
 pending.push(async()=>{let r=await fetch(url);if(!r.ok)throw Error(r.status+' '+url);await fs.writeFile('public/'+name,Buffer.from(await r.arrayBuffer()));});return name;
}
for(const page of data.pages){
 let raw=await fs.readFile('archive/'+(page.slug||'home')+'.html','utf8');
 const main=raw.match(/<main[\s\S]*?<\/main>/)[0];
 page.pdfs=[...main.matchAll(/href="(https:\/\/www.project-eyeopener.org\/_files\/[^" ]+\.pdf)"/g)].map(m=>m[1]).map(url=>({original:url,src:asset(url)}));
 for(const block of page.blocks)if(block.html)for(const pdf of page.pdfs)block.html=block.html.replaceAll(pdf.original,pdf.src);
 page.videos=[];
 for(const match of main.matchAll(/data-video-info="([^"]*)"/g)){
  const info=JSON.parse(match[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
  console.log('Video',page.slug,JSON.stringify(info));
  const q=info.qualities?.find(q=>q.quality==='720p')||info.qualities?.at(-1);
  if(q){const url='https://video.wixstatic.com/'+q.url;const name='assets/'+info.videoId+'.mp4';manifest[url]=name;pending.push(async()=>{const r=await fetch(url);if(!r.ok)throw Error(r.status+' '+url);await fs.writeFile('public/'+name,Buffer.from(await r.arrayBuffer()));});page.videos.push({src:name});}
 }
 const embeds=[...new Set(raw.replaceAll('\\/','/').match(/https:\/\/(?:www\.)?(?:youtube.com|youtu.be|player.vimeo.com)[^"\s<>]+/g)||[])];
 if(embeds.length)console.log('Embeds',page.slug,embeds);
}
for(let i=0;i<pending.length;i+=6)await Promise.all(pending.slice(i,i+6).map(f=>f()));
await fs.writeFile('content.json',JSON.stringify(data,null,2));await fs.writeFile('archive/asset-manifest.json',JSON.stringify(manifest,null,2));console.log('Saved PDFs and videos:',pending.length);
