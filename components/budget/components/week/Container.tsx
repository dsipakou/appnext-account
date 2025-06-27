import React from 'react'
import { useStore } from '@/app/store'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { DndContext } from '@dnd-kit/core'
import { getDay, isToday, isThisWeek } from 'date-fns'
import { useBudgetWeek, useEditBudget } from '@/hooks/budget'
import { useToast } from '@/components/ui/use-toast'
import { extractErrorMessage } from '@/utils/stringUtils'
import { CompactWeekItem, WeekBudgetItem, WeekBudgetResponse } from '@/components/budget/types'
import {
  getWeekDaysWithFullDays,
  parseDate,
  FULL_DAY_ONLY_FORMAT,
  WeekDayWithFullDate,
  getFormattedDate
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
  duplicateListUrl: string
  mutateBudget: (updatedBudget: unknown) => void
  clickShowTransactions: (uuid: string) => void
}

interface GroupedByWeek {
  [key: string]: CompactWeekItem[]
}

const Container: React.FC<Types> = ({
  startDate,
  endDate,
  user,
  weekUrl,
  monthUrl,
  duplicateListUrl,
  mutateBudget,
  clickShowTransactions
}) => {
  const [weekGroup, setWeekGroup] = React.useState<GroupedByWeek>({})
  const [budgetState, setBudgetState] = React.useState<WeekBudgetItem[]>([])
  const [isDragging, setIsDragging] = React.useState(false)
  const [draggingUuid, setDraggingUuid] = React.useState<string>('')
  const { data: budget }: WeekBudgetResponse = useBudgetWeek(
    startDate,
    endDate,
    user
  )
  const { trigger: dragBudget, isMutating } = useEditBudget(draggingUuid)
  const { data: { user: authUser } } = useSession()
  const weekDaysArray: number[] = [1, 2, 3, 4, 5, 6, 0]
  const daysFullFormatArray: WeekDayWithFullDate[] = getWeekDaysWithFullDays(parseDate(startDate), FULL_DAY_ONLY_FORMAT)
  const currencySign = useStore((state) => state.currencySign)
  const { toast } = useToast()

  React.useMemo(() => {
    setBudgetState(budget)
  }, [budget])

  React.useEffect(() => {
    if (!budgetState) return
    const groupedObj: GroupedByWeek = {}

    budgetState.forEach((item: WeekBudgetItem) => {
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
  }, [budgetState])

  const addBudgetButton = (
    <Button
      className="mt-2 shadow-sm bg-white hover:bg-white h-[60px] w-full text-3xl text-stone-400"
      variant="ghost"
    >
      +
    </Button>
  )

  const handleDragStart = (evt) => {
    setIsDragging(true)
    setDraggingUuid(evt.active.id)
  }

  const handleDragEnd = async (evt) => {
    setDraggingUuid('')
    if (!evt.over) return // dropped outside droppable zone
    
    // Get the original day of the dragged item
    const draggedItem = budget.find(item => item.uuid === evt.active.id)
    if (!draggedItem) return
    
    const oldDate = draggedItem.budgetDate
    const originalDay = getDay(parseDate(draggedItem.budgetDate))
    const targetDay = weekDaysArray[evt.over.id]
    
    // If dropped in the same column, just return without making the API call
    if (originalDay === targetDay) return

    const newDate = daysFullFormatArray[evt.over.id].fullDate

    // Optimistically update the UI
    setBudgetState((prev) => {
      const newState = [...prev]
      const oldIndex = newState.findIndex((item) => item.uuid === draggedItem.uuid)
      newState[oldIndex].budgetDate = getFormattedDate(newDate)
      return newState
    })

    try {
      const updatedBudget = await dragBudget({ budgetDate: getFormattedDate(newDate) })
      mutateBudget(updatedBudget)
      toast({ title: 'Saved!' })
    } catch (error) {
      // Revert optimistic update on error
      setBudgetState((prev) => {
        const newState = [...prev]
        const oldIndex = newState.findIndex((item) => item.uuid === draggedItem.uuid)
        newState[oldIndex].budgetDate = oldDate
        return newState
      })
      const message = extractErrorMessage(error)
      toast({ variant: 'destructive', title: 'Cannot update', description: message })
    } finally {
      setIsDragging(false)
    }
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} autoScroll={false}>
      <div className="flex flex-col flex-1">
        <Header date={startDate} />
        <div className={cn(
          'grid gap-2 flex-1 p-1 pb-3 max-w-full justify-between grid-cols-7 overflow-y-auto',
          isThisWeek(daysFullFormatArray[0].fullDate) && 'grid-cols-8',
        )}>
          {weekDaysArray.map((day: number, weekDayIndex: number) => (
            <Droppable
              id={weekDayIndex}
              key={weekDayIndex}
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
                <div className="flex flex-col justify-center items-center gap-1">
                  {weekGroup[day] &&
                    weekGroup[day].map((item: CompactWeekItem) => (
                      <BudgetItem
                        key={item.uuid}
                        day={day}
                        budget={item}
                        weekUrl={weekUrl}
                        monthUrl={monthUrl}
                        mutateBudget={mutateBudget}
                        duplicateListUrl={duplicateListUrl}
                        isDragging={isDragging}
                        isDragLoading={isMutating}
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
