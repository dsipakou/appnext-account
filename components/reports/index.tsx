import React from 'react'
import {
  Box,
  Toolbar,
  Typography
} from '@mui/material'
import { useStore } from '@/app/store'
import ReportTypeSwitcher, { ReportPages } from './components/ReportTypeSwitcher'
import ReportOverall from './components/ReportOverall'
import ChartReport from './components/ChartReport'

const Index: React.FC = () => {
  const reportType = useStore((state) => state.reportType)
  const setReportType = useStore((state) => state.setReportType)

  console.log(reportType)

  return (
    <>
      <Toolbar sx={{ pb: 1 }}>
        <Typography variant="h4" sx={{ my: 2 }}>Reports</Typography>
        <Box sx={{ flexGrow: 2 }} />
        <ReportTypeSwitcher activePage={reportType} changeReportType={setReportType} />
      </Toolbar>
      {reportType === ReportPages.Overall && <ReportOverall />}
      {reportType === ReportPages.Chart && <ChartReport />}
    </>
  )
}

export default Index
