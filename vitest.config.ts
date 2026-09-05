/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config'

// Astro's own Vite config, so the tests can import `astro:content` and read the
// real collection instead of a hand-built fixture of it.
export default getViteConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
  },
})
