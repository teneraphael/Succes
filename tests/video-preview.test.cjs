const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const childProcess = require('node:child_process');
const ts = require('typescript');
const sharp = require('sharp');
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

function load(file, mocks = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(source, { exports, require: (name) => name in mocks ? mocks[name] : require(name), Buffer, URL, Response, AbortSignal, fetch: (...args) => global.fetch(...args), console, process }, { filename: file });
  return exports;
}
let temp, fixture, helper, executions = 0;
before(() => {
  temp = fs.mkdtempSync(path.join(os.tmpdir(), 'dealcity-video-test-'));
  fixture = path.join(temp, 'fixture.mp4');
  childProcess.execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=blue:s=360x640:d=2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', fixture]);
  helper = load('src/lib/video-preview.ts', {
    'node:child_process': { execFile: (binary, args, options, callback) => {
      executions++;
      assert.equal(binary, ffmpeg);
      assert.match(args[args.indexOf('-i') + 1], /^https:\/\/.*\.ufs\.sh\//);
      const localArgs = [...args];
      localArgs[localArgs.indexOf('-i') + 1] = fixture;
      localArgs[localArgs.indexOf('-protocol_whitelist') + 1] = 'file,pipe';
      return childProcess.execFile(binary, localArgs, options, (error, stdout, stderr) => callback(error, { stdout, stderr }));
    } },
  });
});
after(() => fs.rmSync(temp, { recursive: true, force: true }));

test('rejects non-media hosts, local protocols and embedded credentials', () => {
  for (const url of ['http://un9zgttebh.ufs.sh/video', 'https://localhost/video', 'file:///etc/passwd', 'https://ufs.sh.evil.test/video', 'https://user:pass@un9zgttebh.ufs.sh/video', 'https://un9zgttebh.ufs.sh:8080/video']) assert.throws(() => helper.trustedMediaUrl(url));
  assert.equal(helper.trustedMediaUrl('https://un9zgttebh.ufs.sh/f/video'), 'https://un9zgttebh.ufs.sh/f/video');
});
test('extracts a real portrait frame into a JPEG share card and caches it', async () => {
  const image = await helper.videoPreview('https://un9zgttebh.ufs.sh/f/portrait');
  const dimensions = await sharp(image).metadata();
  assert.equal(dimensions.width, 1200); assert.equal(dimensions.height, 630); assert.equal(dimensions.format, 'jpeg');
  const before = executions;
  assert.deepEqual(await helper.videoPreview('https://un9zgttebh.ufs.sh/f/portrait'), image);
  assert.equal(executions, before);
});
test('poster preserves portrait proportions without the share overlay', async () => {
  const image = await helper.videoPreview('https://un9zgttebh.ufs.sh/f/portrait', null, true);
  const dimensions = await sharp(image).metadata();
  assert.equal(dimensions.width, 360); assert.equal(dimensions.height, 640);
});
test('public preview route returns a JPEG and cache headers without authentication', async () => {
  let called;
  const route = load('src/app/api/posts/[postId]/video-preview/route.ts', {
    '@/lib/prisma': { __esModule: true, default: { post: { findUnique: async () => ({ thumbnailUrl: null, attachments: [{ url: 'https://un9zgttebh.ufs.sh/f/video', settings: { thumbnailUrl: 'https://un9zgttebh.ufs.sh/f/thumbnail' } }] }) } } },
    '@/lib/video-preview': { videoPreview: async (...args) => { called = args; return Buffer.from('jpeg'); } },
  });
  const response = await route.GET({ nextUrl: new URL('https://dealcity.app/api/posts/id/video-preview') }, { params: { postId: 'id' } });
  assert.equal(response.status, 200); assert.equal(response.headers.get('content-type'), 'image/jpeg');
  assert.match(response.headers.get('cache-control'), /public/);
  assert.equal(called[1], 'https://un9zgttebh.ufs.sh/f/thumbnail');
});
test('unknown posts return 404 and extraction failures are never cached', async () => {
  let post = null;
  const route = load('src/app/api/posts/[postId]/video-preview/route.ts', {
    '@/lib/prisma': { __esModule: true, default: { post: { findUnique: async () => post } } },
    '@/lib/video-preview': { videoPreview: async () => { throw Error('unavailable'); } },
  });
  const request = { nextUrl: new URL('https://dealcity.app/api/posts/id/video-preview') };
  assert.equal((await route.GET(request, { params: { postId: 'id' } })).status, 404);
  post = { thumbnailUrl: null, attachments: [{ url: 'https://un9zgttebh.ufs.sh/f/video' }] };
  const response = await route.GET(request, { params: { postId: 'id' } });
  assert.equal(response.status, 503); assert.equal(response.headers.get('cache-control'), 'no-store');
});
test('video metadata uses the video preview and absolute canonical URL', async () => {
  let post = { content: 'PRODUIT: Polo\nPRIX: 6000 FCFA', user: { displayName: 'Seller', avatarUrl: '/avatar.png' }, attachments: [{ type: 'VIDEO', url: 'https://un9zgttebh.ufs.sh/f/video' }] };
  const mocks = { react: { cache: (fn) => fn }, '@/lib/types': { getPostDataInclude: () => ({}) }, '@/lib/prisma': { __esModule: true, default: { post: { findUnique: async () => post } } } };
  for (const name of ['@/auth','@/components/FollowButton','@/components/Linkify','@/components/posts/Post','@/components/UserAvatar','@/components/UserTooltip','next/link','next/navigation']) mocks[name] = {};
  const page = load('src/app/(main)/posts/[postId]/page.tsx', mocks);
  const metadata = await page.generateMetadata({ params: { postId: 'video-id' } });
  assert.equal(metadata.openGraph.type, 'video.other');
  assert.equal(metadata.openGraph.images[0].url, 'https://dealcity.app/api/posts/video-id/video-preview');
  assert.equal(metadata.openGraph.images[0].width, 1200);
  assert.equal(metadata.openGraph.videos[0].url, post.attachments[0].url);
  assert.equal(metadata.alternates.canonical, 'https://dealcity.app/posts/video-id');
  post = { ...post, attachments: [{ type: 'IMAGE', url: 'https://un9zgttebh.ufs.sh/f/photo' }] };
  const photoMetadata = await page.generateMetadata({ params: { postId: 'photo-id' } });
  assert.equal(photoMetadata.openGraph.type, 'article');
  assert.equal(photoMetadata.openGraph.images[0].url, post.attachments[0].url);
});
