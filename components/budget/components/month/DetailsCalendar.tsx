import {
  addDays,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  isSameWeek,
  isWeekend,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ArrowLeft, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React from 'react';

import { MonthBudgetItem } from '@/components/budget/types';
import { useCurrencies } from '@/hooks/currencies';
import { cn } from '@/lib/utils';
import { getFormattedDate, parseDate } from '@/utils/dateUtils';

import CalendarBudgetItem from './CalendarBudgetItem';

interface Types {
  title: string;
  items: MonthBudgetItem[];
  date: string;
  handleClose: () => void;
  clickShowTransactions: (uuid: string) => void;
}

const DetailsCalendar: React.FC<Types> = ({ title, items, date, handleClose, clickShowTransactions }) => {
  const {
    data: { user },
  } = useSession();
  const { data: currencies } = useCurrencies();

  const generateWeeksForCurrentMonth = () => {
    const parsedDate = parseDate(date);
    const startOfTheSelectedMonth = startOfMonth(parsedDate);
    const endOfTheSelectedMonth = endOfMonth(parsedDate);
    const startDate = startOfWeek(startOfTheSelectedMonth);
    const endDate = endOfWeek(endOfTheSelectedMonth);

    let firstDayOfWeek = startDate;

    const allWeeks = [];

    while (firstDayOfWeek <= endDate) {
      allWeeks.push(generateDatesForCurrentWeek(firstDayOfWeek, parsedDate));
      firstDayOfWeek = addDays(firstDayOfWeek, 7);
    }

    return allWeeks;
  };

  const generateDatesForCurrentWeek = (startDate: Date, activeDate: Date) => {
    let currentDate = startDate;

    const getBudgetOnDate = (date: Date) => {
      return items.find((item: MonthBudgetItem) => item.budgetDate === getFormattedDate(date));
    };

    const week = [];
    for (let day = 0; day < 7; day++) {
      const budgetOnDate = getBudgetOnDate(currentDate);

      week.push(
        <div
          key={day}
          className={cn(
            'flex h-24 rounded-md border p-1',
            isSameMonth(currentDate, activeDate) && 'bg-gray-100',
            isWeekend(currentDate) &&
              !isSameWeek(currentDate, new Date()) &&
              isSameMonth(currentDate, activeDate) &&
              'bg-red-50',
            isSameWeek(currentDate, new Date()) && 'bg-blue-50',
            isSameDay(currentDate, new Date()) && 'border-2 border-blue-500',
          )}
        >
          <CalendarBudgetItem
            key={day}
            item={budgetOnDate}
            date={currentDate}
            currency={user.currency}
            clickShowTransactions={clickShowTransactions}
          />
        </div>,
      );
      currentDate = addDays(currentDate, 1);
    }
    return <>{week}</>;
  };

  return (
    <div className="flex flex-col gap-2 rounded-md">
      <div className="relative flex w-full flex-col py-2">
        <div className="relative flex w-full items-center justify-center py-2">
          <ArrowLeft className="absolute left-2 cursor-pointer" onClick={handleClose} />
          <span className="mr-2 text-sm font-medium text-gray-500">{title.split(' > ')[0]}</span>
          <span className="mx-1 text-gray-400">›</span>
          <span className="ml-2 text-xl font-bold text-gray-800">{title.split(' > ')[1]}</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">{generateWeeksForCurrentMonth()}</div>
    </div>
  );
};

export default DetailsCalendar;
