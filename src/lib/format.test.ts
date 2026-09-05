import { describe, expect, it } from 'vitest'
import { formatBytes, formatDate, tagSlug } from './format'

describe('format helpers', () => {
  it('rounds bytes to something a person reads', () => {
    expect(formatBytes(0)).toBe('0 kB')
    expect(formatBytes(44985)).toBe('44 kB')
    expect(formatBytes(421831)).toBe('412 kB')
    expect(formatBytes(2_500_000)).toBe('2.4 MB')
  })

  it('slugs a tag the same way the tag pages do', () => {
    expect(tagSlug('service workers')).toBe('service-workers')
    expect(tagSlug('Core Web Vitals')).toBe('core-web-vitals')
    expect(tagSlug('css')).toBe('css')
  })

  it('formats a date without a timezone surprise', () => {
    expect(formatDate(new Date(2026, 8, 5))).toBe('5 Sept 2026')
  })
})
