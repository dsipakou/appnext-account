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
import PreviousMonthsCard from './PreviousMonthsCard'
import { useAuth } from '@/context/auth'

interface Types {
  activeCategoryUuid: string
  startDate: string
  endDate: string
  clickShowTransactions: (uuid: string) => void
  clickEdit: (uuid: string) => void
  clickDelete: (uuid: string) => void
}

const DetailsPanel: FC<Types> = ({
  activeCategoryUuid,
  startDate,
  endDate,
  clickShowTransactions,
  clickEdit,
  clickDelete
}) => {
  const { user } = useAuth()
  const [budgetTitle, setBudgetTitle] = useState<string | undefined>()
  const [budgetItems, setBudgetItems] = useState<MonthBudgetItem[]>([])
  const [activeBudgetUuid, setActiveBudgetUuid] = useState<string | null>(null)
  const {
    data: budgetList = [],
    isLoading: isBudgetLoading
  } = useBudgetMonth(startDate, endDate);

  const activeCategory = budgetList.length > 0 
    ? budgetList.find(
      (item: GroupedByCategoryBudget) => item.uuid === activeCategoryUuid
    )
    : null

  const categoryBudgets = activeCategory
    ? activeCategory.budgets
    : []

  const title = activeCategory?.categoryName || 'Choose category'

  useEffect(() => {
    if (!categoryBudgets || isBudgetLoading || !activeBudgetUuid) return;

    if (!activeCategory) {
      setActiveBudgetUuid(null)
      return
    }

    const _budget = categoryBudgets.find(
      (item: MonthBudgetItem) => item.uuid === activeBudgetUuid
    )

    if (!_budget) {
      setActiveBudgetUuid(null)
      return
    }

    setBudgetTitle(_budget.title)
    setBudgetItems(_budget.items || [])
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
            clickShowTransactions={clickShowTransactions}
            clickEdit={clickEdit}
            clickDelete={clickDelete}
          /> :
          activeCategory && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <CategorySummaryCard item={activeCategory} />
              </Grid>
              <Grid item xs={6}>
                <PreviousMonthsCard />
              </Grid>
              {categoryBudgets.map((item: MonthGroupedBudgetItem) => (
                <Grid item xs={6} key={item.uuid}>
                  <Box key={item.uuid} onClick={() => setActiveBudgetUuid(item.uuid)}>
                    <GroupedBudgetButton item={item} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          )
        }
      </Stack>
    </Paper>
  )
}

export default DetailsPanel;
