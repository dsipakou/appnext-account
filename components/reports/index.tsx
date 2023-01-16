import React from 'react'
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth
} from 'date-fns'
import {
  Box,
  Grid,
  Toolbar,
  Typography
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useTransactionsReport } from '@/hooks/transactions'
import RangeSwitcher from './components/RangeSwitcher'
import { TransactionsReportResponse } from '@/components/transactions/types'
import {
  parseAndFormatDate,
  getFormattedDate,
  REPORT_FORMAT,
  SHORT_YEAR_MONTH_FORMAT
} from '@/utils/dateUtils'
import { useAuth } from '@/context/auth'

const Index: React.FC = () => {
  const [date, setDate] = React.useState<Date>(new Date())
  const { user: authUser, isLoading: isAuthLoading } = useAuth()

  const dateFrom = getFormattedDate(startOfMonth(subMonths(date, 11)))
  const dateTo = getFormattedDate(endOfMonth(date))

  const {
    data: reportResponse = []
  } = authUser?.currency ? useTransactionsReport(dateFrom, dateTo, authUser?.currency) : []

  const clickBack = (): void => {
    setDate((oldDate) => subMonths(oldDate, 1))
  }

  const clickForward = (): void => {
    setDate((oldDate) => addMonths(oldDate, 1))
  }

  const days: number[] = Array(31).fill(0).map((_, index: number) => index + 1)

  const dates = [...new Set(reportResponse.map(
    (item: TransactionsReportResponse) => item.month
  ))].sort()

  const columns: GridColDef[] = [
    { field: 'day', headerName: '', width: 40 }
  ]

  dates.forEach((date: string, index: number) => {
    const formatedDate = parseAndFormatDate(date, SHORT_YEAR_MONTH_FORMAT, REPORT_FORMAT)
    columns.push({
      field: `month${index + 1}`,
      headerName: formatedDate,
      width: 90
    })
  })

  const rows = []

  days.forEach((day: number, index: number) => {
    const eachMonthValues = {}
    dates.forEach((date: string, innerIndex: number) => {
      eachMonthValues[`month${innerIndex + 1}`] = reportResponse.find((item: TransactionsReportResponse) => (
        item.month === date && item.day === day
      ))?.groupedAmount || 0
    })
    const row = {
      id: index + 1,
      day: index + 1,
      ...eachMonthValues
    }
    rows.push(row)
  })

  const aggregatedRows = [rows[0]]

  rows.forEach((row, index: number) => {
    if (index === 0) {
      return
    }
    const aggRow = {id: row.id, day: row.day}
    for (let i = 1; i <= 12; i += 1) {
      aggRow[`month${i}`] = aggregatedRows[index - 1][`month${i}`] + rows[index][`month${i}`]
    }
    aggregatedRows.push(aggRow)
  })

  return (
    <>
      <Toolbar sx={{ pb: 1 }}>
        <Typography variant="h4" sx={{ my: 2 }}>Reports</Typography>
        <Box sx={{ flexGrow: 2 }} />
        <RangeSwitcher
          dateFrom={dateFrom}
          dateTo={dateTo}
          clickBack={clickBack}
          clickForward={clickForward}
        />
      </Toolbar>
      <Grid container spacing={2} sx={{ height: '80vh' }}>
        <Grid item xs={12} sx={{ height: '100%' }}>
          <DataGrid
            columns={columns}
            rows={aggregatedRows}
            rowHeight={30}
            sx={{ height: '100%'}}
            getCellClassName={(params) => console.log(params)}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default Index
