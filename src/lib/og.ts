import { Resvg } from '@resvg/resvg-js'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import satori from 'satori'

/**
 * Read from the project root, not from `import.meta.url`: this module is
 * bundled into a build chunk before it runs, so a URL relative to the source
 * file points at a directory that does not exist. The fonts stay in `src` on
 * purpose — a visitor never downloads them, only the build reads them.
 */
const FONT_DIR = join(process.cwd(), 'src/assets/fonts')

let fonts: Awaited<ReturnType<typeof loadFonts>> | null = null

async function loadFonts() {
  const [regular, semibold] = await Promise.all([
    readFile(join(FONT_DIR, 'Inter-Regular.ttf')),
    readFile(join(FONT_DIR, 'Inter-SemiBold.ttf')),
  ])
  return [
    { name: 'Inter', data: regular, weight: 400 as const, style: 'normal' as const },
    { name: 'Inter', data: semibold, weight: 600 as const, style: 'normal' as const },
  ]
}

export interface CardInput {
  title: string
  tags?: readonly string[]
  footer?: string
}

/**
 * Builds the preview image a chat app shows when someone pastes a link. Written
 * as a plain object tree rather than JSX so this file needs no renderer — the
 * site itself ships no framework, and its build should not either.
 */
export async function ogImage({ title, tags = [], footer = 'frontend-notes' }: CardInput) {
  fonts ??= await loadFonts()

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background: '#0f1115',
          color: '#e8eaef',
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', gap: '16px', fontSize: 26, color: '#7ea2ff' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      background: '#7ea2ff',
                      color: '#0d1220',
                      fontWeight: 600,
                    },
                    children: 'FN',
                  },
                },
                { type: 'div', props: { children: 'Frontend Notes' } },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', fontSize: 62, fontWeight: 600, lineHeight: 1.15, letterSpacing: '-0.02em' },
              children: title,
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', gap: '14px', fontSize: 24, color: '#9aa3b2' },
              children: [
                { type: 'div', props: { children: footer } },
                ...(tags.length
                  ? [{ type: 'div', props: { style: { color: '#565d6b' }, children: '·' } },
                     { type: 'div', props: { children: tags.slice(0, 3).join('  ·  ') } }]
                  : []),
              ],
            },
          },
        ],
      },
    },
    { width: 1200, height: 630, fonts },
  )

  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng()
}
