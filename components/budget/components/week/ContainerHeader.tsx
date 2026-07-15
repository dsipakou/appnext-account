import { isThisWeek, isToday } from 'date-fns';
import React from 'react';

import { cn } from '@/lib/utils';
import {
  getFormattedDate,
  getWeekDaysWithFullDays,
  MONTH_DAY_FORMAT,
  parseDate,
  WeekDayWithFullDate,
} from '@/utils/dateUtils';

interface HeaderTypes {
  date: string;
}

interface HeaderItemTypes {
  date: WeekDayWithFullDate;
  isWeekend: boolean;
  isToday: boolean;
}

const Header: React.FC<HeaderTypes> = ({ date }) => {
  const daysShortFormatArray: WeekDayWithFullDate[] = getWeekDaysWithFullDays(parseDate(date));

  return (
    <div className={cn('mb-3 grid grid-cols-7 gap-2', isThisWeek(daysShortFormatArray[0].fullDate) && 'grid-cols-8')}>
      {daysShortFormatArray.map((item: WeekDayWithFullDate, index: number) => (
        <div key={index} className={cn(isToday(item.fullDate) && 'col-span-2')}>
          <div key={index}>
            <HeaderItem date={item} isWeekend={index > 4} isToday={isToday(item.fullDate)} />
          </div>
        </div>
      ))}
    </div>
  );
};

const HeaderItem: React.FC<HeaderItemTypes> = ({ date, isWeekend, isToday }) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center',
        isWeekend && 'text-red-500',
        isToday && 'rounded-md bg-sky-500 font-bold text-white',
      )}
    >
      <span className="flex justify-center align-middle text-2xl">{date.shortDayName}</span>
      <div className="flex h-full items-center justify-center gap-1 text-sm">
        <span>{getFormattedDate(date.fullDate, MONTH_DAY_FORMAT)}</span>
        {isToday && <span>(today)</span>}
      </div>
    </div>
  );
};

export default Header;
