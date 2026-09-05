import { getCollection, type CollectionEntry } from 'astro:content'
import { tagSlug } from './format'

export type Note = CollectionEntry<'notes'>

/**
 * The one place that decides what "published" means. Drafts are visible while
 * the dev server is running and never leave a production build — so a note can
 * be written in the open without a branch.
 */
export async function publishedNotes(): Promise<Note[]> {
  const notes = await getCollection('notes', ({ data }) => import.meta.env.DEV || !data.draft)
  return notes.sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
}

export async function notesByTag(): Promise<Map<string, Note[]>> {
  const grouped = new Map<string, Note[]>()
  for (const note of await publishedNotes()) {
    for (const tag of note.data.tags) {
      const slug = tagSlug(tag)
      grouped.set(slug, [...(grouped.get(slug) ?? []), note])
    }
  }
  return grouped
}

/** The label to print for a tag slug, taken from the notes themselves. */
export async function tagLabel(slug: string): Promise<string> {
  for (const note of await publishedNotes()) {
    const match = note.data.tags.find((tag) => tagSlug(tag) === slug)
    if (match) return match
  }
  return slug
}
