import React from 'react'
import { useStore } from '@/app/store'
import ReportTypeSwitcher, { ReportPages } from './components/ReportTypeSwitcher'
import ReportOverall from './components/ReportOverall'
import ChartReport from './components/ChartReport'
import Toolbar from '@/components/common/layout/Toolbar'

const Index: React.FC = () => {
  const reportType = useStore((state) => state.reportType)
  const setReportType = useStore((state) => state.setReportType)

  return (
    <>
      <Toolbar title={'Reports'}>
        <ReportTypeSwitcher activePage={reportType} changeReportType={setReportType} />
      </Toolbar>
      {reportType === ReportPages.Overall && <ReportOverall />}
      {reportType === ReportPages.Chart && <ChartReport />}
    </>
  )
}

export default Index
