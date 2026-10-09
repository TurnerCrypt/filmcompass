import http from 'node:http';
import {readFileSync} from 'node:fs';
import {createRatingsService} from './ratings.mjs';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {recommend,AppError} from './qloo.mjs';
const root=new URL('./dist/',import.meta.url),port=Number(process.env.PORT||4173);
const files={'/':['index.html','text/html; charset=utf-8'],'/index.html':['index.html','text/html; charset=utf-8'],'/style.css':['style.css','text/css; charset=utf-8'],'/app.js':['app.js','text/javascript; charset=utf-8'],'/logo.svg':['logo.svg','image/svg+xml']};
const getRatings=createRatingsService({apiKey:process.env.OMDB_API_KEY,catalog:JSON.parse(readFileSync(new URL('./catalog.json',import.meta.url),'utf8'))});
const limits=new Map();
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
export const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');
 const pathname=new URL(req.url,'http://localhost').pathname;
 try{
 if(pathname==='/api/ratings'&&req.method==='GET')return json(res,200,await getRatings());
 if(pathname==='/api/config'&&req.method==='GET')return json(res,200,{liveAvailable:!!process.env.QLOO_API_KEY?.trim()});
 if(pathname==='/api/recommendations'){
 if(req.method!=='POST'){res.setHeader('Allow','POST');return json(res,405,{error:'Use POST for recommendations.'});}
 // Local preview only; do not trust an arbitrary browser Origin or Host.
 const host=req.headers.host;if(![`127.0.0.1:${port}`,`localhost:${port}`].includes(host))return json(res,403,{error:'Invalid host.'});
 if(req.headers.origin&&!['http://'+host].includes(req.headers.origin))return json(res,403,{error:'Requests must come from FilmCompass.'});
 if(!req.headers['content-type']?.startsWith('application/json'))return json(res,415,{error:'Send JSON movie titles.'});
 const ip=req.socket.remoteAddress,now=Date.now();for(const [k,v]of limits)if(now>v.until)limits.delete(k);const bucket=limits.get(ip)||{count:0,until:now+60000};if(++bucket.count>10){res.setHeader('Retry-After','60');return json(res,429,{error:'Please wait a minute before trying again.'});}limits.set(ip,bucket);
 let body='',size=0;for await(const chunk of req){size+=chunk.length;if(size>4096)return json(res,413,{error:'Your movie list is too long.'});body+=chunk;}let input;try{input=JSON.parse(body);}catch{return json(res,400,{error:'Invalid JSON request.'});}
 return json(res,200,await recommend(input,{apiKey:process.env.QLOO_API_KEY}));
 }
 if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'Method not supported.'});
 const file=files[pathname];if(!file)return json(res,404,{error:'Not found.'});const bytes=await readFile(new URL(file[0],root));res.writeHead(200,{'Content-Type':file[1],'Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:bytes);
 }catch(error){if(error instanceof AppError)return json(res,error.status,{code:error.code,error:error.message});json(res,500,{error:'Something went wrong. Please try again.'});}
});
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1])server.listen(port,'127.0.0.1',()=>console.log(`FilmCompass: http://127.0.0.1:${port}`));
