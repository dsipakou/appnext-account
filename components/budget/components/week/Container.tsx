import { FC, useEffect, useState } from 'react'
import { useStore } from '@/app/store'
import { useSession } from 'next-auth/react'
import { getDay, isToday, isThisWeek } from 'date-fns'
import { useBudgetWeek } from '@/hooks/budget'
import { CompactWeekItem, WeekBudgetItem, WeekBudgetResponse } from '@/components/budget/types'
import {
  getWeekDaysWithFullDays,
  parseDate,
  FULL_DAY_ONLY_FORMAT,
  WeekDayWithFullDate
} from '@/utils/dateUtils'
import { Button } from '@/components/ui/button'
import { AddForm } from '@/components/budget/forms'
import BudgetItem from './BudgetItem'
import HeaderItem from './HeaderItem'

interface Types {
  startDate: string
  endDate: string
  user: string
  weekUrl: string
  monthUrl: string
  mutateBudget: () => void
  clickShowTransactions: (uuid: string) => void
}

interface GroupedByWeek {
  [key: string]: CompactWeekItem[]
}

const header = (date: string) => {
  const daysShortFormatArray: WeekDayWithFullDate[] = getWeekDaysWithFullDays(parseDate(date))

  return (
    <div className={`grid mb-3 border-x border-stone-200 ${isThisWeek(daysShortFormatArray[0].fullDate) ? 'grid-cols-8' : 'grid-cols-7'}`}>
      {daysShortFormatArray.map((item: WeekDayWithFullDate, index: number) => (
        <div
          key={index}
          className={`${isToday(item.fullDate) && 'col-span-2'}`}
        >
          <HeaderItem
            date={item}
            isWeekend={index > 4}
            isToday={isToday(item.fullDate)}
          />
        </div>
      ))}
    </div>
  )
}

const Container: FC<Types> = ({
  startDate,
  endDate,
  user,
  weekUrl,
  monthUrl,
  mutateBudget,
  clickShowTransactions
}) => {
  const [weekGroup, setWeekGroup] = useState<GroupedByWeek>({})
  const { data: budget }: WeekBudgetResponse = useBudgetWeek(
    startDate,
    endDate,
    user
  )
  const { data: { user: authUser } } = useSession()
  const weekDaysArray: number[] = [1, 2, 3, 4, 5, 6, 0]
  const daysFullFormatArray: WeekDayWithFullDate[] = getWeekDaysWithFullDays(parseDate(startDate), FULL_DAY_ONLY_FORMAT)
  const currencySign = useStore((state) => state.currencySign)

  useEffect(() => {
    if (!budget) return
    const groupedObj: GroupedByWeek = {}

    budget.forEach((item: WeekBudgetItem) => {
      const dayOfWeek: number = getDay(parseDate(item.budgetDate))
      const itemsOnDate: CompactWeekItem[] = groupedObj[dayOfWeek] || []
      const compactWeekItem: CompactWeekItem = {
        uuid: item.uuid,
        title: item.title,
        user: item.user,
        category: item.category,
        currency: item.currency,
        amount: item.planned,
        planned: item.plannedInCurrencies[authUser?.currency],
        spent: item.spentInCurrencies[authUser?.currency] || 0,
        recurrent: item.recurrent,
        isCompleted: item.isCompleted,
        budgetDate: item.budgetDate,
      }
      itemsOnDate.push(compactWeekItem)
      groupedObj[dayOfWeek] = itemsOnDate
    })
    setWeekGroup(groupedObj)
  }, [budget])

  const addBudgetButton = (
    <Button
      className="mt-2 shadow-sm bg-white hover:bg-white h-[60px] w-full text-3xl text-stone-400"
      variant="ghost"
    >
      +
    </Button>
  )

  return (
    <div className="flex flex-col flex-1">
      {header(startDate)}
      <div className={`grid gap-3 flex-1 pb-3 justify-center ${isThisWeek(daysFullFormatArray[0].fullDate) ? 'grid-cols-8' : 'grid-cols-7'}`}>
        {weekDaysArray.map((day: number, weekDayIndex: number) => (
          <div
            key={day}
            className={`flex flex-col group/col ${isToday(daysFullFormatArray[weekDayIndex].fullDate) && 'col-span-2 bg-sky-100 rounded p-1'}`}
          >
            <div className="flex flex-col justify-center items-center gap-1 relative">
              {weekGroup[day] &&
                weekGroup[day].map((item: CompactWeekItem) => (
                  <BudgetItem
                    key={item.uuid}
                    budget={item}
                    weekUrl={weekUrl}
                    monthUrl={monthUrl}
                    mutateBudget={mutateBudget}
                    clickShowTransactions={clickShowTransactions}
                  />
                ))}
            </div>
            {
              weekGroup[day] && (
                <>
                  <div className="flex justify-center p-1 mt-2 gap-1 items-center">
                    <span className="font-semibold">{weekGroup[day].reduce((acc: number, item: CompactWeekItem) => acc + item.spent, 0).toFixed(2)}</span>
                    <span className="text-xs">({weekGroup[day].reduce((acc: number, item: CompactWeekItem) => acc + item.planned, 0).toFixed(2)}) {currencySign}</span>
                  </div>
                </>
              )
            }
            <div className="group-hover/col:flex hidden self-center w-4/5 h-15 text-2xl">
              <AddForm date={daysFullFormatArray[weekDayIndex].fullDate} weekUrl={weekUrl} monthUrl={monthUrl} customTrigger={addBudgetButton} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Container
