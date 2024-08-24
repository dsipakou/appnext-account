import React from 'react'
import {
  WeekDayWithFullDate,
  parseDate,
  getWeekDaysWithFullDays,
  getFormattedDate,
  MONTH_DAY_FORMAT,
} from '@/utils/dateUtils'
import { isToday, isThisWeek } from 'date-fns'
import { cn } from '@/lib/utils'

interface HeaderTypes {
  date: string
}

interface HeaderItemTypes {
  date: WeekDayWithFullDate
  isWeekend: boolean
  isToday: boolean
}

const Header: React.FC<HeaderTypes> = ({ date }) => {
  const daysShortFormatArray: WeekDayWithFullDate[] = getWeekDaysWithFullDays(parseDate(date))

  return (
    <div className={cn(
      'grid gap-2 mb-3 grid-cols-7',
      isThisWeek(daysShortFormatArray[0].fullDate) && 'grid-cols-8'
    )}>
      {daysShortFormatArray.map((item: WeekDayWithFullDate, index: number) => (
        <div
          key={index}
          className={cn(isToday(item.fullDate) && 'col-span-2')}
        >
          <div key={index}>
            <HeaderItem
              date={item}
              isWeekend={index > 4}
              isToday={isToday(item.fullDate)}
            />
          </div>
        </div>
      ))
      }
    </div >
  )
}

const HeaderItem: React.FC<HeaderItemTypes> = ({ date, isWeekend, isToday }) => {
  return (
    <div className={cn(
      'flex flex-col items-center',
      isWeekend && 'text-red-500',
      isToday && 'bg-sky-500 text-white font-bold rounded-md',
    )}
    >
      <span className="flex align-middle justify-center text-2xl">
        {date.shortDayName}
      </span>
      <div className="flex justify-center h-full text-sm items-center gap-1">
        <span>{getFormattedDate(date.fullDate, MONTH_DAY_FORMAT)}</span>
        {isToday && (<span>(today)</span>)}
      </div>
    </div>
  )
}

export default Header
