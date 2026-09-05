import { describe, expect, it } from 'vitest'
import { STACKS } from './stacks'

/**
 * The comparison page is only worth anything if every claim on it is either a
 * measured number or an explicit gap. These tests are what stops it from
 * drifting back into opinions.
 */
describe('the stack comparison', () => {
  it('lists the five stacks it promises, plus this site', () => {
    expect(STACKS).toHaveLength(6)
    expect(STACKS.map((stack) => stack.name)).toContain('split-bill')
  })

  it('gives every entry a repository and a description', () => {
    for (const stack of STACKS) {
      expect(stack.repo).toMatch(/^https:\/\/github\.com\/MrNedNick\//)
      expect(stack.what.length).toBeGreaterThan(20)
      expect(stack.worked.length).toBeGreaterThan(20)
      expect(stack.friction.length).toBeGreaterThan(20)
    }
  })

  it('either has both numbers or neither — no half-measured row', () => {
    for (const stack of STACKS) {
      const measured = stack.jsBytes !== null
      expect(stack.buildSeconds !== null).toBe(measured)
    }
  })

  it('never claims a mock API bigger than the bundle that contains it', () => {
    for (const stack of STACKS) {
      if (stack.mockApiBytes === undefined) continue
      expect(stack.jsBytes).not.toBeNull()
      expect(stack.mockApiBytes).toBeLessThan(stack.jsBytes!)
    }
  })

  it('marks an unmeasured project as a gap instead of quietly dropping it', () => {
    const pending = STACKS.filter((stack) => stack.jsBytes === null)
    for (const stack of pending) {
      expect(stack.friction.length).toBeGreaterThan(20)
    }
  })
})
