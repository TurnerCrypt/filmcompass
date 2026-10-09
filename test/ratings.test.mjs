import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRatingsService} from '../ratings.mjs';
const catalog=[{title:'Example Film',year:2020,kind:'movie'}];
test('ratings stay unavailable without a key',async()=>{assert.deepEqual(await createRatingsService({catalog})(),{available:false,ratings:[]})});
test('shared rating requests are cached and never return the key',async()=>{let calls=0;const get=createRatingsService({apiKey:'fixture-secret',catalog,fetchImpl:async url=>{calls++;assert.equal(url.searchParams.get('type'),'movie');return Response.json({Response:'True',Year:'2020',Type:'movie',imdbRating:'8.1',imdbID:'tt1234567'})}});const [a,b]=await Promise.all([get(),get()]);assert.equal(calls,1);assert.equal(a.ratings[0].rating,8.1);assert.deepEqual(a,b);assert.equal(JSON.stringify(a).includes('fixture-secret'),false);await get();assert.equal(calls,1)});
test('unavailable or wrong-year scores are not misrepresented',async()=>{for(const fixture of [{Year:'2020',imdbRating:'N/A'},{Year:'2021',imdbRating:'8.1'}]){const get=createRatingsService({apiKey:'fixture-secret',catalog,fetchImpl:async()=>Response.json({Response:'True',Type:'movie',imdbID:'tt1234567',...fixture})});assert.deepEqual((await get()).ratings,[])}});
