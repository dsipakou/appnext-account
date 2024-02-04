import {
  addWeeks,
  format,
  parseISO,
  formatRelative,
  eachDayOfInterval,
  max,
  min,
  getWeeksInMonth,
  startOfMonth,
  startOfWeek,
  endOfMonth,
  endOfWeek,
  setDefaultOptions,
} from 'date-fns'
import { enUS } from 'date-fns/locale'

export interface WeekOfMonth {
  week: number
  startDate: string
  endDate: string
}

export interface WeekDayWithFullDate {
  shortDayName: string
  fullDate: string
}

export const DATE_FORMAT = "yyyy-MM-dd"
export const MONTH_DAY_FORMAT = "MMM dd"
export const MONTH_ONLY_FORMAT = "MMM"
export const REPORT_FORMAT = "yyyy-MMMM"
export const SHORT_YEAR_MONTH_FORMAT = "MMM-yy"
export const LONG_YEAR_SHORT_MONTH_FORMAT = "MMM-yyyy"
export const SHORT_DAY_ONLY_FORMAT = "EEE"
export const FULL_DAY_ONLY_FORMAT = "EEEE"

const formatRelativeLocale = {
  lastWeek: "'Last' eeee",
  yesterday: "'Yesterday'",
  today: "'Today'",
  tomorrow: "'Tomorrow'",
  nextWeek: "eeee",
  other: 'P',
}

const locale = {
  ...enUS,
  formatRelative: token => formatRelativeLocale[token]
}


setDefaultOptions({ locale, weekStartsOn: 1 })

export const getFormattedDate = (date: Date, dateFormat: string = DATE_FORMAT): string => {
  return format(date, dateFormat);
}

export const parseDate = (date: string, dateFormat: string = DATE_FORMAT): Date => {
  return parseISO(date, dateFormat, new Date());
}

export const parseAndFormatDate = (
  date: string,
  outputFormat: string,
  inputFormat: string = DATE_FORMAT
): string => {
  const _date = parseDate(date, inputFormat)
  return getFormattedDate(_date, outputFormat)
}

export const getRelativeDate = (date: string): string => {
  return formatRelative(parseDate(date), new Date());
}

export const getStartOfMonth = (date: Date, dateFormat: string = DATE_FORMAT): string => {
  return getFormattedDate(startOfMonth(date), dateFormat)
}

export const getStartOfWeek = (date: Date): string => {
  return getFormattedDate(startOfWeek(date))
}

export const getStartOfWeekOrMonth = (date: Date): Date => {
  return max([startOfWeek(date), startOfMonth(date)])
}

export const getEndOfWeekOrMonth = (date: Date): Date => {
  return min([endOfWeek(date), endOfMonth(date)])
}

export const getEndOfWeek = (date: Date): string => {
  return getFormattedDate(endOfWeek(date))
}

export const getEndOfMonth = (date: Date): string => {
  return getFormattedDate(endOfMonth(date))
}

export const getMonthWeeksWithDates = (
  firstDayOfMonth: string,
  dateFormat: string = MONTH_DAY_FORMAT
): WeekOfMonth[] => {
  const start = parseDate(firstDayOfMonth)
  const weeksAmount = getWeeksInMonth(start)
  const weekOfMonth: WeekOfMonth[] = []
  for (let i: number = 0; i < weeksAmount; i += 1) {
    let currentDate = addWeeks(start, i)
    if (i > 0) currentDate = startOfWeek(currentDate)
    weekOfMonth.push({
      week: i + 1,
      startDate: getFormattedDate(getStartOfWeekOrMonth(currentDate), dateFormat),
      endDate: getFormattedDate(getEndOfWeekOrMonth(currentDate), dateFormat)
    } as WeekOfMonth)
  }
  return weekOfMonth
}

export const getWeekDays = (dateOfWeek: Date, formatTemplate: string = SHORT_DAY_ONLY_FORMAT): string[] => {
  const everyDayOfWeek = eachDayOfInterval({
    start: startOfWeek(dateOfWeek),
    end: endOfWeek(dateOfWeek)
  })

  return everyDayOfWeek.reduce((acc: string[], day: string) => {
    acc.push(format(day, formatTemplate))
    return acc
  }, [])
}

export const getWeekDaysWithFullDays =
  (dateOfWeek: Date, formatTemplate: string = SHORT_DAY_ONLY_FORMAT): WeekDayWithFullDate[] => {
    const everyDayOfWeek = eachDayOfInterval({
      start: startOfWeek(dateOfWeek),
      end: endOfWeek(dateOfWeek)
    })

    const daysArray = []

    everyDayOfWeek.forEach((item: string) => {
      daysArray.push({
        shortDayName: format(item, formatTemplate),
        fullDate: item
      })
    })

    return daysArray
  }
