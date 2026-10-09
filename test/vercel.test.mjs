import {test} from 'node:test';
import assert from 'node:assert/strict';
import config from '../api/config.mjs';
import ratings from '../api/ratings.mjs';
import recommendations from '../api/recommendations.mjs';
test('Vercel config adapter returns only key availability',async()=>{
 const r=await config.fetch(new Request('https://filmcompass.example/api/config'));
 const data=await r.json();assert.equal(r.status,200);assert.deepEqual(Object.keys(data),['liveAvailable']);
});
test('Vercel adapters handle missing keys without external calls',async()=>{
 const saved=process.env.OMDB_API_KEY;delete process.env.OMDB_API_KEY;
 try{const r=await ratings.fetch(new Request('https://filmcompass.example/api/ratings'));assert.deepEqual(await r.json(),{available:false,ratings:[]})}finally{if(saved!==undefined)process.env.OMDB_API_KEY=saved}
 const r=await recommendations.fetch(new Request('https://filmcompass.example/api/recommendations'));
 assert.equal(r.status,405);
});
