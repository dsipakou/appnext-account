import { addDays, endOfWeek, format, getWeekOfMonth, isSameWeek, startOfWeek, subDays } from 'date-fns';
import { CalendarDays, RotateCcw } from 'lucide-react';
import * as React from 'react';
import { rangeIncludesDate } from 'react-day-picker';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverPopup, PopoverTrigger } from '@/components/ui/popover';

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
    <div className="flex h-full w-full flex-row items-center">
      <Button variant="ghost" onClick={() => setWeekDate(subDays(weekDate, 7))}>
        <span className="text-lg">&#8592;</span>
      </Button>
      <Popover>
        <div className="ring-ring/24 has-focus-visible:has-aria-invalid:border-destructive/64 has-focus-visible:has-aria-invalid:ring-destructive/16 has-aria-invalid:border-destructive/36 has-focus-visible:border-ring has-autofill:bg-foreground/4 dark:bg-input/32 dark:has-autofill:bg-foreground/8 dark:has-aria-invalid:ring-destructive/24 border-input bg-background relative inline-flex flex-1 items-center justify-between rounded-lg border text-base shadow-xs/5 transition-shadow not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] not-has-disabled:not-has-focus-visible:not-has-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)] has-focus-visible:ring-[3px] has-disabled:opacity-64 has-[:disabled,:focus-visible,[aria-invalid]]:shadow-none sm:text-sm dark:not-has-disabled:not-has-focus-visible:not-has-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/6%)]">
          <PopoverTrigger render={<Button variant="empty" />}>
            <div className="flex items-center">
              <CalendarDays className="mr-2 h-6 w-6" />
              {weekDate ? (
                `Week ${getWeekOfMonth(weekDate)} of ${format(weekDate, 'MMM, yyyy')}`
              ) : (
                <span>Pick a date</span>
              )}
            </div>
          </PopoverTrigger>
          {!isSameWeek(weekDate, new Date()) && (
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
        </PopoverPopup>
      </Popover>
      <Button variant="ghost" onClick={() => setWeekDate(addDays(weekDate, 7))}>
        <span className="text-lg">&#8594;</span>
      </Button>
    </div>
  );
};

export default WeekCalendar;
