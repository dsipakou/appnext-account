// System
import * as React from 'react';
import { startOfWeek, endOfWeek, getWeekOfMonth, format, addDays, subDays, isSameWeek } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { CalendarDays } from 'lucide-react';
// UI
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// Utils
import { cn } from '@/lib/utils';

interface Types {
  date: Date;
  setWeekDate: (date: Date) => void;
}

const WeekCalendar: React.FC<Types> = ({ date: weekDate, setWeekDate }) => {
  const [month, setMonth] = React.useState<Date>(weekDate);

  const range: DateRange = {
    from: startOfWeek(weekDate),
    to: endOfWeek(weekDate),
  };

  const setWeekDateProxy = (date: Date | undefined) => {
    if (date != null) {
      setWeekDate(date);
    }
  };

  React.useEffect(() => {
    setMonth(weekDate);
  }, [weekDate]);

  const resetDate = (event) => {
    event.preventDefault();
    setWeekDate(new Date());
  };

  return (
    <div className="flex flex-row h-full items-center">
      <Button variant="ghost" onClick={() => setWeekDate(subDays(weekDate, 7))}>
        <span className="text-lg">&#8592;</span>
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[280px] justify-between hover:bg-white border-2 h-12 text-left font-normal',
              weekDate && 'text-muted-foreground'
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
            mode="single"
            month={month}
            onMonthChange={setMonth}
            selected={range}
            onSelect={(date: Date | undefined) => !(date == null) && setWeekDateProxy(date)}
            showWeekNumber
            ISOWeek
            initialFocus
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
