import React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export enum ReportPages {
  Overall,
  Chart,
  Details = 2,
}

interface Types {
  activePage: ReportPages;
  wip: boolean;
  changeReportType: (page: ReportPages) => void;
}

const ReportTypeSwitcher: React.FC<Types> = ({
  activePage = ReportPages.Overall,
  wip = false,
  changeReportType,
}) => {
  return (
    <div className="flex w-full justify-center">
      <div className="flex rounded-md border bg-blue-500">
        <Button
          variant="empty"
          className="w-45 p-px disabled:opacity-100"
          disabled={activePage === ReportPages.Overall}
          onClick={() => changeReportType(ReportPages.Overall)}
        >
          <span
            className={cn(
              "flex h-full w-full items-center justify-center text-xl text-white",
              activePage === ReportPages.Overall && "rounded-sm bg-white text-blue-500",
            )}
          >
            Overall
          </span>
        </Button>
        <Button
          variant="empty"
          className="w-45 p-px disabled:opacity-100"
          disabled={activePage === ReportPages.Chart}
          onClick={() => changeReportType(ReportPages.Chart)}
        >
          <span
            className={cn(
              "flex h-full w-full items-center justify-center text-xl text-white",
              activePage === ReportPages.Chart && "rounded-sm bg-white text-blue-500",
            )}
          >
            Chart
          </span>
        </Button>
        {wip && (
          <Button
            variant="empty"
            className="w-45 p-px disabled:opacity-100"
            disabled={activePage === ReportPages.Details}
            onClick={() => changeReportType(ReportPages.Details)}
          >
            <span
              className={cn(
                "flex h-full w-full items-center justify-center text-xl text-white",
                activePage === ReportPages.Details && "rounded-sm bg-white text-blue-500",
              )}
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
