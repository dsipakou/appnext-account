import { FC, useEffect, useState } from 'react'
import { getDay } from 'date-fns'
import { Grid, Stack, Typography } from '@mui/material'
import { useBudgetWeek } from '@/hooks/budget'
import { WeekBudgetItem } from '@/components/budget/types'
import { ConfirmDeleteForm } from '@/components/budget/forms'
import {
  parseDate,
  parseAndFormatDate,
  MONTH_DAY_FORMAT,
} from '@/utils/dateUtils'
import { useAuth } from '@/context/auth'
import BudgetItem from './BudgetItem'
import HeaderItem from './HeaderItem'

interface Types {
  startDate: string
  endDate: string
  clickEdit: () => void
  clickDelete: () => void
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
  isCompleted: boolean
}

interface GroupedByWeek {
  [key: string]: CompactWeekItem[]
}

const header = (
  <Grid container spacing={1}>
    <Grid item xs={2}></Grid>
    <Grid item xs={1}>
      <HeaderItem title="Mon" />
    </Grid>
    <Grid item xs={1}>
      <HeaderItem title="Tue" />
    </Grid>
    <Grid item xs={1}>
      <HeaderItem title="Wed" />
    </Grid>
    <Grid item xs={1}>
      <HeaderItem title="Thu" />
    </Grid>
    <Grid item xs={1}>
      <HeaderItem title="Fri" />
    </Grid>
    <Grid item xs={1}>
      <HeaderItem title="Sat" />
    </Grid>
    <Grid item xs={1}>
      <HeaderItem title="Sun" />
    </Grid>
    <Grid item></Grid>
  </Grid>
);

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
  );
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
      {header}
      <Grid container spacing={1}>
        <Grid item xs={2}></Grid>
        {weekDaysArray.map((i: number) => (
          <Grid item xs={1} key={i}>
            <Stack spacing={1}>
              {weekGroup[i] &&
                weekGroup[i].map((item: CompactWeekItem) => (
                  <BudgetItem
                    key={item.uuid}
                    uuid={item.uuid}
                    title={item.title}
                    planned={item.planned}
                    spent={item.spent}
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
