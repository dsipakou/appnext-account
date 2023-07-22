import * as React from 'react';
import {
  startOfWeek,
  endOfWeek,
  isAfter,
  isBefore,
  isSameDay,
  getWeekOfMonth,
  format
} from 'date-fns';
import { DateRange } from 'react-day-picker'
import { CalendarDays } from 'lucide-react'
import {
  Button
} from '@/components/ui/button'
import {
  Calendar
} from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { styled } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import locale from 'date-fns/locale/ru'
import {
  addDays,
  subDays
} from 'date-fns'
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';

interface CustomPickerDayProps extends PickersDayProps<Date> {
  dayIsBetween: boolean;
  isFirstDay: boolean;
  isLastDay: boolean;
}

interface Types {
  date: Date,
  setWeekDate: () => void
}

const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) =>
    prop !== 'dayIsBetween' && prop !== 'isFirstDay' && prop !== 'isLastDay',
})<CustomPickerDayProps>(({ theme, dayIsBetween, isFirstDay, isLastDay }) => (
  {
    ...(dayIsBetween && {
      borderRadius: 0,
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      '&:hover, &:focus': {
        backgroundColor: theme.palette.primary.dark,
      },
    }),
    ...(isFirstDay && {
      borderTopLeftRadius: '30%',
      borderBottomLeftRadius: '30%',
    }),
    ...(isLastDay && {
      borderTopRightRadius: '30%',
      borderBottomRightRadius: '30%',
    }),
  })) as React.ComponentType<CustomPickerDayProps>;

const WeekCalendar: React.FC<Types> = ({ date: weekDate, setWeekDate }) => {
  const renderWeekPickerDay = (
    date: Date,
    selectedDates: Array<Date | null>,
    pickersDayProps: PickersDayProps<Date>,
  ) => {
    if (!date) {
      return <PickersDay {...pickersDayProps} />;
    }

    const start = startOfWeek(weekDate, { weekStartsOn: 1 });
    const end = endOfWeek(weekDate, { weekStartsOn: 1 });

    const isFirstDay = isSameDay(date, start);
    const isLastDay = isSameDay(date, end);
    const dayIsBetween = (
      isFirstDay ||
      isLastDay ||
      (isAfter(date, start) && isBefore(date, end))
    );

    return (
      <CustomPickersDay
        {...pickersDayProps}
        disableMargin
        dayIsBetween={dayIsBetween}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
      />
    );
  };

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
    <div className="flex flex-row h-full">
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
            className={`w-[280px] justify-start text-left font-normal" ${weekDate && 'text-muted-foreground'}`}>
            <CalendarDays className="mr-2 h-6 w-6 text-muted-foreground" />
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
