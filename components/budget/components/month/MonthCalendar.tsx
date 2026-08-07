// System
import { addMonths, endOfMonth, format, isSameMonth, startOfMonth, subMonths } from 'date-fns';
import { CalendarDays, RotateCcw } from 'lucide-react';
import React from 'react';
import { DateRange } from 'react-day-picker';

// UI
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverPopup, PopoverTrigger } from '@/components/ui/popover';

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
    <div className="flex h-full flex-row items-center">
      <Button variant="ghost" onClick={() => setMonthDate(subMonths(monthDate, 1))}>
        <span className="text-lg">&#8592;</span>
      </Button>
      <Popover>
        <div className="ring-ring/24 has-focus-visible:has-aria-invalid:border-destructive/64 has-focus-visible:has-aria-invalid:ring-destructive/16 has-aria-invalid:border-destructive/36 has-focus-visible:border-ring has-autofill:bg-foreground/4 dark:bg-input/32 dark:has-autofill:bg-foreground/8 dark:has-aria-invalid:ring-destructive/24 border-input bg-background relative inline-flex flex-1 items-center justify-between rounded-lg border text-base shadow-xs/5 transition-shadow not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] not-has-disabled:not-has-focus-visible:not-has-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)] has-focus-visible:ring-[3px] has-disabled:opacity-64 has-[:disabled,:focus-visible,[aria-invalid]]:shadow-none sm:text-sm dark:not-has-disabled:not-has-focus-visible:not-has-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/6%)]">
          <PopoverTrigger render={<Button variant="empty" />}>
            <div className="flex items-center">
              <CalendarDays className="mr-2 h-6 w-6" />
              {monthDate ? format(monthDate, 'MMM, yyyy') : <span>Pick a date</span>}
            </div>
          </PopoverTrigger>
          {!isSameMonth(monthDate, new Date()) && (
            <RotateCcw
              className="mr-2 h-4 w-4 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resetDate(e);
              }}
            />
          )}
        </div>
        <PopoverPopup className="h-full w-full p-0">
          <Calendar
            captionLayout="dropdown"
            startMonth={new Date(2020, 0)}
            endMonth={new Date(2035, 11)}
            month={month}
            onMonthChange={(month) => {
              setMonth(month);
              setMonthDate(startOfMonth(month));
            }}
            hideWeekdays
            showOutsideDays={false}
            disabled
          />
        </PopoverPopup>
      </Popover>

      <Button variant="ghost" onClick={() => setMonthDate(addMonths(monthDate, 1))}>
        <span className="text-lg">&#8594;</span>
      </Button>
    </div>
  );
};

export default MonthCalendar;
