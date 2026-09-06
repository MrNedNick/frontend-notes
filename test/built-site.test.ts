import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

/**
 * Guarantees that only exist once the site is built: no JavaScript request on a
 * page of prose, drafts gone, a preview image per note, a feed that matches the
 * notes. CI builds before it tests for exactly this reason.
 */
const BASE = process.env.GITHUB_PAGES === 'true' ? '/frontend-notes/' : '/'
const DIST = join(process.cwd(), 'dist')
const built = existsSync(join(DIST, 'index.html'))

const read = (path: string) => readFileSync(join(DIST, path), 'utf8')

describe.skipIf(!built)('the built site', () => {
  let notePages: string[] = []

  beforeAll(() => {
    notePages = readdirSync(join(DIST, 'notes'), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => `notes/${entry.name}/index.html`)
  })

  it('renders every published note and no draft', () => {
    expect(notePages.length).toBe(7)
    expect(existsSync(join(DIST, 'notes/draft-view-transitions'))).toBe(false)
    expect(read('notes/index.html')).not.toContain('View transitions between static pages')
  })

  it('asks for no JavaScript at all on a note page', () => {
    for (const page of notePages) {
      const html = read(page)
      const requested = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1])
      expect(requested, `${page} requested ${requested.join(', ')}`).toEqual([])
    }
  })

  it('gives every note a preview image and a canonical link', () => {
    for (const page of notePages) {
      const html = read(page)
      const image = /<meta property="og:image" content="([^"]+)"/.exec(html)?.[1]
      expect(image, `${page} has no og:image`).toBeTruthy()
      expect(new URL(image!).pathname).toMatch(new RegExp(`^${BASE}`))
      const file = new URL(image!).pathname.slice(BASE.length)
      expect(existsSync(join(DIST, file)), `${file} was never generated`).toBe(true)
      expect(html).toContain('<link rel="canonical"')
    }
  })

  it('publishes a feed that matches the notes', () => {
    const rss = read('rss.xml')
    expect(rss).toContain('<title>Frontend Notes</title>')
    expect((rss.match(/<item>/g) ?? []).length).toBe(notePages.length)
    expect(rss).not.toContain('View transitions between static pages')
  })

  it('ships a search index built from the rendered pages', () => {
    expect(existsSync(join(DIST, 'pagefind/pagefind.js'))).toBe(true)
    const entry = read('notes/index.html')
    expect(entry).toContain('data-search-input')
  })

  it('has a sitemap and a 404 page', () => {
    expect(existsSync(join(DIST, 'sitemap-index.xml'))).toBe(true)
    expect(read('404.html')).toContain('That page is not here')
  })
})
