import { addDays, endOfWeek, format, getWeekOfMonth, isSameWeek, startOfWeek, subDays } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import * as React from 'react';
import { rangeIncludesDate } from 'react-day-picker';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Types {
  date: Date;
  setWeekDate: (date: Date) => void;
}

const WeekCalendar: React.FC<Types> = ({ date: weekDate, setWeekDate }) => {
  const [month, setMonth] = React.useState(weekDate);

  const resetDate = (event: React.MouseEvent) => {
    event.preventDefault();
    setWeekDate(new Date());
  };

  const selectedWeek: DateRange = {
    from: startOfWeek(weekDate, { weekStartsOn: 1 }),
    to: endOfWeek(weekDate, { weekStartsOn: 1 }),
  };

  React.useEffect(() => {
    setMonth(weekDate);
  }, [weekDate]);

  return (
    <div className="flex h-full flex-row items-center">
      <Button variant="ghost" onClick={() => setWeekDate(subDays(weekDate, 7))}>
        <span className="text-lg">&#8592;</span>
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-70 h-12 justify-between border-2 text-left font-normal hover:bg-white',
              weekDate && 'text-muted-foreground',
            )}
          >
            <div className="flex items-center">
              <CalendarDays className="mr-2 h-6 w-6" />
              {weekDate ? (
                `Week ${getWeekOfMonth(weekDate)} of ${format(weekDate, 'MMM, yyyy')}`
              ) : (
                <span>Pick a date</span>
              )}
            </div>
            {!isSameWeek(weekDate, new Date()) && (
              <Button variant="link" size="xs" className="px-2 py-1" onClick={resetDate}>
                Reset
              </Button>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="h-full w-full p-0">
          <Calendar
            month={month}
            onMonthChange={setMonth}

            modifiers={{
              selected: selectedWeek,
              range_start: selectedWeek.from,
              range_end: selectedWeek.to,
              range_middle: (date) => rangeIncludesDate(selectedWeek, date, true),
            }}
            onDayClick={(day, modifiers) => {
              if (modifiers.disabled || modifiers.hidden) return;

              setWeekDate(day);
            }}
            showWeekNumber
            ISOWeek
          />
        </PopoverContent>
      </Popover>
      <Button variant="ghost" onClick={() => setWeekDate(addDays(weekDate, 7))}>
        <span className="text-lg">&#8594;</span>
      </Button>
    </div>
  );
};

export default WeekCalendar;
