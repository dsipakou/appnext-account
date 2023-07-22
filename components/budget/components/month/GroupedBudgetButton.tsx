import { FC } from 'react'
import { useSession } from 'next-auth/react'
import {
  Badge,
  Box,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Typography
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { MonthGroupedBudgetItem } from '@/components/budget/types'
import { teal, green } from '@mui/material/colors'
import { formatMoney } from '@/utils/numberUtils'
import LoopIcon from '@mui/icons-material/Loop'

interface Types {
  item: MonthGroupedBudgetItem
}

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -10,
    top: 3,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 7px',
  },
}));

const GroupedBudgetButton: FC<Types> = ({ item }) => {
  const { data: { user }} = useSession()

  const repeatedFor: number = item.items.length

  const planned: number = item.plannedInCurrencies[user?.currency]
  const spent: number = item.spentInCurrencies[user?.currency] || 0
  const percentage: number = Math.floor(spent * 100 / planned)
  const isCompleted: boolean = item.items.every((_item: MonthBudgetItem) => _item.isCompleted)

  const progressColor: string = planned === 0 ?
    "secondary" :
    Math.floor(percentage) > 100 ?
      "error" :
      "primary"

  return (
    <Paper elevation={0}
      sx={{
        height: 172,
        backgroundColor: '#F4F6F8',
        border: "1px solid rgba(0, 0, 0, 0.2)",
        p: 2,
        cursor: 'pointer'
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
            )}
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
                my: 1,
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
          {isCompleted &&
            <Chip
              size="small"
              label="Completed"
              sx={{
                backgroundColor: green[500],
                color: "white",
                fontWeight: "bold"
              }}
            />
          }
        </Grid>
        <Grid item xs={6} align="right">
          {item.items[0].recurrent &&
            <Chip
              icon={<LoopIcon fontSize="small" variant="outlined" />}
              label={item.items[0].recurrent}
              size="small"
              sx={{
                backgroundColor: teal[50],
                px: 1,
                border: '2px solid rgba(0, 0, 0, 0.2)'
              }}
            >
            </Chip>
          }
        </Grid>
      </Grid>
    </Paper >
  )
}

export default GroupedBudgetButton;
