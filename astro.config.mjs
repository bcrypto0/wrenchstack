// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { shouldKeepInSitemap } from './src/lib/compare-index.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://wrenchstack.com',
  vite: {
    plugins: [tailwindcss()],
  },
  // Drop noindexed long-tail /compare/ pairs from the sitemap so it only
  // advertises pages we actually want crawled and indexed (see SEO audit).
  integrations: [sitemap({ filter: shouldKeepInSitemap })],
});