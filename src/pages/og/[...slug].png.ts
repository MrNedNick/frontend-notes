import type { APIContext, GetStaticPaths } from 'astro'
import { ogImage } from '../../lib/og'
import { publishedNotes } from '../../lib/notes'

/**
 * One image per note plus one for the site, generated at build time. Nothing is
 * rendered at request time, because there is no server to render it on.
 */
export const getStaticPaths = (async () => {
  const notes = await publishedNotes()
  return [
    {
      params: { slug: 'site' },
      props: {
        title: 'Five stacks, one afternoon of measuring',
        tags: ['astro', 'svelte', 'angular', 'react'],
        footer: 'frontend-notes',
      },
    },
    ...notes.map((note) => ({
      params: { slug: note.id },
      props: {
        title: note.data.title,
        tags: note.data.tags,
        footer: note.data.project ?? 'frontend-notes',
      },
    })),
  ]
}) satisfies GetStaticPaths

export async function GET({ props }: APIContext) {
  const png = await ogImage(props as { title: string; tags: string[]; footer: string })
  return new Response(new Uint8Array(png), {
    headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=31536000, immutable' },
  })
}
