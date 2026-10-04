import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'
import { noteSchema, SYMPTOM_SECTIONS } from '../src/content/schema'
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

  const sample = {
    title: 'A sample bug',
    description: 'A description that is long enough to pass.',
    date: '2026-10-04',
    tags: ['css'],
    symptom: 'The header hangs 68 px into the grid',
    category: 'layout',
    cause: 'overflow-x makes the wrapper a scroll container',
    project: 'booking-desk',
    demo: 'https://mrnednick.github.io/booking-desk/',
    commit: 'https://github.com/MrNedNick/booking-desk/commit/f1fb952',
  }

  it('accepts a symptom note with every field, and defaults its kind', () => {
    const parsed = noteSchema.parse(sample)
    expect(parsed.kind).toBe('symptom')
  })

  it.each(['symptom', 'category', 'cause', 'project', 'demo', 'commit'])(
    'rejects a bug note without %s',
    (field) => {
      const broken: Record<string, unknown> = { ...sample }
      delete broken[field]
      expect(noteSchema.safeParse(broken).success).toBe(false)
    },
  )

  it('rejects an unknown category and a commit that is not a link', () => {
    expect(noteSchema.safeParse({ ...sample, category: 'misc' }).success).toBe(false)
    expect(noteSchema.safeParse({ ...sample, commit: 'f1fb952' }).success).toBe(false)
  })

  it('lets a note about method go without a symptom', () => {
    const { title, description, date, tags } = sample
    expect(noteSchema.safeParse({ title, description, date, tags, kind: 'method' }).success).toBe(true)
  })

  // Symptom first, then the cause and the fix: the order is the point of the format.
  it.each(files)('%s is written in the symptom → cause order, if it is a bug note', (file) => {
    const { data, body } = frontmatter(file)
    const parsed = noteSchema.parse(data)
    if (parsed.kind !== 'symptom') return
    const headings = [...body.matchAll(/^## (.+)$/gm)].map((match) => match[1]!.trim())
    expect(headings).toEqual([...SYMPTOM_SECTIONS])
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
