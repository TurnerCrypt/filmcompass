const memory=new Map(),pending=new Map();let blockedUntil=0;
export function createOmdbLookup({fetchImpl=fetch,now=Date.now,shared=true}={}){
 const local=shared?memory:new Map(),inflight=shared?pending:new Map();
 const redisUrl=process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL,redisToken=process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN;
 async function redis(command){if(!shared||!redisUrl||!redisToken)return null;try{const r=await fetch(redisUrl,{method:'POST',headers:{Authorization:'Bearer '+redisToken,'Content-Type':'application/json'},body:JSON.stringify(command),signal:AbortSignal.timeout(1500)});if(!r.ok)return null;return (await r.json()).result;}catch{return null}}
 return async(url,options={})=>{
 const key='filmcompass:omdb:v1:'+encodeURIComponent([url.searchParams.get('type')||'movie',url.searchParams.get('t')?.trim().toLowerCase(),url.searchParams.get('y')||''].join('|'));
 const saved=local.get(key);if(saved&&saved.until>now())return Response.json(saved.data);
 if(inflight.has(key))return Response.json(await inflight.get(key));
 const job=(async()=>{const stored=await redis(['GET',key]);if(stored){try{const data=JSON.parse(stored);local.set(key,{data,until:now()+3600000});return data}catch{}}
 if((shared&&blockedUntil>now())||await redis(['GET','filmcompass:omdb:quota-blocked']))return {Response:'False',Error:'Request limit reached!'};
 let response;try{response=await fetchImpl(url,options);}catch{return {Response:'False',Error:'Movie details temporarily unavailable'}}
 let data;try{data=await response.json()}catch{return {Response:'False',Error:'Movie details temporarily unavailable'}}
 if(/limit/i.test(data.Error||'')){if(shared)blockedUntil=now()+3600000;await redis(['SET','filmcompass:omdb:quota-blocked','1','EX',3600]);return data;}
 const ttl=data.Response==='True'?604800:3600;
 if(data.Response==='True'||(!/key/i.test(data.Error||'')&&response.ok)){if(local.size>=1000)local.delete(local.keys().next().value);local.set(key,{data,until:now()+ttl*1000});await redis(['SET',key,JSON.stringify(data),'EX',ttl]);}
 return data;})();inflight.set(key,job);try{return Response.json(await job)}finally{inflight.delete(key)}
 };
}
export const cachedOmdbFetch=createOmdbLookup();

