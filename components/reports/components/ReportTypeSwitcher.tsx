import React from 'react'
import { Button } from '@/components/ui/button'

export enum ReportPages {
  Overall,
  Chart,
  Details
}

interface Types {
  activePage: ReportPages
  wip: boolean
  changeReportType: (page: ReportPages) => void
}

const ReportTypeSwitcher: React.FC<Types> = ({ activePage = ReportPages.Overall, wip = false, changeReportType }) => {
  return (
    <div className="flex justify-center w-full">
      <div className="flex border bg-blue-500 rounded-md">
        <Button
          variant="none"
          className="w-[180px] disabled:opacity-100 p-1"
          disabled={activePage === ReportPages.Overall}
          onClick={() => changeReportType(ReportPages.Overall)}
        >
          <span className={`text-xl ${activePage === ReportPages.Overall ? 'flex justify-center items-center text-xl rounded-md text-blue-500 bg-white w-full h-full' : 'text-white'}`}>
            Overall
          </span>
        </Button>
        <Button
          variant="none"
          className="w-[180px] disabled:opacity-100 p-1"
          disabled={activePage === ReportPages.Chart}
          onClick={() => changeReportType(ReportPages.Chart)}
        >
          <span className={`text-xl ${activePage === ReportPages.Chart ? 'flex justify-center items-center text-xl rounded-md text-blue-500 bg-white w-full h-full' : 'text-white'}`}>
            Chart
          </span>
        </Button>
        {
          wip && (
            <Button
              variant="none"
              className="w-[180px] disabled:opacity-100 p-1"
              disabled={activePage === ReportPages.Details}
              onClick={() => changeReportType(ReportPages.Details)}
            >
              <span className={`text-xl ${activePage === ReportPages.Details ? 'flex justify-center items-center text-xl rounded-md text-blue-500 bg-white w-full h-full' : 'text-white'}`}>
                Details
              </span>
            </Button>
          )
        }
      </div>
    </div >
  )
}

export default ReportTypeSwitcher
