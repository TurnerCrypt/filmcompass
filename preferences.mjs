import {AppError} from './qloo.mjs';
const moods={wonder:['sci-fi','fantasy','adventure','animation'],comfort:['comedy','family','animation','romance'],suspense:['thriller','mystery','crime','horror']};
const focuses={mystery:['mystery','thriller'],visuals:['sci-fi','fantasy','animation','adventure'],story:['drama','romance']};
export function validatePreferences(input){
 const {mood=null,maxMinutes=null,focus=null,excludeGenres=[],includeGenres=[],strictGenres=false}=input;
 if((mood!==null&&!Object.hasOwn(moods,mood))||(maxMinutes!==null&&(!Number.isInteger(maxMinutes)||maxMinutes<30||maxMinutes>300))||(focus!==null&&!Object.hasOwn(focuses,focus)))throw new AppError(400,'INVALID_PREFERENCES','Choose a supported mood, focus, and runtime.');
 if(!Array.isArray(excludeGenres)||excludeGenres.length>21||excludeGenres.some(g=>typeof g!=='string'||!['action','adventure','animation','biography','comedy','crime','documentary','drama','family','fantasy','history','horror','music','musical','mystery','romance','sci-fi','sport','thriller','war','western'].includes(g)))throw new AppError(400,'INVALID_PREFERENCES','Choose valid genre exclusions.');if(!Array.isArray(includeGenres)||includeGenres.length>5||includeGenres.some(g=>typeof g!=='string'||!['action','adventure','animation','biography','comedy','crime','documentary','drama','family','fantasy','history','horror','music','musical','mystery','romance','sci-fi','sport','thriller','war','western'].includes(g))||typeof strictGenres!=='boolean')throw new AppError(400,'INVALID_PREFERENCES','Choose valid required genres.');return {mood,maxMinutes,focus,excludeGenres,includeGenres,strictGenres};
}
export function applyPreferences(movies,{mood,maxMinutes,focus,excludeGenres=[],includeGenres=[],strictGenres=false}){
 return movies.filter(m=>{const gs=(m.genre||'').toLowerCase().split(/,\s*/);return !includeGenres.length||(includeGenres.every(g=>gs.includes(g))&&(!strictGenres||gs.every(g=>includeGenres.includes(g))))}).filter(m=>!excludeGenres.length||((m.genre||'')&&!excludeGenres.some(g=>(m.genre||'').toLowerCase().split(/,\s*/).includes(g)))).filter(m=>!maxMinutes||(Number.isFinite(m.minutes)&&m.minutes<maxMinutes)).map((m,index)=>{
 const genres=(m.genre||'').toLowerCase().split(/,\s*/);
 const matches=(moods[mood]||[]).filter(g=>genres.includes(g));
 const focusMatches=(focuses[focus]||[]).filter(g=>genres.includes(g));
 return {movie:{...m,note:`Qloo matched your favourites.${matches.length?' Its '+matches.join(' / ')+' genres fit your '+mood+' preference.':''}${focusMatches.length?' Its '+focusMatches.join(' / ')+' genres also fit your story interests.':''}${maxMinutes?' Verified runtime: '+m.minutes+' minutes.':''}`},score:matches.length*2+focusMatches.length,index};
 }).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,10).map(x=>x.movie);
}
