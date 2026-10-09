import {test} from 'node:test';
import assert from 'node:assert/strict';
import {allowedRequest} from '../request-origin.mjs';
test('local and hosted requests use only their configured origins',()=>{
 assert.equal(allowedRequest('127.0.0.1:4174','http://127.0.0.1:4174',4174),true);
 assert.equal(allowedRequest('filmcompass.example','https://filmcompass.example',4174,'filmcompass.example'),true);
 assert.equal(allowedRequest('filmcompass.example','http://filmcompass.example',4174,'filmcompass.example'),false);
 assert.equal(allowedRequest('evil.example','https://evil.example',4174,'filmcompass.example'),false);
 assert.equal(allowedRequest('filmcompass.example','https://evil.example',4174,'filmcompass.example'),false);
});
