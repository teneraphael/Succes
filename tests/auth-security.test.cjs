const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const argon = require('@node-rs/argon2');
function load(file, mocks = {}, stubImports = false) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  vm.runInNewContext(source, { exports, require: name => name in mocks ? mocks[name] : stubImports ? {} : require(name), URL, Response, Buffer, console: { warn() {} }, process, Date }, { filename: file });
  return exports;
}
const validation = load('src/lib/validation.ts');
function resetHarness({ user = { id: 'user', email: 'User@example.com' }, allowed = true } = {}) {
  let tokens = [], updated = 0, revoked = 0, mailed, transactionCount = 0;
  const tokenModel = {
    async deleteMany({ where }) {
      const selected = tokens.filter(t => (!where.email || t.email === where.email) && (!where.id || t.id === where.id) && (!where.token || t.token === where.token) && (!where.expires || t.expires > where.expires.gt));
      tokens = tokens.filter(t => !selected.includes(t)); return { count: selected.length };
    },
    async create({ data }) { const t = { id: 'token-' + Math.random(), ...data }; tokens.push(t); return t; },
    async findFirst({ where }) { return tokens.find(t => t.email === where.email && t.expires > where.expires.gt) || null; },
  };
  const tx = { $executeRaw: async () => {}, passwordResetToken: tokenModel, user: { findFirst: async () => user, update: async () => { updated++; return user; } }, session: { deleteMany: async () => { revoked++; } } };
  const prisma = { ...tx, $transaction: async fn => { transactionCount++; return fn(tx); } };
  const action = load('src/actions/password-reset.ts', {
    '@/lib/prisma': { __esModule: true, default: prisma }, '@/lib/validation': validation,
    '@/lib/auth-rate-limit': { consumeAuthAttempt: async () => allowed },
    '@/lib/mail': { sendPasswordResetEmail: async (...args) => { mailed = args; } },
  });
  return { action, tokens: () => tokens, state: () => ({ updated, revoked, mailed, transactionCount }), setTokens: v => { tokens = v; } };
}
test('reset codes are cryptographically generated, hashed and account responses are consistent', async () => {
  const known = resetHarness(), unknown = resetHarness({ user: null });
  const a = await known.action.generateResetCode(' USER@EXAMPLE.COM ');
  const b = await unknown.action.generateResetCode('user@example.com');
  assert.equal(a.success, b.success);
  assert.match(known.state().mailed[1], /^\d{6}$/);
  assert.equal(known.tokens()[0].email, 'user@example.com');
  assert.match(known.tokens()[0].token, /^\$argon2/);
  assert.notEqual(known.tokens()[0].token, known.state().mailed[1]);
  assert.equal(await argon.verify(known.tokens()[0].token, known.state().mailed[1]), true);
  assert.equal(unknown.tokens().length, 0);
});
test('invalid and overlong passwords are rejected on the server without changing the account', async () => {
  const h = resetHarness();
  for (const password of ['', 'short', 'x'.repeat(129)]) assert.ok((await h.action.verifyAndChangePassword('user@example.com', '123456', password)).error);
  assert.equal(h.state().updated, 0);
  assert.equal(validation.passwordSchema.parse(' pass word '), ' pass word ');
});
test('wrong, expired and legacy plaintext reset codes cannot change passwords', async () => {
  const h = resetHarness();
  await h.action.generateResetCode('user@example.com');
  const code = h.state().mailed[1];
  assert.ok((await h.action.verifyAndChangePassword('user@example.com', code === '111111' ? '222222' : '111111', 'Password123')).error);
  h.setTokens([{ id: 'old', email: 'user@example.com', token: code, expires: new Date(Date.now() + 10000) }]);
  assert.ok((await h.action.verifyAndChangePassword('user@example.com', code, 'Password123')).error);
  h.setTokens([{ id: 'expired', email: 'user@example.com', token: await argon.hash(code), expires: new Date(0) }]);
  assert.ok((await h.action.verifyAndChangePassword('user@example.com', code, 'Password123')).error);
  assert.equal(h.state().updated, 0);
});
test('attempt budget blocks even the correct code and resending is generic', async () => {
  const h = resetHarness({ allowed: false });
  assert.ok((await h.action.generateResetCode('user@example.com')).success);
  assert.equal(h.state().mailed, undefined);
  assert.ok((await h.action.verifyAndChangePassword('user@example.com', '123456', 'Password123')).error);
  assert.equal(h.state().updated, 0);
});
test('parallel replay changes the password only once and revokes sessions in the transaction', async () => {
  const h = resetHarness();
  await h.action.generateResetCode('user@example.com');
  const code = h.state().mailed[1];
  const results = await Promise.all(Array.from({ length: 3 }, () => h.action.verifyAndChangePassword('user@example.com', code, 'Password123')));
  assert.equal(results.filter(r => r.success).length, 1);
  assert.equal(h.state().updated, 1); assert.equal(h.state().revoked, 1); assert.equal(h.tokens().length, 0);
});
test('profile sharing uses the avatar, including absolute URLs and fallback for empty avatars', async () => {
  let user = { username: 'seller', displayName: 'Seller', avatarUrl: 'https://lh3.googleusercontent.com/avatar', coverUrl: 'https://example.com/cover', bio: 'Hello' };
  const page = load('src/app/(main)/users/[username]/page.tsx', { react: { cache: f => f }, '@/lib/prisma': { __esModule: true, default: { user: { findFirst: async () => user } } } }, true);
  const metadata = await page.generateMetadata({ params: Promise.resolve({ username: 'seller' }) });
  assert.equal(metadata.openGraph.images[0].url, user.avatarUrl);
  assert.equal(metadata.twitter.images[0], user.avatarUrl);
  assert.equal(metadata.openGraph.type, 'profile');
  user = { ...user, avatarUrl: null };
  assert.equal((await page.generateMetadata({ params: Promise.resolve({ username: 'seller' }) })).openGraph.images[0].url, 'https://dealcity.app/icons/icon-192.png');
});
test('Google failure response is generic and OAuth cookies are consumed with matching production scope', async () => {
  const writes = [];
  const route = load('src/app/api/auth/callback/google/route.ts', {
    '@/auth': { google: { validateAuthorizationCode: async () => { throw new Error('SECRET_INTERNAL_TOKEN'); } } },
    'next/headers': { cookies: async () => ({ get: name => ({ value: name === 'state' ? 'valid-state' : 'verifier' }), set: (...args) => writes.push(args) }) },
  }, true);
  const response = await route.GET({ url: 'https://dealcity.app/api/auth/callback/google?code=code&state=valid-state' });
  assert.equal(response.status, 500); assert.doesNotMatch(await response.text(), /SECRET_INTERNAL_TOKEN/);
  assert.equal(writes.length, 2); assert.equal(writes[0][2].maxAge, 0); assert.equal(writes[0][2].path, '/');
});

