import React from 'react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth
} from 'date-fns'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useTransactionsReport } from '@/hooks/transactions'
import { useAuth } from '@/context/auth'
import {
  getFormattedDate,
  parseAndFormatDate,
  REPORT_FORMAT,
  SHORT_YEAR_MONTH_FORMAT
} from '@/utils/dateUtils'
import { TransactionsReportResponse } from '@/components/transactions/types'
import RangeSwitcher from './RangeSwitcher'

const ReportOverall: React.FC = () => {
  const [date, setDate] = React.useState<Date>(new Date())
  const { user: authUser } = useAuth()

  const dateFrom = getFormattedDate(startOfMonth(subMonths(date, 11)))
  const dateTo = getFormattedDate(endOfMonth(date))

  const {
    data: reportResponse = []
  } = authUser?.currency ? useTransactionsReport(dateFrom, dateTo, authUser?.currency) : { data: [] }


  const columns: GridColDef[] = [
    { field: 'day', headerName: '', width: 40 }
  ]

  const dates = [...new Set(reportResponse.map(
    (item: TransactionsReportResponse) => item.month
  ))].sort()

  dates.forEach((date: string, index: number) => {
    const formatedDate = parseAndFormatDate(date, SHORT_YEAR_MONTH_FORMAT, REPORT_FORMAT)
    columns.push({
      field: `month${index + 1}`,
      headerName: formatedDate,
      width: 90
    })
  })

  const days: number[] = Array(31).fill(0).map((_, index: number) => index + 1)
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

  const clickBack = (): void => {
    setDate((oldDate) => subMonths(oldDate, 1))
  }

  const clickForward = (): void => {
    setDate((oldDate) => addMonths(oldDate, 1))
  }

  return (
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
  )
}

export default ReportOverall