import * as React from 'react';
import {
  startOfWeek,
  endOfWeek,
  isAfter,
  isBefore,
  isSameDay,
} from 'date-fns';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';

interface CustomPickerDayProps extends PickersDayProps<Date> {
  dayIsBetween: boolean;
  isFirstDay: boolean;
  isLastDay: boolean;
}

const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) =>
    prop !== 'dayIsBetween' && prop !== 'isFirstDay' && prop !== 'isLastDay',
})<CustomPickerDayProps>(({ theme, dayIsBetween, isFirstDay, isLastDay }) => ({
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

const WeekCalendar = () => {
  const [value, setValue] = React.useState<Date | null>(new Date());

  const renderWeekPickerDay = (
    date: Date,
    selectedDates: Array<Date | null>,
    pickersDayProps: PickersDayProps<Date>,
  ) => {
    if (!value) {
      return <PickersDay {...pickersDayProps} />;
    }

    const start = startOfWeek(value);
    const end = endOfWeek(value);

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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label="Week budget"
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
        }}
        disableMaskedInput
        renderDay={renderWeekPickerDay}
        renderInput={(params) => <TextField fullWidth {...params} />}
        inputFormat="'Week of' MMM d"
      />
    </LocalizationProvider>
  );
}

export default WeekCalendar;
