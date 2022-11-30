import { FC } from 'react'
import {
  Box,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Typography
} from '@mui/material'
import { teal } from '@mui/material/colors'
import {
  formatMoney
} from '@/utils/numberUtils'

interface Types {
  spent: number
  planned: number
  date: string
}

const TimelineBudgetItem: FC<Types> = ({ spent, planned, date }) => {
  console.log(date)
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
        height: 60,
        width: '60%',
        border: '1px solid',
        backgroundColor: teal[50]
      }}
    >
      <Grid container>
        <Grid item xs={12}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',
            width: '100%'
          }}>
            <Typography align="center" sx={{ fontSize: "1.3em", fontWeight: 'bold' }}>
              {formatMoney(spent)}
            </Typography>
            {!!planned &&
              <>
                <Typography sx={{ mx: 1 }}>of</Typography>
                <Typography>
                  {formatMoney(planned)}
                </Typography>
              </>
            }
            <Box
              sx={{
                position: 'absolute',
                top: 3,
                left: 5
              }}
            >
              <Chip
                size="small"
                label={date}
                sx={{
                  fontSize: '0.7em',
                  height: '90%',
                  backgroundColor: 'grey',
                  color: 'white'
                }}
              />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ position: "relative" }}>
            <LinearProgress
              variant="determinate"
              color={progressColor}
              value={percentage > 100 ? percentage % 100 : percentage}
              sx={{
                height: 20,
                mx: 2,
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
              <Typography variant="h6" sx={{
                display: "flex",
                color: "white",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}>{planned === 0
                ? 'Not planned'
                : `${percentage}%`
                }
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default TimelineBudgetItem
