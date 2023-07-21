import { FC } from 'react'
import {
  WeekDayWithFullDate,
  getFormattedDate,
  MONTH_DAY_FORMAT
} from '@/utils/dateUtils'

interface Types {
  date: WeekDayWithFullDate
  isWeekend: boolean
  isToday: boolean
}

const HeaderItem: FC<Types> = ({ date, isWeekend, isToday }) => {
  let containerClasses = isWeekend ? "border-y border-red-500 text-red-500 bg-white" : "border-y border-stone-500 bg-white"
  if (isToday) {
    containerClasses = `${containerClasses} bg-orange-200 font-bold`
  }
  containerClasses = `${containerClasses}`

  return (
    <div
      className={containerClasses}
    >
      <span className="flex align-middle justify-center text-xl">
        {date.shortDayName} {isToday && ' (today)'}
      </span>
      <div className="flex justify-center h-full text-sm items-center">
        {getFormattedDate(date.fullDate, MONTH_DAY_FORMAT)}
      </div>
    </div>
  )
}

export default HeaderItem
