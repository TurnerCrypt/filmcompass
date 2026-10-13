import {AppError} from './qloo.mjs';
import {enrichMovieRatings} from './movie-ratings.mjs';
const cache=new Map();
export async function searchMovies(input,{apiKey=process.env.QLOO_API_KEY,omdbApiKey=process.env.OMDB_API_KEY,fetchImpl=fetch,enrichImpl=enrichMovieRatings}={}){
 const query=typeof input?.query==='string'?input.query.trim():'';const year=input?.year?Number(input.year):null,genre=input?.genre||'';
 if(query.length>120||(year!==null&&(!Number.isInteger(year)||year<1888||year>2026))||!['','action','adventure','animation','comedy','crime','drama','family','fantasy','horror','mystery','romance','sci-fi','thriller','documentary'].includes(genre))throw new AppError(400,'INVALID_SEARCH','Use a title, a year from 1888 to 2026, and a supported genre.');
 if(!apiKey?.trim())throw new AppError(503,'KEY_PENDING','Live movie search is not connected.');
 const key=JSON.stringify([query.toLowerCase(),year,genre]);const saved=cache.get(key);if(saved&&saved.until>Date.now())return saved.data;
 const url=new URL(query?'/search':'/v2/insights','https://hackathon.api.qloo.com');
 url.search=new URLSearchParams(query?{query,types:'urn:entity:movie',take:'30'}:{'filter.type':'urn:entity:movie',take:'30',...(genre?{'filter.tags':'urn:tag:genre:media:'+genre}:{}),...(year?{'filter.release_year.min':String(year),'filter.release_year.max':String(year)}:{})});
 let response;try{response=await fetchImpl(url,{headers:{'X-Api-Key':apiKey,Accept:'application/json'},signal:AbortSignal.timeout(15000),redirect:'error'});}catch{throw new AppError(504,'SEARCH_TIMEOUT','Movie search took too long. Please retry.');}
 if(!response.ok)throw new AppError(response.status===429?429:502,'SEARCH_UNAVAILABLE','Movie search is temporarily unavailable. Please retry shortly.');
 const body=await response.json();const rows=body.results?.entities||body.results||body.entities;if(!Array.isArray(rows))throw new AppError(502,'SEARCH_FORMAT','Movie search returned an unexpected result.');
 const seen=new Set();const base=rows.filter(e=>typeof e.entity_id==='string'&&typeof e.name==='string'&&(query?e.type==='urn:entity:movie'||e.types?.includes('urn:entity:movie'):true)&&!seen.has(e.entity_id)&&seen.add(e.entity_id)).map(e=>({id:e.entity_id,title:e.name,year:Number(String(e.properties?.release_year??e.properties?.release_date??'').slice(0,4))||null,kind:'movie',genre:'',image:e.properties?.image?.url?.startsWith('https://')?e.properties.image.url:null}));
 const enriched=await enrichImpl(base,{apiKey:omdbApiKey});const movies=enriched.filter(m=>(!year||m.year===year)&&(!genre||(m.genre||'').toLowerCase().split(/,\s*/).includes(genre)));
 const data={movies,notice:'Live provider results. Year and genre filters apply to this returned set; coverage and IMDb scores vary by title.'};
 if(cache.size>=100)cache.delete(cache.keys().next().value);cache.set(key,{until:Date.now()+300000,data});return data;
}
