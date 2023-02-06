import React from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import locale from 'date-fns/locale/ru'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import {
  GridRenderEditCellParams,
  useGridApiContext
} from '@mui/x-data-grid'
import {
  TextField
} from '@mui/material'

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
      <DatePicker
        value={value}
        onChange={handleChange}
        renderInput={(params) => <TextField fullWidth {...params} />}
      />
    </LocalizationProvider>
  )
}

export default DateComponent
