// Submit every indexable URL to IndexNow (Bing, Yandex, Seznam, Naver…) so they
// crawl and index the site fast — a much quicker feedback loop than waiting on
// Google, and a real traffic channel (Bing → DuckDuckGo, Copilot, ChatGPT search).
//
// Google does NOT use IndexNow, so this does not replace Google Search Console
// work — it runs alongside it.
//
// Usage (after a deploy, so the live sitemap matches what you submit):
//   npm run build && npm run indexnow
//
// The key file lives at public/<KEY>.txt and deploys to https://<HOST>/<KEY>.txt,
// which is how IndexNow verifies we own the domain.

import { readFileSync, readdirSync } from 'node:fs';

const HOST = 'wrenchstack.com';
const KEY = '1cb92690d9b4178e0692c89d3c3e7397';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const distDir = new URL('../dist/', import.meta.url);

// Read every content sitemap (sitemap-0.xml, sitemap-1.xml, …) but skip the
// sitemap index, which only points at the others.
const sitemapFiles = readdirSync(distDir).filter((f) => /^sitemap-\d+\.xml$/.test(f));
if (sitemapFiles.length === 0) {
  console.error('No sitemap-N.xml found in dist/ — run `npm run build` first.');
  process.exit(1);
}

const urls = [];
for (const file of sitemapFiles) {
  const xml = readFileSync(new URL(file, distDir), 'utf8');
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.push(m[1]);
}

if (urls.length === 0) {
  console.error('No <loc> URLs found in the sitemaps.');
  process.exit(1);
}

// IndexNow accepts up to 10,000 URLs per request; we have ~2,100 indexable.
const body = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls };

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});

console.log(`Submitted ${urls.length} URLs to IndexNow → HTTP ${res.status} ${res.statusText}`);
if (res.status !== 200 && res.status !== 202) {
  console.log(await res.text());
  process.exit(1);
}
console.log('Accepted. Bing/Yandex will crawl these over the coming hours to days.');
