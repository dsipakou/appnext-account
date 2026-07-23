import React from 'react';

import { Button } from '@/components/ui/button';

export enum ReportPages {
  Overall,
  Chart,
}

interface Types {
  activePage: ReportPages;
  wip: boolean;
  changeReportType: (page: ReportPages) => void;
}

const ReportTypeSwitcher: React.FC<Types> = ({ activePage = ReportPages.Overall, wip = false, changeReportType }) => {
  return (
    <div className="flex w-full justify-center">
      <div className="flex rounded-md border bg-blue-500">
        <Button
          variant="none"
          className="w-[180px] p-1 disabled:opacity-100"
          disabled={activePage === ReportPages.Overall}
          onClick={() => changeReportType(ReportPages.Overall)}
        >
          <span
            className={`text-xl ${activePage === ReportPages.Overall ? 'flex h-full w-full items-center justify-center rounded-md bg-white text-xl text-blue-500' : 'text-white'}`}
          >
            Overall
          </span>
        </Button>
        <Button
          variant="none"
          className="w-[180px] p-1 disabled:opacity-100"
          disabled={activePage === ReportPages.Chart}
          onClick={() => changeReportType(ReportPages.Chart)}
        >
          <span
            className={`text-xl ${activePage === ReportPages.Chart ? 'flex h-full w-full items-center justify-center rounded-md bg-white text-xl text-blue-500' : 'text-white'}`}
          >
            Chart
          </span>
        </Button>
        {wip && (
          <Button
            variant="none"
            className="w-[180px] p-1 disabled:opacity-100"
            disabled={activePage === ReportPages.Details}
            onClick={() => changeReportType(ReportPages.Details)}
          >
            <span
              className={`text-xl ${activePage === ReportPages.Details ? 'flex h-full w-full items-center justify-center rounded-md bg-white text-xl text-blue-500' : 'text-white'}`}
            >
              Details
            </span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReportTypeSwitcher;
