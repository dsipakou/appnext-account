import {
  format,
  parse,
  formatRelative,
  startOfMonth,
  endOfMonth
} from 'date-fns';
import { enUS } from 'date-fns/esm/locale';

const DATE_FORMAT = "yyyy-MM-dd";

export const getFormattedDate = (date: Date): string => {
  return format(date, DATE_FORMAT);
}

export const parseDate = (date: string): Date => {
  return parse(date, DATE_FORMAT, new Date());
}

export const getRelativeDate = (date: string): string => {
  return formatRelative(parseDate(date), new Date());
}

export const getStartOfMonth = (date: Date): string => {
  return getFormattedDate(startOfMonth(date))
}

export const getEndOfMonth = (date: Date): string => {
  return getFormattedDate(endOfMonth(date))
}

export const formatRelativeLocale = {
  lastWeek: "'Last' dddd",
  yesterday: "'Yesterday'",
  today: "'Today'",
  tomorrow: "'Tomorrow'",
  nextWeek: "dddd",
  other: 'L', // Difference: Add time to the date
};

