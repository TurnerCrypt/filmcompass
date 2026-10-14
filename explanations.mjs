const split=value=>(value||'').toLowerCase().split(/,\s*/).filter(Boolean);
export function explainMovie(movie,seeds,preferences){
 const genres=split(movie.genre),reasons=[];
 for(const seed of seeds){const shared=genres.filter(g=>split(seed.genre).includes(g));if(shared.length)reasons.push(`Shares ${shared.join(' / ')} with ${seed.title}.`);}
 if(!reasons.length)reasons.push(preferences.actor?'Verified actor filmography match.':seeds.length?'Selected by Qloo from your favourite films; no verified shared genres are available.':'Discovered through Qloo for your requested genre; no favourite movie was needed.');
 if(preferences.actor)reasons.push('Verified listed cast includes '+preferences.actor+'.');if(preferences.language)reasons.push('Listed film languages include '+preferences.language+'; dubbing availability is not verified.');
 if(preferences.includeGenres?.length)reasons.push(`Matches your ${preferences.strictGenres?'pure ':''}${preferences.includeGenres.join(' / ')} request.`);
 if(preferences.excludeGenres?.length)reasons.push(`Its listed genres exclude ${preferences.excludeGenres.join(' / ')}.`);
 if(preferences.maxMinutes&&Number.isFinite(movie.minutes))reasons.push(`${movie.minutes} minutes — under your ${preferences.maxMinutes}-minute limit.`);
 if(Number.isFinite(movie.imdbRating))reasons.push(`IMDb ${movie.imdbRating.toFixed(1)}/10 via OMDb; used to rank this shortlist.`);
 return reasons;
}
