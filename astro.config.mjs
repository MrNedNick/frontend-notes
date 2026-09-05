// @ts-check
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://frontend-notes.pages.dev',
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    // One stylesheet instead of a <style> block per page: these pages ship no
    // JavaScript, so the CSS file is the only thing worth caching across them.
    inlineStylesheets: 'never',
  },
})
