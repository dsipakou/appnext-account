import { FC } from 'react'
import {
  Badge,
  Box,
  Grid,
  LinearProgress,
  Paper,
  Typography
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { MonthOverallBudgetItem } from '@/components/budget/types'
import { formatMoney } from '@/utils/numberUtils'
import { useAuth } from '@/context/auth'
import EventRepeatIcon from '@mui/icons-material/EventRepeat';

interface Types {
  item: MonthOverallBudgetItem
}

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -10,
    top: 3,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 7px',
  },
}));

const SubCategorySummaryButton: FC<Types> = ({ item }) => {
  const { user } = useAuth()

  const repeatedFor: number = item.items.length

  const planned = item.plannedInCurrencies[user?.currency]
  const spent = item.spentInCurrencies[user?.currency] || 0
  const percentage: number = Math.floor(spent * 100 / planned)

  const progressColor: string = planned === 0 ?
    "secondary" :
    Math.floor(percentage) > 100 ?
      "error" :
      "success"

  console.log(item)

  return (
    <Paper elevation={0}
      sx={{
        height: 162,
        backgroundColor: '#F4F6F8',
        border: "1px solid rgba(0, 0, 0, 0.2)",
        p: 2,
      }}
    >
      <Grid container>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: '10px' }}>
            {repeatedFor > 1 ? (
              <StyledBadge color="secondary" badgeContent={`x${repeatedFor}`}>
                <Typography sx={{ fontSize: '1.2em' }}>{item.title}</Typography>
              </StyledBadge>
            ) : (
              <Typography sx={{ fontSize: '1.2em' }}>{item.title}</Typography>
            )}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography
              align="center"
              sx={{ fontSize: "1.5em", fontWeight: 'bold' }}
            >
              {formatMoney(spent)}
            </Typography>
            {planned !== 0 && (
              <>
                <Typography sx={{ mx: 1 }}>of</Typography>
                <Typography>
                  {formatMoney(planned)}
                </Typography>
              </>
            )
            }
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ position: "relative" }}>
            <LinearProgress
              variant="determinate"
              color={progressColor}
              value={percentage > 100 ? percentage % 100 : percentage}
              sx={{
                height: 35,
                mx: 2,
                mt: 1,
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
              }}>{planned === 0 ? 'Not planned' : `${percentage}%`}</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={6}>
          {item.items[0].recurrent &&
            <Typography mt={1} sx={{ display: 'flex', alignItems: 'center' }}>
              <EventRepeatIcon sx={{ fontSize: '1.4em', pr: 1 }} />
              <span>{item.items[0].recurrent}</span>
            </Typography>
          }
        </Grid>
        <Grid item xs={6}>
        </Grid>
      </Grid>
    </Paper >
  )
}

export default SubCategorySummaryButton;
