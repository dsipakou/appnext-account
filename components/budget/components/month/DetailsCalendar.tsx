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
} from 'date-fns'
import { X } from 'lucide-react'
import { parseDate } from '@/utils/dateUtils'
import { getFormattedDate } from '@/utils/dateUtils'
import { MonthBudgetItem } from '@/components/budget/types'
import { useCurrencies } from '@/hooks/currencies'
import CalendarBudgetItem from './CalendarBudgetItem'


interface Types {
  title: string
  items: MonthBudgetItem[]
  date: string
  weekUrl: string
  monthUrl: string
  handleClose: () => void
  clickShowTransactions: (uuid: string) => void
}

const DetailsCalendar: React.FC<Types> = ({title, items, date, weekUrl, monthUrl, handleClose, clickShowTransactions}) => {
  const { data: { user }} = useSession()
  const { data: currencies } = useCurrencies()

  const generateWeeksForCurrentMonth = () => {
    const parsedDate = parseDate(date)
    const startOfTheSelectedMonth = startOfMonth(parsedDate);
    const endOfTheSelectedMonth = endOfMonth(parsedDate);
    const startDate = startOfWeek(startOfTheSelectedMonth);
    const endDate = endOfWeek(endOfTheSelectedMonth);

    let firstDayOfWeek = startDate;

    const allWeeks = [];

    while (firstDayOfWeek <= endDate) {
      allWeeks.push(
        generateDatesForCurrentWeek(firstDayOfWeek, parsedDate)
      );
      firstDayOfWeek = addDays(firstDayOfWeek, 7);
    }

    return allWeeks
  }

  const generateDatesForCurrentWeek = (startDate: Date, activeDate: Date) => {
    let currentDate = startDate;

    const getBudgetOnDate = (date: Date) => {
      return items.find((item: MonthBudgetItem) => item.budgetDate === getFormattedDate(date))
    }

    const week = []
    for (let day = 0; day < 7; day++) {
      const budgetOnDate = getBudgetOnDate(currentDate)

      week.push(
        <div
          className={`flex p-1 h-24 border 
            ${isSameMonth(currentDate, activeDate) ? "" : "bg-slate-100" } 
            ${isWeekend(currentDate) && !isSameWeek(currentDate, new Date()) && isSameMonth(currentDate, activeDate) && "bg-red-50"}
            ${isSameWeek(currentDate, new Date()) ? "bg-sky-100" : ""}
          `}
        >
          <CalendarBudgetItem
            item={budgetOnDate}
            date={currentDate}
            currency={user.currency}
            weekUrl={weekUrl}
            monthUrl={monthUrl}
            clickShowTransactions={clickShowTransactions}
          />
        </div>
      )
      currentDate = addDays(currentDate, 1)
    }
    return <>{week}</>
  }

  return (
    <div className="flex flex-col gap-2 border rounded-md">
      <div className="flex w-full py-2 justify-center items-center">
        <span className="m-auto text-xl font-bold">{title}</span>
        <X className="mr-2 cursor-pointer" onClick={handleClose} />
      </div>
      <div className="grid grid-cols-7">{generateWeeksForCurrentMonth()}</div>
    </div>
  )
}

export default DetailsCalendar
