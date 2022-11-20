import { FC, useState } from 'react';
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
import { Currency } from '../types';

interface Types {
  open: boolean
  handleClose: () => void
  currencies: Currency[]
}

const AddRatesForm: FC<Types> = ({ open, handleClose, currencies = [] }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date());

  const handleDateChange = (date: string): void => {
    setSelectedDate(date);
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
                openTo="day"
                onChange={handleDateChange}
                value={selectedDate}
                renderInput={(params) => <TextField {...params} />}
              >
              </StaticDatePicker>
            </LocalizationProvider>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddRatesForm;
