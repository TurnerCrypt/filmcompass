import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../dist/library.js',import.meta.url),'utf8');
function session(store){const context=vm.createContext({localStorage:store});vm.runInContext(source,context);return expr=>vm.runInContext(expr,context)}
test('watchlist persists across reloads, watched removes saved, and undo restores eligibility',()=>{let stored=null;const store={getItem:()=>stored,setItem:(key,value)=>{stored=value}};let run=session(store);run("changeLibrary('saved',{title:'Example',year:2020})");run=session(store);assert.equal(run("libraryHas('saved',{title:'Example',year:2020})"),true);run("changeLibrary('watched',{title:'Example',year:2020})");assert.equal(run("filmLibrary.saved.length"),0);assert.equal(run("libraryHas('watched',{title:'Example',year:2020})"),true);run("changeLibrary('watched',{title:'Example',year:2020})");assert.equal(run('filmLibrary.watched.length'),0)});
test('remakes remain distinct and storage failure preserves session state',()=>{const run=session({getItem:()=>'{bad',setItem:()=>{throw new Error('disabled')}});assert.equal(run("changeLibrary('saved',{title:'The Gift',year:2000})"),false);run("changeLibrary('saved',{title:'The Gift',year:2015})");assert.equal(run('filmLibrary.saved.length'),2)});
