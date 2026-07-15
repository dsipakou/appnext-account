import React from 'react';

import { useStore } from '@/app/store';
import Toolbar from '@/components/common/layout/Toolbar';

import ChartReport from './components/ChartReport';
import EChartReport from './components/EChartReport';
import ReportOverall from './components/ReportOverall';
import ReportTypeSwitcher, { ReportPages } from './components/ReportTypeSwitcher';

const Index: React.FC = () => {
  const reportType = useStore((state) => state.reportType);
  const setReportType = useStore((state) => state.setReportType);

  return (
    <div className="flex h-full flex-col">
      <Toolbar title={'Reports'}>
        <ReportTypeSwitcher activePage={reportType} changeReportType={setReportType} />
      </Toolbar>
      {reportType === ReportPages.Overall && <ReportOverall />}
      {reportType === ReportPages.Chart && <EChartReport />}
      {reportType === ReportPages.Details && <ChartReport />}
    </div>
  );
};

export default Index;
