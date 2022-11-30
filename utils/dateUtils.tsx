import {
  addWeeks,
  format,
  parse,
  formatRelative,
  max,
  min,
  getWeeksInMonth,
  startOfMonth,
  startOfWeek,
  endOfMonth,
  endOfWeek
} from 'date-fns'
import { enUS } from 'date-fns/esm/locale'

export interface WeekOfMonth {
  week: number
  startDate: string
  endDate: string
}

export const DATE_FORMAT = "yyyy-MM-dd"
export const MONTH_DAY_FORMAT = "MMM dd"

export const getFormattedDate = (date: Date, dateFormat: string = DATE_FORMAT): string => {
  return format(date, dateFormat);
}

export const parseDate = (date: string, dateFormat: string = DATE_FORMAT): Date => {
  return parse(date, dateFormat, new Date());
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

export const getStartOfWeekOrMonth = (date: Date): Date => {
  return max([startOfWeek(date, { weekStartsOn: 1 }), startOfMonth(date)])
}

export const getEndOfWeekOrMonth = (date: Date): Date => {
  return min([endOfWeek(date, { weekStartsOn: 1 }), endOfMonth(date)])
}

export const getEndOfMonth = (date: Date): string => {
  return getFormattedDate(endOfMonth(date))
}

export const getMonthWeeksWithDates = (
  firstDayOfMonth: string,
  dateFormat: string = MONTH_DAY_FORMAT
): WeekOfMonth[] => {
  const start = parseDate(firstDayOfMonth)
  const weeksAmount = getWeeksInMonth(start, { weekStartsOn: 1 })
  const weekOfMonth: WeekOfMonth[] = []
  for (let i: number = 0; i < weeksAmount; i += 1) {
    let currentDate = addWeeks(start, i)
    if (i > 0) currentDate = startOfWeek(currentDate, { weekStartsOn: 1 })
    weekOfMonth.push({
      week: i + 1,
      startDate: getFormattedDate(getStartOfWeekOrMonth(currentDate), dateFormat),
      endDate: getFormattedDate(getEndOfWeekOrMonth(currentDate), dateFormat)
    } as WeekOfMonth)
  }
  return weekOfMonth
}

export const formatRelativeLocale = {
  lastWeek: "'Last' dddd",
  yesterday: "'Yesterday'",
  today: "'Today'",
  tomorrow: "'Tomorrow'",
  nextWeek: "dddd",
  other: 'L', // Difference: Add time to the date
};

