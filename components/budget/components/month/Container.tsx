import React from 'react'
import { useSession } from 'next-auth/react'
import { useBudgetMonth } from '@/hooks/budget'
import {
  Box,
  Grid,
  Stack
} from '@mui/material'
import { GroupedByCategoryBudget } from '@/components/budget/types'
import CategorySummaryButton from './CategorySummaryButton'
import DetailsPanel from './DetailsPanel'

interface Types {
  startDate: string
  endDate: string
  user: string
  weekUrl: string
  monthUrl: string
  clickShowTransactions: (uuid: string) => void
}

const Container: React.FC<Types> = ({
  startDate,
  endDate,
  user,
  weekUrl,
  monthUrl,
  clickShowTransactions,
}) => {
  const { data: { user: authUser }} = useSession()
  const [activeCategoryUuid, setActiveCategoryUuid] = React.useState<string>('')
  const {
    data: budget,
    isLoading: isBudgetLoading
  } = useBudgetMonth(startDate, endDate, user);

  React.useEffect(() => {
    if (!budget) return

    if (!activeCategoryUuid) {
      setActiveCategoryUuid(budget[0].uuid)
    }
  }, [budget])

  return (
    <Grid container>
      <Grid item xs={4}>
        <Stack spacing={1}>
          {budget && budget.map((item: GroupedByCategoryBudget) => (
            <Box
              key={item.uuid}
              onClick={() => setActiveCategoryUuid(item.uuid)}
            >
              <CategorySummaryButton
                title={item.categoryName}
                isActive={activeCategoryUuid === item.uuid}
                planned={item.plannedInCurrencies[authUser?.currency]}
                spent={item.spentInCurrencies[authUser?.currency]}
                currencyCode={authUser?.currency}
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
          user={user}
          clickShowTransactions={clickShowTransactions}
          weekUrl={weekUrl}
          monthUrl={monthUrl}
        />
      </Grid>
    </Grid>
  )
}

export default Container
