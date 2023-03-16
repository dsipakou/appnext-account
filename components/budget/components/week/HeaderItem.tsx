import { FC } from 'react'
import {
  Box,
  Typography
} from '@mui/material'
import {
  WeekDayWithFullDate,
  getFormattedDate,
  MONTH_DAY_FORMAT
} from '@/utils/dateUtils'

interface Types {
  date: WeekDayWithFullDate
  isWeekend: boolean
}

const HeaderItem: FC<Types> = ({ date, isWeekend }) => {
  return (
    <Box
      className={isWeekend ? "bg-red-200" : "bg-sky-50"}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 50,
        width: '100%',
        borderRadius: 3,
        border: '1px solid rgba(0, 0, 0, 0.4)',
      }}
    >
      <Typography sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        fontSize: '1.2em',
        fontWeight: 'bold'
      }}>
        {date.shortDayName}
      </Typography>
      <Typography
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          fontSize: '0.9em',
        }}
      >
        {getFormattedDate(date.fullDate, MONTH_DAY_FORMAT)}
      </Typography>
    </Box>
  )
}

export default HeaderItem
