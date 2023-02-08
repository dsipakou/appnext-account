import { FC, useEffect, useState } from 'react'
import { getDay } from 'date-fns'
import { Grid, Stack, Typography } from '@mui/material'
import { useBudgetWeek } from '@/hooks/budget'
import { RecurrentTypes, WeekBudgetItem } from '@/components/budget/types'
import { ConfirmDeleteForm } from '@/components/budget/forms'
import {
  getWeekDays,
  parseDate,
  parseAndFormatDate,
  FULL_DAY_ONLY_FORMAT,
  MONTH_DAY_FORMAT,
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
  const daysShortFormatArray: string[] = getWeekDays()
  const daysFullFormatArray: string[] = getWeekDays(FULL_DAY_ONLY_FORMAT)

  return (
    <Grid container spacing={1}>
      <Grid item xs={2}></Grid>
      {daysShortFormatArray.map((item: string, index: number) => (
        <Grid item xs={currentDay === index ? 2 : 1} key={item}>
          <HeaderItem title={currentDay === index ? daysFullFormatArray[index] : item} />
        </Grid>
      ))}
      <Grid item></Grid>
    </Grid>
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
      <Typography align="center" variant="h4">
        {parseAndFormatDate(startDate, MONTH_DAY_FORMAT)} -{" "}
        {parseAndFormatDate(endDate, MONTH_DAY_FORMAT)}
      </Typography>
      {header()}
      <Grid container spacing={1}>
        <Grid item xs={2}></Grid>
        {weekDaysArray.map((i: number) => (
          <Grid item xs={currentDay === i ? 2 : 1} key={i}>
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
          </Grid>
        ))}
        <Grid item xs={4}></Grid>
      </Grid>
    </Stack>
  );
};

export default Container;
