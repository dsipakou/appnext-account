import { FC, useEffect, useState } from 'react'
import { getDay, isToday, isThisWeek } from 'date-fns'
import { Grid, Stack, Typography } from '@mui/material'
import { useBudgetWeek } from '@/hooks/budget'
import { RecurrentTypes, WeekBudgetItem } from '@/components/budget/types'
import {
  getWeekDaysWithFullDays,
  parseDate,
  parseAndFormatDate,
  FULL_DAY_ONLY_FORMAT,
  MONTH_DAY_FORMAT,
  WeekDayWithFullDate,
} from '@/utils/dateUtils'
import { useAuth } from '@/context/auth'
import AddForm from '@/components/budget/forms/AddForm'
import { Button } from '@/components/ui/button'
import BudgetItem from './BudgetItem'
import HeaderItem from './HeaderItem'

interface Types {
  startDate: string
  endDate: string
  user: string
  weekUrl: string
  monthUrl: string
  clickEdit: (uuid: string) => void
  clickDelete: (uuid: string) => void
  mutateBudget: () => void
}

interface WeekBudgetResponse {
  data: WeekBudgetItem[]
  isLoading: boolean
}

interface CompactWeekItem {
  uuid: string
  title: string
  user: string
  planned: number
  spent: number
  recurrent: RecurrentTypes
  isCompleted: boolean
}

interface GroupedByWeek {
  [key: string]: CompactWeekItem[]
}

const header = (date: string) => {
  const currentDay: number = (getDay(new Date()) + 6) % 7
  const daysShortFormatArray: WeekDayWithFullDate[] = getWeekDaysWithFullDays(parseDate(date))

  return (
    <div className="grid grid-cols-8 gap-1 mb-3">
      {daysShortFormatArray.map((item: WeekDayWithFullDate, index: number) => (
        <div
          key={index}
          className={isToday(item.fullDate) ? 'col-span-2' : ''}
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
  clickEdit,
  clickDelete,
  mutateBudget
}) => {
  const [weekGroup, setWeekGroup] = useState<GroupedByWeek>({});
  const { data: budget }: WeekBudgetResponse = useBudgetWeek(
    startDate,
    endDate,
    user
  )
  const currentDay: number = getDay(new Date())
  const { user: authUser } = useAuth();
  const weekDaysArray: number[] = [1, 2, 3, 4, 5, 6, 0];
  const daysFullFormatArray: WeekDayWithFullDate[] = getWeekDaysWithFullDays(parseDate(startDate), FULL_DAY_ONLY_FORMAT)

  useEffect(() => {
    if (!budget) return;
    const groupedObj: GroupedByWeek = {};

    budget.forEach((item: WeekBudgetItem) => {
      const dayOfWeek: number = getDay(parseDate(item.budgetDate));
      const itemsOnDate: CompactWeekItem[] = groupedObj[dayOfWeek] || [];
      const compactWeekItem: CompactWeekItem = {
        uuid: item.uuid,
        title: item.title,
        user: item.user,
        planned: item.plannedInCurrencies[authUser?.currency],
        spent: item.spentInCurrencies[authUser?.currency] || 0,
        recurrent: item.recurrent,
        isCompleted: item.isCompleted,
      }
      itemsOnDate.push(compactWeekItem);
      groupedObj[dayOfWeek] = itemsOnDate;
    })
    setWeekGroup(groupedObj);
  }, [budget]);

  const addBudgetButton = (
    <Button
      className="mt-2 shadow-sm bg-white hover:bg-white h-[60px] w-full text-3xl text-stone-400"
      variant="ghost"
    >
      +
    </Button>
  )

  return (
    <Stack spacing={1}>
      {header(startDate)}
      <div className="grid grid-cols-8 gap-3 justify-center">
        {weekDaysArray.map((day: number, weekDayIndex: number) => (
          <div
            className={isToday(daysFullFormatArray[weekDayIndex].fullDate) ? 'col-span-2' : ''}
          >
            <div className="flex flex-col justify-center items-center gap-1 relative">
              {weekGroup[day] &&
                weekGroup[day].map((item: CompactWeekItem, index: number) => (
                  <BudgetItem
                    index={index}
                    key={item.uuid}
                    uuid={item.uuid}
                    title={item.title}
                    user={item.user}
                    planned={item.planned}
                    spent={item.spent}
                    recurrent={item.recurrent}
                    isCompleted={item.isCompleted}
                    weekUrl={weekUrl}
                    monthUrl={monthUrl}
                    clickEdit={clickEdit}
                    clickDelete={clickDelete}
                    mutateBudget={mutateBudget}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </Stack>
  );
};

export default Container;
