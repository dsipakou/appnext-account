import { FC, useState } from 'react'
import { useBudgetMonth } from '@/hooks/budget'
import {
  Box,
  Grid,
  Stack
} from '@mui/material'
import { GroupedByCategoryBudget } from '@/components/budget/types'
import CategorySummaryButton from './CategorySummaryButton'
import DetailsPanel from './DetailsPanel'
import { useAuth } from '@/context/auth'

interface Types {
  startDate: string
  endDate: string
}

const Container: FC<Types> = ({ startDate, endDate }) => {
  const { user } = useAuth();
  const [activeCategoryUuid, setActiveCategoryUuid] = useState<string>('')
  const {
    data: budget,
    isLoading: isBudgetLoading
  } = useBudgetMonth(startDate, endDate);

  return (
    <Grid container>
      <Grid item xs={4}>
        <Stack spacing={1}>
          {!isBudgetLoading && budget.map((item: GroupedByCategoryBudget) => (
            <Box
              key={item.uuid}
              onClick={() => setActiveCategoryUuid(item.uuid)}
            >
              <CategorySummaryButton
                title={item.categoryName}
                isActive={activeCategoryUuid === item.uuid}
                planned={item.plannedInCurrencies[user?.currency]}
                spent={item.spentInCurrencies[user?.currency]}
                currencyCode={user?.currency}
              />
            </Box>
          ))}
        </Stack>
      </Grid>
      <Grid item xs={8}>
        <DetailsPanel
          activeCategoryUuid={activeCategoryUuid}
          startDate={startDate}
          endDate={endDate}
        />
      </Grid>
    </Grid>
  )
}

export default Container
