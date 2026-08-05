import { addMonths, endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { useSession } from 'next-auth/react';
import React from 'react';

import { useStore } from '@/app/store';
import { TransactionsReportResponse } from '@/components/transactions/types';
import * as Tbl from '@/components/ui/table';
import { useTransactionsReport } from '@/hooks/transactions';
import { getFormattedDate, parseAndFormatDate, REPORT_FORMAT, SHORT_YEAR_MONTH_FORMAT } from '@/utils/dateUtils';

import RangeSwitcher from './RangeSwitcher';

const ReportOverall: React.FC = () => {
  const [date, setDate] = React.useState<Date>(new Date());
  const {
    data: { user: authUser },
  } = useSession();

  const dateFrom = getFormattedDate(startOfMonth(subMonths(date, 11)));
  const dateTo = getFormattedDate(endOfMonth(date));

  const { data: reportResponse = [] } = authUser?.currency
    ? useTransactionsReport(dateFrom, dateTo, authUser?.currency)
    : { data: [] };

  const currencySign = useStore((state) => state.currency.sign);

  const dates = [...new Set(reportResponse.map((item: TransactionsReportResponse) => item.month))].sort();

  const days: number[] = Array(31)
    .fill(0)
    .map((_, index: number) => index + 1);
  const rows = [];
  days.forEach((day: number, index: number) => {
    const eachMonthValues: Record<string, number> = {};
    dates.forEach((date: string, innerIndex: number) => {
      eachMonthValues[`month${innerIndex + 1}`] =
        reportResponse.find((item: TransactionsReportResponse) => item.month === date && item.day === day)
          ?.groupedAmount || 0;
    });
    const row = {
      id: index + 1,
      day: index + 1,
      ...eachMonthValues,
    };
    rows.push(row);
  });

  const aggregatedRows = [rows[0]];
  rows.forEach((row, index: number) => {
    if (index === 0) {
      return;
    }
    const aggRow: Record<string, number> = { id: row.id, day: row.day };
    for (let i = 1; i <= dates.length; i += 1) {
      aggRow[`month${i}`] = aggregatedRows[index - 1][`month${i}`] + rows[index][`month${i}`];
    }
    aggregatedRows.push(aggRow);
  });

  const clickBack = (): void => {
    setDate((oldDate) => subMonths(oldDate, 1));
  };

  const clickForward = (): void => {
    setDate((oldDate) => addMonths(oldDate, 1));
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <RangeSwitcher dateFrom={dateFrom} dateTo={dateTo} clickBack={clickBack} clickForward={clickForward} />
      <div className="h-[80vh] w-full overflow-auto rounded-md bg-white drop-shadow-sm">
        <Tbl.Table className="min-w-max">
          <Tbl.TableHeader className="sticky top-0 z-10 bg-slate-100">
            <Tbl.TableRow>
              <Tbl.TableHead className="w-14 bg-slate-100" />
              {dates.map((month) => (
                <Tbl.TableHead key={month} className="min-w-32 bg-slate-100 text-center">
                  {parseAndFormatDate(month, SHORT_YEAR_MONTH_FORMAT, REPORT_FORMAT)}
                </Tbl.TableHead>
              ))}
            </Tbl.TableRow>
          </Tbl.TableHeader>
          <Tbl.TableBody>
            {aggregatedRows.map((row) => (
              <Tbl.TableRow
                key={row.id}
                className={row.id === new Date().getDate() ? 'bg-slate-300 text-slate-800' : undefined}
              >
                <Tbl.TableCell className="font-semibold">{row.day}</Tbl.TableCell>
                {dates.map((month, index) => (
                  <Tbl.TableCell key={month} className="text-center">
                    <span className="text-normal rounded-md border border-slate-200 bg-white px-1">
                      {row[`month${index + 1}`].toFixed(2)} {currencySign}
                    </span>
                  </Tbl.TableCell>
                ))}
              </Tbl.TableRow>
            ))}
          </Tbl.TableBody>
        </Tbl.Table>
      </div>
    </div>
  );
};

export default ReportOverall;
