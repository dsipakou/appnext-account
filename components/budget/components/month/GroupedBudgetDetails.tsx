import { FC, useEffect } from 'react'
import { getWeeksInMonth } from 'date-fns'
import {
  IconButton,
  Grid,
  Paper,
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
import {
  parseDate,
  getStartOfWeekOrMonth,
  getMonthWeeksWithDates,
  WeekOfMonth
} from '@/utils/dateUtils'

interface Types {
  title: string
  startDate: string
  handleClose: () => void
}

const GroupedBudgetDetails: FC<Types> = ({ title, startDate, handleClose }) => {
  const startMonth = parseDate(startDate)
  const numberOfWeeks: number[] = new Array(getWeeksInMonth(startMonth)).fill(0)
  getMonthWeeksWithDates(startDate)
  const weeks: WeekOfMonth[] = getMonthWeeksWithDates(startDate)

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
          >
            <CloseIcon onClick={handleClose} />
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
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography>
                    {item.startDate} - {item.endDate}
                  </Typography>
                  <Paper>
                    Hello
                  </Paper>
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
