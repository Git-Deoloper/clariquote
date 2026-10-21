import {cp, mkdir, rm} from 'node:fs/promises';
const files=['index.html','styles.css','src','assets','manifest.webmanifest','robots.txt','_headers','sw.js'];
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});
for(const f of files) await cp(f,`dist/${f}`,{recursive:true});
console.log('✓ Production site ready in dist/');
