import { describe, it, expect as vitestExpect, vi, beforeEach } from 'vitest'
import { expect as storybookExpect, delay } from '@/utils/expect'

describe('storybookExpect', () => {
  let mockDispatchEvent: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Mock window.dispatchEvent
    mockDispatchEvent = vi.fn()
    Object.defineProperty(window, 'dispatchEvent', {
      value: mockDispatchEvent,
      writable: true
    })
  })

  describe('expect function', () => {
    it('should create expectation with value and message', () => {
      const result = storybookExpect('test value', 'test message')
      
      vitestExpect(result).toHaveProperty('toBe')
      vitestExpect(result).toHaveProperty('toBeTruthy')
      vitestExpect(result).toHaveProperty('toBeFalsy')
    })

    it('should handle toBe matcher when values match', () => {
      const result = storybookExpect('hello', 'should be hello')
      
      // Just test that toBe method exists and can be called
      vitestExpect(() => result.toBe('hello')).not.toThrow()
    })

    it('should handle toBeTruthy matcher', () => {
      const result = storybookExpect(true, 'should be truthy')
      
      // Just test that toBeTruthy method exists and can be called
      vitestExpect(() => result.toBeTruthy()).not.toThrow()
    })
  })

  describe('delay function', () => {
    it('should resolve after specified milliseconds', async () => {
      const start = Date.now()
      await delay(50)  // Use shorter delay for faster tests
      const end = Date.now()
      
      vitestExpect(end - start).toBeGreaterThanOrEqual(40) // Allow for timing variations
    })
  })
})