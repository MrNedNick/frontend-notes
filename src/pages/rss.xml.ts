import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { publishedNotes } from '../lib/notes'

export async function GET(context: APIContext) {
  const notes = await publishedNotes()

  return rss({
    title: 'Frontend Notes',
    description:
      'Short notes from building five small products on five stacks, with numbers from real builds.',
    site: context.site ?? 'https://frontend-notes.pages.dev',
    items: notes.map((note) => ({
      title: note.data.title,
      description: note.data.description,
      pubDate: note.data.date,
      link: `/notes/${note.id}/`,
      categories: note.data.tags,
    })),
    customData: '<language>en</language>',
  })
}
