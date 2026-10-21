import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
const root=resolve(process.env.SERVE_DIST==='1'?'dist':'.');
const port=Number(process.env.PORT)||4173;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json','.txt':'text/plain; charset=utf-8'};
export const csp="default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'none'; font-src 'none'; form-action 'none'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; manifest-src 'self'";
export function server() { return createServer(async(req,res)=>{
  const headers={'Content-Security-Policy':csp,'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cross-Origin-Opener-Policy':'same-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=()','Cache-Control':'no-store'};
  const end=(code,body)=>{res.writeHead(code,{...headers,'Content-Type':'text/plain; charset=utf-8'});res.end(body);};
  if(!['GET','HEAD'].includes(req.method)){end(405,'Method not allowed');return;}
  try {
    const raw=new URL(req.url,'http://localhost').pathname;
    const name=decodeURIComponent(raw);
    if(name.includes('\0')||name.includes('\\')||name.split('/').some(x=>x==='..'||x.startsWith('.'))){end(403,'Forbidden');return;}
    const target=resolve(root,`.${name==='/'?'/index.html':name}`);
    if(target!==root&&!target.startsWith(root+sep)){end(403,'Forbidden');return;}
    const info=await stat(target);if(!info.isFile()){end(404,'Not found');return;}
    const body=await readFile(target);
    res.writeHead(200,{...headers,'Content-Type':types[extname(target)]||'application/octet-stream'});
    res.end(req.method==='HEAD'?undefined:body);
  } catch {end(404,'Not found');}
}); }
if(process.argv[1] && import.meta.url === new URL(`file://${resolve(process.argv[1])}`).href) server().listen(port,'127.0.0.1',()=>console.log(`Clariquote → http://127.0.0.1:${port}`));
