import React from 'react'
import {
  Grid,
  IconButton,
  Typography
} from '@mui/material'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule'
import { parseAndFormatDate, SHORT_YEAR_MONTH_FORMAT } from '@/utils/dateUtils'

interface Types {
  dateFrom: string
  dateTo: string
  clickBack: () => void
  clickForward: () => void
}

const RangeSwitcher: React.FC<Types> = ({ dateFrom, dateTo, clickBack, clickForward }) => {

  const formattedDateFrom = parseAndFormatDate(dateFrom, SHORT_YEAR_MONTH_FORMAT)
  const formattedDateTo = parseAndFormatDate(dateTo, SHORT_YEAR_MONTH_FORMAT)

  return (
    <div className="flex">
      <div>
        <IconButton onClick={clickBack}>
          <KeyboardDoubleArrowLeftIcon />
        </IconButton>
      </div>
      <div className="flex items-center">
        <Typography variant="h5">{formattedDateFrom} - {formattedDateTo}</Typography>
      </div>
      <div>
        <IconButton onClick={clickForward}>
          <KeyboardDoubleArrowRightIcon />
        </IconButton>
      </div>
    </div>
  )
}

export default RangeSwitcher
