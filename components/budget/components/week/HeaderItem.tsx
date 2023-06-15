import { FC } from 'react'
import {
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
  isToday: boolean
}

const HeaderItem: FC<Types> = ({ date, isWeekend, isToday }) => {
  let containerClasses = isWeekend ? "outline outline-red-500 text-red-500 bg-white" : "outline outline-stone-500 bg-white"
  if (isToday) {
    containerClasses = `${containerClasses} bg-orange-200 outline-offset-2 font-bold rounded-sm`
  }
  containerClasses = `${containerClasses} rounded-sm`

  return (
    <div
      className={containerClasses}
    >
      <span className="flex align-middle justify-center text-xl">
        {date.shortDayName} {isToday && ' (today)'}
      </span>
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
    </div>
  )
}

export default HeaderItem
