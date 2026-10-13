import {test} from 'node:test';
import assert from 'node:assert/strict';
import {explainMovie} from '../explanations.mjs';
test('explanations use verified genre overlaps and active constraints',()=>{const reasons=explainMovie({genre:'Comedy, Drama',minutes:95,imdbRating:7.2},[{title:'Chef',genre:'Comedy, Drama'}],{includeGenres:['comedy'],excludeGenres:['horror'],maxMinutes:120});assert.ok(reasons.some(r=>r.includes('Shares comedy / drama with Chef')));assert.ok(reasons.some(r=>r.includes('95 minutes')));assert.ok(reasons.some(r=>r.includes('IMDb 7.2')))});
test('missing metadata does not invent genre relationships or ratings',()=>{const reasons=explainMovie({},[{title:'unused'}],{});assert.equal(reasons.length,1);assert.ok(reasons[0].includes('no verified shared genres'))});

