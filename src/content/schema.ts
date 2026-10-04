import { z } from 'astro/zod'

/**
 * The contract for every note, in a plain module so both the content config and
 * the tests validate against the same object rather than two copies of it.
 *
 * Most notes are bugs, written symptom first: the sentence someone would type
 * when they hit it, then the cause and the fix. A few are about method — how a
 * number was measured — and have no symptom to file them under.
 */
export const CATEGORIES = {
  layout: 'Layout',
  accessibility: 'Accessibility',
  performance: 'Performance',
  network: 'Network',
  state: 'State',
} as const

export type Category = keyof typeof CATEGORIES

const base = {
  title: z.string().min(4).max(90),
  description: z.string().min(20).max(200),
  date: z.coerce.date(),
  tags: z.array(z.string().min(2)).min(1).max(5),
  /** Drafts are written in the open and never reach a production build. */
  draft: z.boolean().default(false),
}

const symptomNote = z.object({
  ...base,
  kind: z.literal('symptom').default('symptom'),
  /** What it looked like, in the words of the person who hit it. */
  symptom: z.string().min(12).max(120),
  category: z.enum(Object.keys(CATEGORIES) as [Category, ...Category[]]),
  /** The cause in one line, for the index. */
  cause: z.string().min(12).max(160),
  /** The portfolio project the bug happened in. */
  project: z.string().min(2),
  /** A live page where the bug is gone. */
  demo: z.string().url(),
  /** The fix in the project's history. */
  commit: z.string().url(),
  /** Only when it was actually recorded — never a guess. */
  timeToFind: z.string().optional(),
})

const methodNote = z.object({
  ...base,
  kind: z.literal('method'),
  project: z.string().optional(),
})

export const noteSchema = z.union([methodNote, symptomNote])

export type NoteFrontmatter = z.infer<typeof noteSchema>

/** The sections every symptom note is written in, in this order. */
export const SYMPTOM_SECTIONS = [
  'Symptom',
  'How to reproduce',
  'What it was not',
  'Cause',
  'Fix',
  'How not to repeat it',
] as const
