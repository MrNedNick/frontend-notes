import { z } from 'astro/zod'

/**
 * The contract for every note, in a plain module so both the content config and
 * the tests validate against the same object rather than two copies of it.
 */
export const noteSchema = z.object({
  title: z.string().min(4).max(90),
  description: z.string().min(20).max(200),
  date: z.coerce.date(),
  tags: z.array(z.string().min(2)).min(1).max(5),
  /** Drafts are written in the open and never reach a production build. */
  draft: z.boolean().default(false),
  /** Where the note came from — a project in this portfolio, usually. */
  project: z.string().optional(),
})

export type NoteFrontmatter = z.infer<typeof noteSchema>
