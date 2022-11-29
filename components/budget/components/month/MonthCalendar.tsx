
import { FC, useState } from 'react';
import {
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { add } from 'date-fns';

interface Types {
  date: Date,
  setMonthDate: () => void
}

const MonthCalendar: FC<Types> = ({ date, setMonthDate }) => {
  const maxDate = add(new Date(), { years: 2 });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        views={['year', 'month']}
        label="Month budget"
        openTo="month"
        value={date}
        maxDate={maxDate}
        onChange={(newDate: Date): void => { setMonthDate(newDate) }}
        renderInput={(params) => <TextField fullWidth {...params} />}
        inputFormat="MMMM yyyy"
      />
    </LocalizationProvider>
  )
};

export default MonthCalendar;
