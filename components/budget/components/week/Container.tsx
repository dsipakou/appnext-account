import { FC, useEffect, useState } from 'react'
import { useStore } from '@/app/store'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { DndContext, useSensor, useSensors } from '@dnd-kit/core'
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
import { Droppable } from '@/components/ui/dnd'
import { AddForm } from '@/components/budget/forms'
import BudgetItem from './BudgetItem'
import Header from './ContainerHeader'

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
  const [isDragging, setIsDragging] = useState(false)
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

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col flex-1">
        <Header date={startDate} />
        <div className={cn(
          'grid gap-2 flex-1 pb-3 justify-between grid-cols-7',
          isThisWeek(daysFullFormatArray[0].fullDate) && 'grid-cols-8',
        )}>
          {weekDaysArray.map((day: number, weekDayIndex: number) => (
            <Droppable
              id={day}
              onHover={cn(
                'ring-sky-200 ring rounded',
              )}
              className={cn(
                isToday(daysFullFormatArray[weekDayIndex].fullDate) && 'col-span-2 bg-sky-100 rounded p-1',
              )}
            >
              <div
                key={day}
                className={cn(
                  'flex flex-col group/col',
                  isToday(daysFullFormatArray[weekDayIndex].fullDate) && 'col-span-2 bg-sky-100 rounded p-1'
                )}
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
                        isDragging={isDragging}
                        clickShowTransactions={clickShowTransactions}
                      />
                    ))}
                </div>
                {weekGroup[day] && (
                  <div className="flex justify-center p-1 mt-2 gap-1 items-center">
                    <span className="font-semibold">{weekGroup[day].reduce((acc: number, item: CompactWeekItem) => acc + item.spent, 0).toFixed(2)}</span>
                    <span className="text-xs">({weekGroup[day].reduce((acc: number, item: CompactWeekItem) => acc + item.planned, 0).toFixed(2)}) {currencySign}</span>
                  </div>
                )}
                <div className={cn(
                  'flex invisible self-center w-4/5 h-15 text-2xl',
                  !isDragging && 'group-hover/col:visible'
                )}>
                  <AddForm date={daysFullFormatArray[weekDayIndex].fullDate} weekUrl={weekUrl} monthUrl={monthUrl} customTrigger={addBudgetButton} />
                </div>
              </div>
            </Droppable>
          ))}
        </div>
      </div>
    </DndContext >
  )
}

export default Container
