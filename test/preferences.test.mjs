import {test} from 'node:test';
import assert from 'node:assert/strict';
import {applyPreferences,validatePreferences} from '../preferences.mjs';
const films=[{title:'Space',genre:'Sci-Fi, Drama',minutes:150},{title:'Puzzle',genre:'Mystery, Thriller',minutes:110},{title:'Warm',genre:'Comedy, Family',minutes:95},{title:'Unknown',genre:'Comedy',minutes:null}];
test('mood changes ranking while preserving Qloo order for ties',()=>{
 assert.equal(applyPreferences(films,{mood:'wonder'})[0].title,'Space');
 assert.equal(applyPreferences(films,{mood:'comfort'})[0].title,'Warm');
 assert.equal(applyPreferences(films,{mood:'suspense'})[0].title,'Puzzle');
});
test('short requests exclude long and unknown runtimes',()=>{assert.deepEqual(applyPreferences(films,{maxMinutes:120}).map(x=>x.title),['Puzzle','Warm']);assert.deepEqual(applyPreferences([{minutes:120},{minutes:119}],{maxMinutes:120}).map(x=>x.minutes),[119])});
test('guided focus changes ranking and malformed preferences are rejected',()=>{assert.equal(applyPreferences(films,{focus:'mystery'})[0].title,'Puzzle');assert.throws(()=>validatePreferences({mood:'invented'}));assert.throws(()=>validatePreferences({maxMinutes:'120'}))});

test('pure comedy requires comedy and rejects genre blends and unknown genres',()=>{
 const movies=[{title:'Pure',genre:'Comedy'},{title:'Blend',genre:'Comedy, Drama'},{title:'Other',genre:'Drama'},{title:'Unknown',genre:''}];
 assert.deepEqual(applyPreferences(movies,{includeGenres:['comedy'],strictGenres:true}).map(m=>m.title),['Pure']);
 assert.deepEqual(applyPreferences(movies,{includeGenres:['comedy']}).map(m=>m.title),['Pure','Blend']);
});

test('actor and language filters require positive metadata matches',()=>{const movies=[{title:'Match',actors:['Denzel Washington'],languages:['English']},{title:'Wrong',actors:['Another Actor'],languages:['Korean']},{title:'Unknown'}];assert.deepEqual(applyPreferences(movies,{actor:'Denzel Washington',language:'English'}).map(m=>m.title),['Match']);assert.deepEqual(applyPreferences(movies,{language:'Korean'}).map(m=>m.title),['Wrong']);assert.throws(()=>validatePreferences({actor:123}))});
