import { FC, useEffect, useState } from 'react'
import { getDay } from 'date-fns'
import { Grid, Stack, Typography } from '@mui/material'
import { useBudgetWeek } from '@/hooks/budget'
import { RecurrentTypes, WeekBudgetItem } from '@/components/budget/types'
import { ConfirmDeleteForm } from '@/components/budget/forms'
import {
  getWeekDaysWithFullDays,
  parseDate,
  parseAndFormatDate,
  FULL_DAY_ONLY_FORMAT,
  MONTH_DAY_FORMAT,
  WeekDayWithFullDate,
} from '@/utils/dateUtils'
import { useAuth } from '@/context/auth'
import BudgetItem from './BudgetItem'
import HeaderItem from './HeaderItem'

interface Types {
  startDate: string
  endDate: string
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
  planned: number
  spent: number
  recurrent: RecurrentTypes
  isCompleted: boolean
}

interface GroupedByWeek {
  [key: string]: CompactWeekItem[]
}

const header = () => {
  const currentDay: number = (getDay(new Date()) + 6) % 7
  const daysShortFormatArray: WeekDayWithFullDate[] = getWeekDaysWithFullDays()
  const daysFullFormatArray: string[] = getWeekDaysWithFullDays(FULL_DAY_ONLY_FORMAT)

  return (
    <div className="grid grid-cols-8 gap-3">
      {daysShortFormatArray.map((item: WeekDayWithFullDate, index: number) => (
        <div
          key={index}
          className={currentDay === index ? 'col-span-2' : ''}
        >
          <HeaderItem
            date={item}
            isWeekend={index > 4}
          />
        </div>
      ))}
    </div>
  )
}

const Container: FC<Types> = ({
  startDate,
  endDate,
  clickEdit,
  clickDelete,
  mutateBudget
}) => {
  const [weekGroup, setWeekGroup] = useState<GroupedByWeek>({});
  const { data: budget, isLoading }: WeekBudgetResponse = useBudgetWeek(
    startDate,
    endDate
  )
  const currentDay: number = getDay(new Date())
  const { user } = useAuth();
  const weekDaysArray: number[] = [1, 2, 3, 4, 5, 6, 0];


  useEffect(() => {
    if (!budget) return;
    const groupedObj: GroupedByWeek = {};

    budget.forEach((item: WeekBudgetItem) => {
      const dayOfWeek: number = getDay(parseDate(item.budgetDate));
      const itemsOnDate: CompactWeekItem[] = groupedObj[dayOfWeek] || [];
      const compactWeekItem: CompactWeekItem = {
        uuid: item.uuid,
        title: item.title,
        planned: item.plannedInCurrencies[user?.currency],
        spent: item.spentInCurrencies[user?.currency] || 0,
        recurrent: item.recurrent,
        isCompleted: item.isCompleted,
      };
      itemsOnDate.push(compactWeekItem);
      groupedObj[dayOfWeek] = itemsOnDate;
    });
    setWeekGroup(groupedObj);
  }, [budget]);

  return (
    <Stack spacing={1}>
      {header()}
      <div className="grid grid-cols-8 gap-3">
        {weekDaysArray.map((i: number) => (
          <div
            className={currentDay === i ? 'col-span-2' : ''}
          >
            <Stack spacing={1}>
              {weekGroup[i] &&
                weekGroup[i].map((item: CompactWeekItem) => (
                  <BudgetItem
                    key={item.uuid}
                    uuid={item.uuid}
                    title={item.title}
                    planned={item.planned}
                    spent={item.spent}
                    recurrent={item.recurrent}
                    isCompleted={item.isCompleted}
                    clickEdit={clickEdit}
                    clickDelete={clickDelete}
                    mutateBudget={mutateBudget}
                  />
                ))}
            </Stack>
          </div>
        ))}
      </div>
    </Stack>
  );
};

export default Container;
