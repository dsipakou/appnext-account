
import { FC, useState } from 'react';
import {
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { add } from 'date-fns';

const MonthCalendar: FC = () => {
  const [date, setDate] = useState<Date>(new Date());

  const maxDate = add(new Date(), { years: 2 });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        views={['year', 'month']}
        label="Month budget"
        openTo="month"
        date={date}
        maxDate={maxDate}
        onChange={(newDate: Date): void => { setDate(newDate) }}
        renderInput={(params) => <TextField fullWidth {...params} />}
      />
    </LocalizationProvider>
  )
};

export default MonthCalendar;
