// System
import React from 'react';
import { CalendarDays } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { isSameMonth, format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
// UI
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
// Utils
import { cn } from '@/lib/utils';

interface Types {
  date: Date;
  setMonthDate: (date: Date) => void;
}

const MonthCalendar: React.FC<Types> = ({ date: monthDate, setMonthDate }) => {
  const [month, setMonth] = React.useState<Date>(monthDate);

  React.useEffect(() => {
    setMonth(monthDate);
  }, [monthDate]);

  const range: DateRange = {
    from: startOfMonth(monthDate),
    to: endOfMonth(monthDate),
  };

  const resetDate = (event) => {
    event.preventDefault();
    setMonthDate(new Date());
  };

  return (
    <div className="flex flex-row h-full items-center">
      <Button variant="ghost" onClick={() => setMonthDate(subMonths(monthDate, 1))}>
        <span className="text-lg">&#8592;</span>
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'flex justify-between w-[280px] hover:bg-white border-2 h-12 text-left font-normal',
              monthDate && 'text-muted-foreground'
            )}
          >
            <div className="flex items-center">
              <CalendarDays className="mr-2 h-6 w-6" />
              {monthDate ? format(monthDate, 'MMM, yyyy') : <span>Pick a date</span>}
            </div>
            {!isSameMonth(monthDate, new Date()) && (
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
            onSelect={(date: Date | undefined) => !(date == null) && setMonthDate(date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Button variant="ghost" onClick={() => setMonthDate(addMonths(monthDate, 1))}>
        <span className="text-lg">&#8594;</span>
      </Button>
    </div>
  );
};

export default MonthCalendar;
