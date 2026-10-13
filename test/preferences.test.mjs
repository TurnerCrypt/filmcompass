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
