import { sitePath } from '../lib/path'
import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { publishedNotes } from '../lib/notes'

export async function GET(context: APIContext) {
  const notes = await publishedNotes()

  return rss({
    title: 'Frontend Notes',
    description:
      'Short notes from building five small products on five stacks, with numbers from real builds.',
    site: context.site ?? 'https://mrnednick.github.io',
    items: notes.map((note) => ({
      title: note.data.title,
      description: note.data.description,
      pubDate: note.data.date,
      link: sitePath(`/notes/${note.id}/`),
      categories: note.data.tags,
    })),
    customData: '<language>en</language>',
  })
}
