import { glob } from 'astro/loaders'
import { defineCollection } from 'astro:content'
import { noteSchema } from './content/schema'

/**
 * A missing title or a tag that is not a string stops the build with the file
 * name and the field — which is the whole reason the front matter is validated
 * here and not read defensively in half a dozen templates.
 */
const notes = defineCollection({
  loader: glob({ base: './src/content/notes', pattern: '**/*.{md,mdx}' }),
  schema: noteSchema,
})

export const collections = { notes }
