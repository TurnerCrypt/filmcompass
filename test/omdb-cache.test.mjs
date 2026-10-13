import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createOmdbLookup} from '../omdb-cache.mjs';
const url=new URL('https://www.omdbapi.com/?apikey=fixture&t=Fixture&type=movie');
test('OMDb lookups deduplicate simultaneous requests and reuse cached responses',async()=>{let calls=0;const lookup=createOmdbLookup({shared:false,fetchImpl:async()=>{calls++;return Response.json({Response:'True',Title:'Fixture'})}});const replies=await Promise.all([lookup(url),lookup(url)]);assert.equal(calls,1);assert.equal((await replies[0].json()).Title,'Fixture');await lookup(url);assert.equal(calls,1)});
test('not-found responses are briefly cached and retry after expiry',async()=>{let clock=0,calls=0;const lookup=createOmdbLookup({shared:false,now:()=>clock,fetchImpl:async()=>{calls++;return Response.json({Response:'False',Error:'Movie not found!'})}});await lookup(url);await lookup(url);assert.equal(calls,1);clock=3600001;await lookup(url);assert.equal(calls,2)});
