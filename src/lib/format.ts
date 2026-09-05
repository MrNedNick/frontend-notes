const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export function formatDate(date: Date): string {
  return DATE.format(date)
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 kB'
  const kb = bytes / 1024
  return kb >= 1000 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} kB`
}

/** Turns a tag into the slug used by its page, and back again for display. */
export const tagSlug = (tag: string): string => tag.toLowerCase().replace(/\s+/g, '-')
