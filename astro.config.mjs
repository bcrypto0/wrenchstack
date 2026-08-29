// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { shouldKeepInSitemap } from './src/lib/compare-index.mjs';
import { lastmodFor } from './src/lib/lastmod.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://wrenchstack.com',
  vite: {
    plugins: [tailwindcss()],
  },
  // Drop noindexed long-tail /compare/ pairs from the sitemap so it only
  // advertises pages we actually want crawled and indexed (see SEO audit).
  // lastmod comes from each vendor's real verification date (see lastmod.mjs),
  // never from build time: a sitemap that claims everything changed today is
  // noise, and this site's whole position is that its dates mean something.
  integrations: [
    sitemap({
      filter: shouldKeepInSitemap,
      serialize(item) {
        const d = lastmodFor(item.url);
        if (d) item.lastmod = d.toISOString();
        return item;
      },
    }),
  ],
});