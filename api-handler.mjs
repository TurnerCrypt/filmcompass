import catalog from './catalog.json' with {type:'json'};
import {createRatingsService} from './ratings.mjs';
import {recommend,AppError} from './qloo.mjs';
let ratingsService,ratingsKey;
const limits=new Map();
const json=(status,data,extra={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});
async function readInput(request){let size=0;const chunks=[];const reader=request.body?.getReader();if(!reader)throw new AppError(400,'INVALID_JSON','Send a JSON movie list.');while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>4096){await reader.cancel();throw new AppError(413,'INPUT_TOO_LARGE','Your movie list is too long.');}chunks.push(value);}const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}try{return JSON.parse(new TextDecoder().decode(bytes))}catch{throw new AppError(400,'INVALID_JSON','Send a valid JSON movie list.');}}
export default async function handler(request,context={}){
 const url=new URL(request.url),path=url.pathname;
 try{
 if(path==='/api/config'&&request.method==='GET')return json(200,{liveAvailable:!!process.env.QLOO_API_KEY?.trim()});
 if(path==='/api/ratings'&&request.method==='GET'){
 if(!ratingsService||ratingsKey!==process.env.OMDB_API_KEY){ratingsKey=process.env.OMDB_API_KEY;ratingsService=createRatingsService({apiKey:ratingsKey,catalog});}
 return json(200,await ratingsService());}
 if(path!=='/api/recommendations')return json(404,{error:'Not found.'});
 if(request.method!=='POST')return json(405,{error:'Use POST for recommendations.'},{Allow:'POST'});
 if(request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return json(403,{error:'Requests must come from FilmCompass.'});
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json(415,{error:'Send JSON movie titles.'});
 const now=Date.now();for(const [key,value]of limits)if(now>value.until)limits.delete(key);const ip=context.ip||'unknown';const bucket=limits.get(ip)||{count:0,until:now+60000};if(++bucket.count>10)return json(429,{error:'Please wait a minute before trying again.'},{'Retry-After':'60'});limits.set(ip,bucket);
 return json(200,await recommend(await readInput(request),{apiKey:process.env.QLOO_API_KEY,signal:request.signal}));
 }catch(error){if(error instanceof AppError)return json(error.status,{code:error.code,error:error.message});return json(500,{error:'Something went wrong. Please try again.'});}
}

