import { FC, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Grid,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers';
import { useRatesOnDate } from '@/hooks/rates';
import { getFormattedDate } from '@/utils/dateUtils';
import { RateResponse } from '@/hooks/rates';
import { Currency } from '../types';

interface Types {
  open: boolean
  handleClose: () => void
  currencies: Currency[]
}

interface RatesMap {
  [key: string]: number
}

const AddRatesForm: FC<Types> = ({ open, handleClose, currencies = [] }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date);
  const { data: ratesOnDate, isLoading, isError } = useRatesOnDate(getFormattedDate(selectedDate));

  useEffect(() => {
    if (!ratesOnDate) return;
  }, [ratesOnDate]);

  const handleDateChange = (date: Date | null): void => {
    if (date !== null) setSelectedDate(date);
  }

  const getRate = (currency: string): number | string => {
    if (!ratesOnDate) return;
    return ratesOnDate.find(
      (item: RateResponse) => item.currency === currency
    )?.rate || '';
  }

  return (
    <Dialog maxWidth="sm" fullWidth={true} open={open} onClose={handleClose}>
      <DialogTitle>Add rates</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Stack gap={1}>
              {currencies.map((item: Currency) => (
                <Box key={item.uuid}>
                  <TextField
                    fullWidth
                    value={getRate(item.uuid)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">{item.sign}</InputAdornment>
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Grid>
          <Grid item xs={8}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <StaticDatePicker
                displayStaticWrapperAs="desktop"
                disabled={isLoading}
                openTo="day"
                value={selectedDate}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} />}
              >
              </StaticDatePicker>
            </LocalizationProvider>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button variant="contained" disabled={isLoading}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddRatesForm;
