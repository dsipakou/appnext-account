import * as React from 'react'
import { startOfWeek, endOfWeek, getWeekOfMonth, format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { addDays, subDays } from 'date-fns'

interface Types {
  date: Date,
  setWeekDate: (date: Date) => void
}

const WeekCalendar: React.FC<Types> = ({ date: weekDate, setWeekDate }) => {
  const range: DateRange = {
    from: startOfWeek(weekDate, { weekStartsOn: 1 }),
    to: endOfWeek(weekDate, { weekStartsOn: 1 })
  }

  const setWeekDateProxy = (date: Date | undefined) => {
    if (date) {
      setWeekDate(date)
    }
  }

  return (
    <div className="flex flex-row h-full items-center">
      <Button
        variant="ghost"
        onClick={() => setWeekDate(subDays(weekDate, 7))}
      >
        <div className="text-lg">&#8592;</div>
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-[280px] justify-start hover:bg-white border-2 h-12 text-left font-normal" ${weekDate && 'text-muted-foreground'}`}>
            <CalendarDays className="mr-2 h-6 w-6" />
            {weekDate ? `Week ${getWeekOfMonth(weekDate, {weekStartsOn: 1})} of ${format(weekDate, "MMM, yyyy")}` : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="h-full w-full p-0">
          <Calendar
            mode="single"
            selected={range}
            onSelect={setWeekDateProxy}
            showWeekNumber
            ISOWeek
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Button
        variant="ghost"
        onClick={() => setWeekDate(addDays(weekDate, 7))}
      >
        <div className="text-lg">&#8594;</div>
      </Button>
    </div>
  );
}

export default WeekCalendar;
