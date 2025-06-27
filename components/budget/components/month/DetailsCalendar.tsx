import React from 'react'
import { useSession } from 'next-auth/react'
import {
  addDays,
  isSameWeek,
  isSameMonth,
  isWeekend,
  startOfMonth,
  startOfWeek,
  endOfMonth,
  endOfWeek,
  isSameDay
} from 'date-fns'
import { X, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { parseDate, getFormattedDate } from '@/utils/dateUtils'
import { MonthBudgetItem } from '@/components/budget/types'
import { useCurrencies } from '@/hooks/currencies'
import CalendarBudgetItem from './CalendarBudgetItem'

interface Types {
  title: string
  items: MonthBudgetItem[]
  date: string
  weekUrl: string
  monthUrl: string
  duplicateListUrl: string
  handleClose: () => void
  clickShowTransactions: (uuid: string) => void
}

const DetailsCalendar: React.FC<Types> = ({
  title,
  items,
  date,
  weekUrl,
  monthUrl,
  duplicateListUrl,
  handleClose,
  clickShowTransactions,
}) => {
  const { data: { user } } = useSession()
  const { data: currencies } = useCurrencies()

  const generateWeeksForCurrentMonth = () => {
    const parsedDate = parseDate(date)
    const startOfTheSelectedMonth = startOfMonth(parsedDate)
    const endOfTheSelectedMonth = endOfMonth(parsedDate)
    const startDate = startOfWeek(startOfTheSelectedMonth)
    const endDate = endOfWeek(endOfTheSelectedMonth)

    let firstDayOfWeek = startDate

    const allWeeks = []

    while (firstDayOfWeek <= endDate) {
      allWeeks.push(
        generateDatesForCurrentWeek(firstDayOfWeek, parsedDate)
      )
      firstDayOfWeek = addDays(firstDayOfWeek, 7)
    }

    return allWeeks
  }

  const generateDatesForCurrentWeek = (startDate: Date, activeDate: Date) => {
    let currentDate = startDate

    const getBudgetOnDate = (date: Date) => {
      return items.find((item: MonthBudgetItem) => item.budgetDate === getFormattedDate(date))
    }

    const week = []
    for (let day = 0; day < 7; day++) {
      const budgetOnDate = getBudgetOnDate(currentDate)

      week.push(
        <div
          key={day}
          className={cn(
            'flex p-1 h-24 border rounded-md',
            isSameMonth(currentDate, activeDate) && 'bg-gray-100',
            isWeekend(currentDate) && !isSameWeek(currentDate, new Date()) && isSameMonth(currentDate, activeDate) && 'bg-red-50',
            isSameWeek(currentDate, new Date()) && 'bg-blue-50',
            isSameDay(currentDate, new Date()) && 'border-2 border-blue-500',
          )}
        >
          <CalendarBudgetItem
            key={day}
            item={budgetOnDate}
            date={currentDate}
            currency={user.currency}
            weekUrl={weekUrl}
            monthUrl={monthUrl}
            duplicateListUrl={duplicateListUrl}
            clickShowTransactions={clickShowTransactions}
          />
        </div>
      )
      currentDate = addDays(currentDate, 1)
    }
    return <>{week}</>
  }

  return (
    <div className="flex flex-col gap-2 rounded-md">
      <div className="flex flex-col w-full py-2 relative">
        <div className="flex w-full py-2 items-center relative justify-center">
          <ArrowLeft className="absolute left-2 cursor-pointer" onClick={handleClose} />
          <span className="text-sm text-gray-500 font-medium mr-2">{title.split(' > ')[0]}</span>
          <span className="text-gray-400 mx-1">›</span>
          <span className="text-xl font-bold text-gray-800 ml-2">{title.split(' > ')[1]}</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">{generateWeeksForCurrentMonth()}</div>
    </div>
  )
}

export default DetailsCalendar
