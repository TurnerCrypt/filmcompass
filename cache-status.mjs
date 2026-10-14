let lastProbe=null;
export async function sharedCacheStatus(){
 if(lastProbe&&lastProbe.until>Date.now())return lastProbe.status;
 const url=process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL,token=process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN;
 if(!url||!token)return 'not-configured';
 const key='filmcompass:health:'+crypto.randomUUID();
 async function command(body){const r=await fetch(url,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(2000)});if(!r.ok)throw new Error();return (await r.json()).result}
 let status='unavailable';try{await command(['SET',key,'ok','EX',30]);if(await command(['GET',key])==='ok')status='ready';}catch{}
 lastProbe={status,until:Date.now()+300000};return status;
}
