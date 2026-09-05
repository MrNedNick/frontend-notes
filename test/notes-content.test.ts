import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'
import { noteSchema } from '../src/content/schema'
import { tagSlug } from '../src/lib/format'

const DIR = join(process.cwd(), 'src/content/notes')

const files = readdirSync(DIR).filter((file) => /\.mdx?$/.test(file))

function frontmatter(file: string) {
  const source = readFileSync(join(DIR, file), 'utf8')
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)
  if (!match) throw new Error(`${file} has no front matter`)
  return { data: parse(match[1]) as unknown, body: source.slice(match[0].length) }
}

describe('every note in the repository', () => {
  it('is actually there', () => {
    expect(files.length).toBeGreaterThan(5)
  })

  it.each(files)('%s satisfies the schema the pages rely on', (file) => {
    const result = noteSchema.safeParse(frontmatter(file).data)
    if (!result.success) {
      throw new Error(`${file}: ${result.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`)
    }
    expect(result.success).toBe(true)
  })

  // A draft is allowed to be three lines; anything that ships is not.
  it.each(files)('%s has a body worth opening, unless it is a draft', (file) => {
    const { data, body } = frontmatter(file)
    const parsed = noteSchema.parse(data)
    expect(body.trim().length).toBeGreaterThan(parsed.draft ? 80 : 400)
  })

  it('rejects a note that is missing a required field', () => {
    const broken = noteSchema.safeParse({ title: 'Too short', tags: [] })
    expect(broken.success).toBe(false)
    const fields = broken.success ? [] : broken.error.issues.map((issue) => issue.path[0])
    expect(fields).toContain('description')
    expect(fields).toContain('date')
  })

  it('keeps tag slugs unambiguous', () => {
    const seen = new Map<string, string>()
    for (const file of files) {
      const data = noteSchema.parse(frontmatter(file).data)
      for (const tag of data.tags) {
        const slug = tagSlug(tag)
        const previous = seen.get(slug)
        // Two different spellings collapsing into one tag page would silently
        // merge unrelated notes.
        if (previous) expect(previous).toBe(tag)
        seen.set(slug, tag)
      }
    }
  })
})
