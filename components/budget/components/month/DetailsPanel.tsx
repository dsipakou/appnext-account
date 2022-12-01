import { FC, useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material'
import GroupedBudgetButton from './GroupedBudgetButton'
import { useBudgetMonth } from '@/hooks/budget'
import {
  GroupedByCategoryBudget,
  MonthGroupedBudgetItem,
  MonthBudgetItem
} from '@/components/budget/types'
import GroupedBudgetDetails from './GroupedBudgetDetails'
import CategorySummaryCard from './CategorySummaryCard'
import { useAuth } from '@/context/auth'

interface Types {
  activeCategoryUuid: string
  startDate: string
  endDate: string
}

const DetailsPanel: FC<Types> = ({ activeCategoryUuid, startDate, endDate }) => {
  const { user } = useAuth()
  const [title, setTitle] = useState<string>('Choose category')
  const [budgetTitle, setBudgetTitle] = useState<string | undefined>()
  const [categoryBudgets, setCategoryBudgets] = useState<MonthGroupedBudgetItem[]>([])
  const [category, setCategory] = useState<GroupedByCategoryBudget | null>(null)
  const [budgetItems, setBudgetItems] = useState<MonthBudgetItem[]>([])
  const [activeBudgetUuid, setActiveBudgetUuid] = useState<string | null>(null)
  const {
    data: budget,
    isLoading: isBudgetLoading
  } = useBudgetMonth(startDate, endDate);

  useEffect(() => {
    if (!activeCategoryUuid || isBudgetLoading) return;

    setActiveBudgetUuid(null)

    const _category = budget.find(
      (item: GroupedByCategoryBudget) => item.uuid === activeCategoryUuid
    )

    if (_category) {
      setCategoryBudgets(_category.budgets)
      setTitle(_category.categoryName)
      setCategory(_category)
    } else {
      setCategoryBudgets([])
      setTitle('Choose category')
      setCategory(null)
    }
  }, [activeCategoryUuid, startDate, endDate, isBudgetLoading])

  useEffect(() => {
    if (!categoryBudgets || isBudgetLoading || !activeBudgetUuid) return;

    const _budget = categoryBudgets.find(
      (item: MonthBudgetItem) => item.uuid === activeBudgetUuid
    )

    setBudgetTitle(_budget!.title)
    setBudgetItems(_budget!.items)
  }, [activeBudgetUuid, categoryBudgets, isBudgetLoading])

  const handleCloseBudgetDetails = (): void => {
    setActiveBudgetUuid(null)
  }

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
        {activeBudgetUuid ?
          <GroupedBudgetDetails
            title={budgetTitle}
            items={budgetItems}
            startDate={startDate}
            handleClose={handleCloseBudgetDetails}
          /> :
          <Grid container spacing={2}>
            <Grid item xs={6}>
              { category && <CategorySummaryCard item={category} /> }
            </Grid>
            {categoryBudgets.map((item: MonthBudgetItem) => (
              <Grid item xs={6} key={item.uuid}>
                <Box key={item.uuid} onClick={() => setActiveBudgetUuid(item.uuid)}>
                  <GroupedBudgetButton item={item} />
                </Box>
              </Grid>
            ))}
          </Grid>
        }
      </Stack>
    </Paper>
  )
}

export default DetailsPanel;
