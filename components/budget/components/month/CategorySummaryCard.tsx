import { FC } from 'react'
import {
  Box,
  Grid,
  LinearProgress,
  Paper,
  Typography
} from '@mui/material'
import { MonthGroupedBudgetItem } from '@/components/budgets/types'
import { useAuth } from '@/context/auth'
import { formatMoney } from '@/utils/numberUtils'
import { GroupedByCategoryBudget } from '@/components/budget/types'

interface Types {
  item: GroupedByCategoryBudget
}

const CategorySummaryCard: FC<Types> = ({ item }) => {
  const { user } = useAuth()
  const planned = item.plannedInCurrencies[user?.currency]
  const spent = item.spentInCurrencies[user?.currency]
  const percentage: number = Math.floor(spent * 100 / planned)
  const progressColor: string = planned === 0 ?
    "secondary" :
    Math.floor(percentage) > 100 ?
      "error" :
      "primary"

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%'
      }}
    >
      <Grid
        container
        sx={{ height: '100%' }}
      >
        <Grid item xs={12}>
          <Typography variant="h4">
            Month summary
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h3">
              {formatMoney(spent)}
            </Typography>
            <Typography sx={{ mx: 1 }}>
              of
            </Typography>
            <Typography>
              {formatMoney(planned)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ position: 'relative' }}>
            <LinearProgress
              variant="determinate"
              color={progressColor}
              value={percentage > 100 ? percentage % 100 : percentage}
              sx={{
                height: 40,
                mx: 2,
                borderRadius: 2
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 0,
                width: "100%",
                height: "100%",
              }}
            >
              <Typography variant="h5" sx={{
                display: "flex",
                color: "white",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}>{planned === 0 ? 'Not planned' : `${percentage}%`}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default CategorySummaryCard
