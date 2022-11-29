import { FC, useEffect, useState } from 'react'
import {
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material'
import SubCategorySummaryButton from './SubCategorySummaryButton'
import { useBudgetMonth } from '@/hooks/budget'
import {
  GroupedByCategoryBudget,
  MonthOverallBudgetItem,
  MonthBudgetItem
} from '@/components/budget/types'

interface Types {
  activeCategoryUuid: string
  startDate: string
  endDate: string
}

const DetailsPanel: FC<Types> = ({ activeCategoryUuid, startDate, endDate }) => {
  const [title, setTitle] = useState<string>('Choose category')
  const [categoryBudgets, setCategoryBudgets] = useState<MonthOverallBudgetItem[]>([])
  const {
    data: budget,
    isLoading: isBudgetLoading
  } = useBudgetMonth(startDate, endDate);

  useEffect(() => {
    if (!activeCategoryUuid || isBudgetLoading) return;

    const _category = budget.find(
      (item: GroupedByCategoryBudget) => item.uuid === activeCategoryUuid
    )

    if (_category) {
      setCategoryBudgets(_category.budgets)
      setTitle(_category.categoryName)
    } else {
      setCategoryBudgets([])
      setTitle('Choose category')
    }
  }, [activeCategoryUuid, startDate, endDate, isBudgetLoading])

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid rgba(0, 0, 0, 0.2)",
        borderRadius: 5,
      }}
    >
      <Stack justifyContent="center" sx={{ p: 2 }}>
        <Typography align="center" variant="h3" mb={2}>
          {title}
        </Typography>
        <Grid container spacing={2}>
          {categoryBudgets.map((item: MonthBudgetItem) => (
            <Grid item xs={6} key={item.uuid}>
              <SubCategorySummaryButton item={item} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Paper>
  )
}

export default DetailsPanel;
