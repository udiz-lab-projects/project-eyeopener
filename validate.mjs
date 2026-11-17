import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('public');let count=0,links=0;const errors=[];
async function walk(dir){for(const f of await fs.readdir(dir,{withFileTypes:true})){const file=path.join(dir,f.name);if(f.isDirectory()){await walk(file);continue;}if(!file.endsWith('.html'))continue;count++;const s=await fs.readFile(file,'utf8');if(/wixstatic\.com|wixui-|thunderbolt|_files\/ugd/.test(s))errors.push('Wix dependency: '+file);const base=new URL(s.match(/<base href="([^"]+)"/)?.[1]||'./','http://test/'+path.relative(root,file).replaceAll('\\','/'));for(const m of s.matchAll(/(?:src|href)="([^"]+)"/g)){if(/^(https?:|mailto:|tel:|javascript:|#)/.test(m[1]))continue;const url=new URL(m[1],base);let target=path.join(root,decodeURIComponent(url.pathname));try{let st=await fs.stat(target);if(st.isDirectory())await fs.stat(path.join(target,'index.html'));links++;}catch{errors.push('Broken '+file+' → '+m[1]);}}}}
await walk(root);
const data=JSON.parse(await fs.readFile('content.json','utf8'));for(const p of data.pages){for(const f of p.pdfs||[]){const bytes=await fs.readFile('public/'+f.src);if(bytes.subarray(0,5).toString()!=='%PDF-')errors.push('Invalid PDF '+f.src);}}
console.log(JSON.stringify({pages:count,localReferences:links,errors},null,2));if(errors.length)process.exit(1);
