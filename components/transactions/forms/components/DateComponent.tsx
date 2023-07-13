import React from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import locale from 'date-fns/locale/ru'
import {
  addDays,
  subDays
} from 'date-fns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import {
  GridRenderEditCellParams,
  useGridApiContext
} from '@mui/x-data-grid'
import {
  IconButton,
  TextField
} from '@mui/material'
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

interface Types extends GridRenderEditCellParams { }

const DateComponent: React.FC<Types> = (params) => {
  const { id, field, value } = params
  const apiRef = useGridApiContext()

  const handleChange = (newValue: any) => {
    apiRef.current.setEditCellValue({ id, field, value: newValue })
  }

  React.useEffect(() => {
    apiRef.current.setEditCellValue({ id, field, value: value || new Date() })
  }, [])

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
      <IconButton
        variant="text"
        size="small"
        onClick={() => handleChange(subDays(value, 1))}
      >
        <ArrowLeftIcon fontSize="inherit" />
      </IconButton>
      <DatePicker
        value={value}
        onChange={handleChange}
        renderInput={(params) => <TextField fullWidth {...params} />}
      />
      <IconButton
        variant="text"
        size="small"
        onClick={() => handleChange(addDays(value, 1))}
      >
        <ArrowRightIcon fontSize="inherit" />
      </IconButton>
    </LocalizationProvider>
  )
}

export default DateComponent
