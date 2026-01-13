import { describe, it, expect } from 'vitest'
import { formatMoney, calculatePercentage, getNumberWithPostfix } from './numberUtils'

describe('numberUtils', () => {
  describe('formatMoney', () => {
    it('formats positive numbers with two decimal places', () => {
      expect(formatMoney(1234.56)).toBe('1,234.56')
    })

    it('formats integers with .00', () => {
      expect(formatMoney(1000)).toBe('1,000.00')
    })

    it('formats numbers with one decimal place', () => {
      expect(formatMoney(123.5)).toBe('123.50')
    })

    it('returns 0 for zero value', () => {
      expect(formatMoney(0)).toBe(0)
    })

    it('returns 0 for null/undefined values', () => {
      expect(formatMoney(null as any)).toBe(0)
      expect(formatMoney(undefined as any)).toBe(0)
    })

    it('formats large numbers correctly', () => {
      expect(formatMoney(1234567.89)).toBe('12,34,567.89')
    })

    it('formats small decimal numbers', () => {
      expect(formatMoney(0.99)).toBe('0.99')
    })
  })

  describe('calculatePercentage', () => {
    it('returns minimum percentage (20) when value equals low', () => {
      expect(calculatePercentage(0, 0, 100)).toBe(20)
    })

    it('returns maximum percentage (100) when value equals high', () => {
      expect(calculatePercentage(100, 0, 100)).toBe(100)
    })

    it('calculates mid-range percentage correctly', () => {
      expect(calculatePercentage(50, 0, 100)).toBe(60)
    })

    it('returns 20 when value is below low', () => {
      expect(calculatePercentage(-10, 0, 100)).toBe(20)
    })

    it('caps percentage at 100 when value exceeds high', () => {
      expect(calculatePercentage(150, 0, 100)).toBe(100)
    })

    it('handles different ranges correctly', () => {
      expect(calculatePercentage(75, 50, 100)).toBe(60)
    })

    it('handles negative ranges', () => {
      expect(calculatePercentage(0, -100, 100)).toBe(60)
    })
  })

  describe('getNumberWithPostfix', () => {
    it('adds "st" for numbers ending in 1 (except 11)', () => {
      expect(getNumberWithPostfix(1)).toBe('1st')
      expect(getNumberWithPostfix(21)).toBe('21st')
      expect(getNumberWithPostfix(31)).toBe('31st')
      expect(getNumberWithPostfix(101)).toBe('101st')
    })

    it('adds "nd" for numbers ending in 2 (except 12)', () => {
      expect(getNumberWithPostfix(2)).toBe('2nd')
      expect(getNumberWithPostfix(22)).toBe('22nd')
      expect(getNumberWithPostfix(32)).toBe('32nd')
      expect(getNumberWithPostfix(102)).toBe('102nd')
    })

    it('adds "rd" for numbers ending in 3 (except 13)', () => {
      expect(getNumberWithPostfix(3)).toBe('3rd')
      expect(getNumberWithPostfix(23)).toBe('23rd')
      expect(getNumberWithPostfix(33)).toBe('33rd')
      expect(getNumberWithPostfix(103)).toBe('103rd')
    })

    it('adds "th" for numbers ending in 11, 12, 13', () => {
      expect(getNumberWithPostfix(11)).toBe('11th')
      expect(getNumberWithPostfix(12)).toBe('12th')
      expect(getNumberWithPostfix(13)).toBe('13th')
      expect(getNumberWithPostfix(111)).toBe('111th')
      expect(getNumberWithPostfix(112)).toBe('112th')
      expect(getNumberWithPostfix(113)).toBe('113th')
    })

    it('adds "th" for numbers ending in 0, 4-9', () => {
      expect(getNumberWithPostfix(0)).toBe('0th')
      expect(getNumberWithPostfix(4)).toBe('4th')
      expect(getNumberWithPostfix(5)).toBe('5th')
      expect(getNumberWithPostfix(6)).toBe('6th')
      expect(getNumberWithPostfix(7)).toBe('7th')
      expect(getNumberWithPostfix(8)).toBe('8th')
      expect(getNumberWithPostfix(9)).toBe('9th')
      expect(getNumberWithPostfix(10)).toBe('10th')
      expect(getNumberWithPostfix(20)).toBe('20th')
    })
  })
})
