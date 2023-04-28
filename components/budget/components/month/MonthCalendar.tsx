
import React from 'react';
import {
  Button,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { add, addMonths, subMonths } from 'date-fns';

interface Types {
  date: Date,
  setMonthDate: () => void
}

const MonthCalendar: React.FC<Types> = ({ date, setMonthDate }) => {
  const maxDate = add(new Date(), { years: 2 });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="flex flex-end">
        <Button
          variant="text"
          onClick={() => setMonthDate(subMonths(date, 1))}
        >
          <Typography variant="h4">&#8592;</Typography>
        </Button>
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
        <Button
          variant="text"
          onClick={() => setMonthDate(addMonths(date, 1))}
        >
          <Typography variant="h4">&#8594;</Typography>
        </Button>
      </div>
    </LocalizationProvider>
  )
};

export default MonthCalendar;
