import assert from 'node:assert/strict';
import { allowedIdentity } from '../lib/auth-policy.ts';
process.env.AUTH_ALLOWED_IDS='github:200939900';
process.env.AUTH_ALLOWED_GOOGLE_EMAILS='owner@example.test';
assert.equal(allowedIdentity('github:200939900'),true);
assert.equal(allowedIdentity('github:999'),false);
assert.equal(allowedIdentity('google:200939900'),false);
assert.equal(allowedIdentity('google:123','owner@example.test',true),true);
assert.equal(allowedIdentity('google:123','owner@example.test',false),false);
assert.equal(allowedIdentity('github:123','owner@example.test',true),false);
assert.equal(allowedIdentity(undefined,'owner@example.test',true),false);
process.env.AUTH_ALLOWED_IDS='';
process.env.AUTH_ALLOWED_GOOGLE_EMAILS='';
assert.equal(allowedIdentity('github:200939900'),false);
console.log('Authentication policy: account allowlist, provider isolation, verified email and fail-closed configuration passed.');

