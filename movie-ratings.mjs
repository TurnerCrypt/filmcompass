const cache=new Map();
export async function enrichMovieRatings(movies,{apiKey,fetchImpl=fetch}={}){
 if(!apiKey?.trim())return movies;
 return Promise.all(movies.map(async movie=>{
  const key=movie.title.toLowerCase()+'|'+(movie.year||'');
  const existing=cache.get(key);if(existing&&existing.until>Date.now())return {...movie,...existing.data};
  try{
   const url=new URL('https://www.omdbapi.com/');url.search=new URLSearchParams({apikey:apiKey,t:movie.title,type:'movie',...(movie.year?{y:String(movie.year)}:{})});
   const response=await fetchImpl(url,{signal:AbortSignal.timeout(6000),redirect:'error'});if(!response.ok)return movie;
   const d=await response.json(),rating=Number(d.imdbRating),year=Number(String(d.Year).slice(0,4));
   if(d.Response!=='True'||d.Type!=='movie'||!/^tt\d+$/.test(d.imdbID)||!/^\d+(\.\d+)?$/.test(d.imdbRating)||rating<0||rating>10||!Number.isInteger(year)||(movie.year&&String(movie.year)!==String(year)))return movie;
   if(!movie.year&&d.Title?.normalize('NFKC').toLowerCase()!==movie.title.normalize('NFKC').toLowerCase())return movie;
   const runtime=/^(\d+) min$/.exec(d.Runtime||'');
   const data={year,imdbRating:rating,imdbId:d.imdbID,minutes:runtime?Number(runtime[1]):null,genre:d.Genre==='N/A'?'':d.Genre||'',image:typeof d.Poster==='string'&&d.Poster.startsWith('https://')?d.Poster:null};
   if(cache.size>=500)cache.delete(cache.keys().next().value);
   cache.set(key,{until:Date.now()+86400000,data});return {...movie,...data};
  }catch{return movie}
 }));
}
