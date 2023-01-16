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
    <Grid container>
      <Grid item>
        <IconButton onClick={clickBack}>
          <KeyboardDoubleArrowLeftIcon />
        </IconButton>
      </Grid>
      <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h5">{formattedDateFrom} - {formattedDateTo}</Typography>
      </Grid>
      <Grid item>
        <IconButton onClick={clickForward}>
          <KeyboardDoubleArrowRightIcon />
        </IconButton>
      </Grid>
    </Grid>
  )
}

export default RangeSwitcher
