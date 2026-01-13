import { describe, it, expect } from 'vitest'
import { extractErrorMessage } from './stringUtils'

describe('stringUtils', () => {
  describe('extractErrorMessage', () => {
    it('extracts error message from AxiosError response data', () => {
      const error = {
        response: {
          data: 'Server error occurred'
        },
        message: 'Network error'
      }

      expect(extractErrorMessage(error)).toBe('Server error occurred')
    })

    it('falls back to error message when response data is not available', () => {
      const error = {
        message: 'Network error'
      }

      expect(extractErrorMessage(error)).toBe('Network error')
    })

    it('handles error with no response property', () => {
      const error = {
        message: 'Something went wrong'
      }

      expect(extractErrorMessage(error)).toBe('Something went wrong')
    })

    it('handles error with empty response', () => {
      const error = {
        response: {},
        message: 'Default message'
      }

      expect(extractErrorMessage(error)).toBe('Default message')
    })

    it('prefers response.data over message when both exist', () => {
      const error = {
        response: {
          data: 'API error'
        },
        message: 'Generic error'
      }

      expect(extractErrorMessage(error)).toBe('API error')
    })

    it('handles error with nested error details', () => {
      const error = {
        response: {
          data: {
            message: 'Validation failed',
            errors: ['Field is required']
          }
        },
        message: 'Request failed'
      }

      // Should return the entire data object
      expect(extractErrorMessage(error)).toEqual({
        message: 'Validation failed',
        errors: ['Field is required']
      })
    })

    it('handles empty object error', () => {
      const error = {}
      expect(extractErrorMessage(error)).toBeUndefined()
    })
  })
})
