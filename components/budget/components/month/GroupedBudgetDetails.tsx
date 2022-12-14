import { FC, useEffect } from 'react'
import { getWeekOfMonth } from 'date-fns'
import {
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material'
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator
} from '@mui/lab'
import TimelineOppositeContent, {
  timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';
import CloseIcon from '@mui/icons-material/Close'
import { teal } from '@mui/material/colors'
import {
  parseDate,
  parseAndFormatDate,
  getMonthWeeksWithDates,
  WeekOfMonth,
  MONTH_DAY_FORMAT
} from '@/utils/dateUtils'
import { formatMoney } from '@/utils/numberUtils'
import { MonthBudgetItem } from '@/components/budget/types'
import { useAuth } from '@/context/auth'
import TimelineBudgetItem from './TimelineBudgetItem'

interface Types {
  title: string
  items: MonthBudgetItem[],
  startDate: string
  handleClose: () => void
}

interface WeekGroup {
  [key: number]: WeekItemDetails[]
}

interface WeekItemDetails {
  planned: number
  spent: number
  date: string
}

const GroupedBudgetDetails: FC<Types> = ({ title, items, startDate, handleClose }) => {
  const weeks: WeekOfMonth[] = getMonthWeeksWithDates(startDate)
  const { user } = useAuth()

  const groupedByWeek = (): WeekGroup => {
    const group: WeekGroup = {}
    items.forEach((item: MonthBudgetItem) => {
      const weekNumber: number = getWeekOfMonth(parseDate(item.budgetDate), { weekStartsOn: 1 })
      const planned: number = item.plannedInCurrencies[user?.currency]
      const spent: number = item.spentInCurrencies[user?.currency] || 0
      const date: string = parseAndFormatDate(item.budgetDate, MONTH_DAY_FORMAT)

      const items = group[weekNumber] || []
      items.push(
        {
          planned,
          spent,
          date,
        }
      )
      group[weekNumber] = items
    })
    return group
  }

  return (
    <Paper
      elevation={1}
      sx={{
        border: "1px solid rgba(0, 0, 0, 0.2)",
        borderRadius: 1,
        width: "100%",
        height: "100%",
        p: 1
      }}
    >
      <Grid container>
        <Grid item xs={2}>
        </Grid>
        <Grid item xs={8}>
          <Typography align="center" variant="h4">
            {title}
          </Typography>
        </Grid>
        <Grid item align="right" xs={2}>
          <IconButton
            aria-label="close"
            size="large"
            onClick={handleClose}
          >
            <CloseIcon />
          </IconButton>
        </Grid>
        <Grid item xs={12}>
          <Timeline
            sx={{
              [`& .${timelineOppositeContentClasses.root}`]: {
                flex: 0.2,
              },
            }}
          >
            {weeks.map((item: WeekOfMonth) => (
              <TimelineItem key={item.week}>
                <TimelineOppositeContent>
                  <Typography variant="h5">
                    Week {item.week}
                  </Typography>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot />
                  {!!groupedByWeek()[item.week] && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Typography fontSize="0.9em">
                    {item.startDate}
                    {item.startDate !== item.endDate &&
                      <> - {item.endDate}</>
                    }
                  </Typography>
                  {
                    groupedByWeek()[item.week]?.map(
                      (item: WeekItemDetails, index: number) => (
                        <Box sx={{ my: 1 }} key={index}>
                          <TimelineBudgetItem
                            planned={item.planned}
                            spent={item.spent}
                            date={item.date}
                          />
                        </Box>
                      )
                    )
                  }
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Grid>
      </Grid>
    </Paper >
  )
}

export default GroupedBudgetDetails