test('login accepts an email, preserves Next redirects and rejects external return targets', async () => {
  let queried, target;
  const action = load('src/app/(auth)/login/actions.ts', {
    '@/lib/validation': validation,
    '@/lib/prisma': { __esModule: true, default: { user: { findFirst: async query => { queried = query; return { id: 'user', passwordHash: 'hash', city: 'Douala' }; } } } },
    '@/lib/auth-rate-limit': { consumeAuthAttempt: async () => true },
    '@/lib/verify-password': { verifyPassword: async () => true },
    '@/auth': { lucia: { createSession: async () => ({ id: 'session' }), createSessionCookie: () => ({ name: 'session', value: 'value', attributes: {} }) } },
    'next/headers': { cookies: async () => ({ set() {} }) },
    'next/navigation': { redirect: url => { target = url; const error = new Error('redirect'); error.digest = `NEXT_REDIRECT;replace;${url};307;`; throw error; } },
  });
  for (const returnTo of ['https://evil.test', '//evil.test', '/\\evil.test', '/settings']) {
    await assert.rejects(action.login({ username: 'user@example.com', password: 'Password123' }, returnTo), /redirect/);
    assert.equal(target, returnTo === '/settings' ? '/settings' : '/');
  }
  assert.equal(queried.where.OR[1].email.equals, 'user@example.com');
});
