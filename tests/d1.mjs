import assert from 'node:assert/strict';
import { productDb } from '../lib/d1.ts';
delete process.env.CLOUDFLARE_ACCOUNT_ID;
assert.throws(() => productDb(), /D1_NOT_CONFIGURED/);
Object.assign(process.env, {
  CLOUDFLARE_ACCOUNT_ID: 'test-account',
  CLOUDFLARE_D1_DATABASE_ID: 'test-database',
  CLOUDFLARE_API_TOKEN: 'test-token-not-real',
});
let called;
globalThis.fetch = async (url, init) => {
  called = { url, init };
  return Response.json({success:true,result:[{success:true,results:[{id:'one'}],meta:{changes:1}}]});
};
const stmt=productDb().prepare('SELECT * FROM products WHERE owner=? AND version=?').bind("a' OR 1=1 --",2);
assert.deepEqual(await stmt.first(),{id:'one'});
assert.deepEqual(JSON.parse(called.init.body),{sql:'SELECT * FROM products WHERE owner=? AND version=?',params:["a' OR 1=1 --",'2']});
assert.equal(called.init.cache,'no-store');
assert.equal((await stmt.run()).meta.changes,1);
globalThis.fetch=async()=>Response.json({success:true,result:[{success:true,results:[]}]});
assert.equal(await stmt.first(),null);
globalThis.fetch=async()=>Response.json({success:false,errors:[{message:'sensitive detail'}]});
await assert.rejects(stmt.all(),/D1_QUERY_FAILED/);
globalThis.fetch=async()=>new Response('sensitive detail',{status:403});
await assert.rejects(stmt.run(),/D1_HTTP_403/);
console.log('D1 adapter: parameter binding, success, empty result, configuration and error handling passed. No live database accessed.');

