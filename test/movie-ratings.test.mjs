import {test} from 'node:test';
import assert from 'node:assert/strict';
import {enrichMovieRatings} from '../movie-ratings.mjs';
test('live picks outside the browse catalog receive verified IMDb ratings',async()=>{
 const result=await enrichMovieRatings([{title:'New Fixture Film',year:2024}],{apiKey:'private-fixture',fetchImpl:async()=>Response.json({Response:'True',Title:'New Fixture Film',Type:'movie',Year:'2024',imdbRating:'8.2',imdbID:'tt9991234'})});
 assert.equal(result[0].imdbRating,8.2);assert.equal(JSON.stringify(result).includes('private-fixture'),false);
});
test('wrong years and unverified title matches never receive scores',async()=>{
 for(const movie of [{title:'Different Fixture',year:2023},{title:'Different Fixture'}]){
 const result=await enrichMovieRatings([movie],{apiKey:'fixture',fetchImpl:async()=>Response.json({Response:'True',Title:'Unrelated Film',Type:'movie',Year:'2024',imdbRating:'8.2',imdbID:'tt9991235'})});assert.equal(result[0].imdbRating,undefined);
 }
});
