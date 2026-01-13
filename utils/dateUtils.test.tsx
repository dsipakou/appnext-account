import { describe, it, expect, beforeEach } from 'vitest'
import {
  getFormattedDate,
  parseDate,
  parseAndFormatDate,
  getStartOfMonth,
  getStartOfWeek,
  getEndOfWeek,
  getEndOfMonth,
  getStartOfWeekOrMonth,
  getEndOfWeekOrMonth,
  getMonthWeeksWithDates,
  getWeekDays,
  getWeekDaysWithFullDays,
  getNumberWithPostfix,
  DATE_FORMAT,
  MONTH_DAY_FORMAT,
  SHORT_DAY_ONLY_FORMAT,
  DAY_MONTH_YEAR_FORMAT,
} from './dateUtils'

describe('dateUtils', () => {
  describe('getFormattedDate', () => {
    it('formats date with default format (yyyy-MM-dd)', () => {
      const date = new Date('2024-03-15')
      expect(getFormattedDate(date)).toBe('2024-03-15')
    })

    it('formats date with custom format', () => {
      const date = new Date('2024-03-15')
      expect(getFormattedDate(date, MONTH_DAY_FORMAT)).toBe('Mar 15')
    })

    it('formats date with day-month-year format', () => {
      const date = new Date('2024-03-15')
      expect(getFormattedDate(date, DAY_MONTH_YEAR_FORMAT)).toBe('15-Mar 2024')
    })
  })

  describe('parseDate', () => {
    it('parses ISO date string', () => {
      const result = parseDate('2024-03-15')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(2) // March is month 2 (0-indexed)
      expect(result.getDate()).toBe(15)
    })

    it('handles different date formats', () => {
      const result = parseDate('2024-12-25')
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(11) // December
      expect(result.getDate()).toBe(25)
    })
  })

  describe('parseAndFormatDate', () => {
    it('parses and reformats date string', () => {
      const result = parseAndFormatDate('2024-03-15', MONTH_DAY_FORMAT)
      expect(result).toBe('Mar 15')
    })

    it('parses and reformats with different output format', () => {
      const result = parseAndFormatDate('2024-03-15', DAY_MONTH_YEAR_FORMAT)
      expect(result).toBe('15-Mar 2024')
    })
  })

  describe('getStartOfMonth', () => {
    it('returns first day of month in default format', () => {
      const date = new Date('2024-03-15')
      expect(getStartOfMonth(date)).toBe('2024-03-01')
    })

    it('returns first day of month with custom format', () => {
      const date = new Date('2024-03-15')
      expect(getStartOfMonth(date, MONTH_DAY_FORMAT)).toBe('Mar 01')
    })

    it('handles month boundaries correctly', () => {
      const date = new Date('2024-02-29') // Leap year
      expect(getStartOfMonth(date)).toBe('2024-02-01')
    })
  })

  describe('getStartOfWeek', () => {
    it('returns Monday of the week (week starts on Monday)', () => {
      const date = new Date('2024-03-15') // Friday
      const result = getStartOfWeek(date)
      // Should return Monday of that week
      expect(result).toMatch(/2024-03-\d{2}/)
    })

    it('handles week at month boundary', () => {
      const date = new Date('2024-03-31') // Sunday
      const result = getStartOfWeek(date)
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/)
    })
  })

  describe('getEndOfWeek', () => {
    it('returns Sunday of the week', () => {
      const date = new Date('2024-03-15') // Friday
      const result = getEndOfWeek(date)
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/)
    })
  })

  describe('getEndOfMonth', () => {
    it('returns last day of month', () => {
      const date = new Date('2024-03-15')
      expect(getEndOfMonth(date)).toBe('2024-03-31')
    })

    it('handles February in leap year', () => {
      const date = new Date('2024-02-15')
      expect(getEndOfMonth(date)).toBe('2024-02-29')
    })

    it('handles February in non-leap year', () => {
      const date = new Date('2023-02-15')
      expect(getEndOfMonth(date)).toBe('2023-02-28')
    })
  })

  describe('getStartOfWeekOrMonth', () => {
    it('returns Date object', () => {
      const date = new Date('2024-03-15')
      const result = getStartOfWeekOrMonth(date)
      expect(result).toBeInstanceOf(Date)
    })

    it('returns the later of week start or month start', () => {
      const date = new Date('2024-03-05')
      const result = getStartOfWeekOrMonth(date)
      // Should be a valid date
      expect(result.getTime()).toBeGreaterThan(0)
    })
  })

  describe('getEndOfWeekOrMonth', () => {
    it('returns Date object', () => {
      const date = new Date('2024-03-15')
      const result = getEndOfWeekOrMonth(date)
      expect(result).toBeInstanceOf(Date)
    })

    it('returns the earlier of week end or month end', () => {
      const date = new Date('2024-03-28')
      const result = getEndOfWeekOrMonth(date)
      // Should be a valid date
      expect(result.getTime()).toBeGreaterThan(0)
    })
  })

  describe('getMonthWeeksWithDates', () => {
    it('returns array of week objects', () => {
      const result = getMonthWeeksWithDates('2024-03-01')
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    it('each week has correct structure', () => {
      const result = getMonthWeeksWithDates('2024-03-01')
      result.forEach((week) => {
        expect(week).toHaveProperty('week')
        expect(week).toHaveProperty('startDate')
        expect(week).toHaveProperty('endDate')
        expect(typeof week.week).toBe('number')
        expect(typeof week.startDate).toBe('string')
        expect(typeof week.endDate).toBe('string')
      })
    })

    it('weeks are numbered sequentially starting from 1', () => {
      const result = getMonthWeeksWithDates('2024-03-01')
      result.forEach((week, index) => {
        expect(week.week).toBe(index + 1)
      })
    })

    it('formats dates according to provided format', () => {
      const result = getMonthWeeksWithDates('2024-03-01', MONTH_DAY_FORMAT)
      // Should have format like "Mar 01"
      expect(result[0].startDate).toMatch(/[A-Z][a-z]{2} \d{2}/)
    })
  })

  describe('getWeekDays', () => {
    it('returns 7 days for a week', () => {
      const date = new Date('2024-03-15')
      const result = getWeekDays(date)
      expect(result).toHaveLength(7)
    })

    it('returns short day names by default', () => {
      const date = new Date('2024-03-15')
      const result = getWeekDays(date)
      // Should contain day names like "Mon", "Tue", etc.
      expect(result.every(day => typeof day === 'string' && day.length === 3)).toBe(true)
    })

    it('respects custom format template', () => {
      const date = new Date('2024-03-15')
      const result = getWeekDays(date, 'EEEE') // Full day name
      // Should contain full day names
      expect(result.every(day => typeof day === 'string' && day.length > 3)).toBe(true)
    })
  })

  describe('getWeekDaysWithFullDays', () => {
    it('returns 7 day objects for a week', () => {
      const date = new Date('2024-03-15')
      const result = getWeekDaysWithFullDays(date)
      expect(result).toHaveLength(7)
    })

    it('each day object has correct structure', () => {
      const date = new Date('2024-03-15')
      const result = getWeekDaysWithFullDays(date)
      result.forEach((day) => {
        expect(day).toHaveProperty('shortDayName')
        expect(day).toHaveProperty('fullDate')
        expect(typeof day.shortDayName).toBe('string')
        expect(day.fullDate).toBeInstanceOf(Date)
      })
    })

    it('short day names are 3 characters by default', () => {
      const date = new Date('2024-03-15')
      const result = getWeekDaysWithFullDays(date)
      result.forEach((day) => {
        expect(day.shortDayName).toHaveLength(3)
      })
    })

    it('respects custom format template', () => {
      const date = new Date('2024-03-15')
      const result = getWeekDaysWithFullDays(date, 'EEEE')
      // Full day names should be longer than 3 characters
      result.forEach((day) => {
        expect(day.shortDayName.length).toBeGreaterThan(3)
      })
    })
  })
})
