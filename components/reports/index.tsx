import React from 'react'
import {
  addMonths,
  format,
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
import { TransactionsReportResponse } from '@/components/transactions/types'
import {
  parseAndFormatDate,
  getFormattedDate,
  REPORT_FORMAT,
  SHORT_YEAR_MONTH_FORMAT
} from '@/utils/dateUtils'
import { useAuth } from '@/context/auth'
import { RangeSwitcher, ReportTypeSwitcher } from './components'
import { ReportPages } from './components/ReportTypeSwitcher'

const Index: React.FC = () => {
  const [date, setDate] = React.useState<Date>(new Date())
  const [reportType, setReportType] = React.useState<ReportPages>(ReportPages.Overall)
  const { user: authUser, isLoading: isAuthLoading } = useAuth()

  const dateFrom = getFormattedDate(startOfMonth(subMonths(date, 11)))
  const dateTo = getFormattedDate(endOfMonth(date))

  const {
    data: reportResponse = []
  } = authUser?.currency ? useTransactionsReport(dateFrom, dateTo, authUser?.currency) : { data: [] }

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
    const aggRow = { id: row.id, day: row.day }
    for (let i = 1; i <= 12; i += 1) {
      aggRow[`month${i}`] = aggregatedRows[index - 1][`month${i}`] + rows[index][`month${i}`]
    }
    aggregatedRows.push(aggRow)
  })

  return (
    <>
      <Toolbar className="flex pb-1">
        <Typography className="w-full" variant="h4" sx={{ my: 2 }}>Reports</Typography>
        <ReportTypeSwitcher activePage={reportType} changeReportType={setReportType} />
      </Toolbar>
      <div className="flex flex-col items-center gap-2 h-screen">
        <RangeSwitcher
          dateFrom={dateFrom}
          dateTo={dateTo}
          clickBack={clickBack}
          clickForward={clickForward}
        />
        <div className="flex h-screen w-full">
          <DataGrid
            columns={columns}
            rows={aggregatedRows}
            rowHeight={30}
            sx={{ height: '100%' }}
            getCellClassName={(params) => {
              const day: number = format(new Date(), 'd')
              if (params.id === Number(day)) {
                return 'bg-slate-500 text-white'
              }
              return ''
            }}
          />
        </div>
      </div>
    </>
  )
}

export default Index
