import { setDefaultOptions } from 'date-fns'
import { enUS } from 'date-fns/locale'

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
