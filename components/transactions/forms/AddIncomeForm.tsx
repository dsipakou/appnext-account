import React from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { StaticDatePicker } from '@mui/x-date-pickers';
import { getFormattedDate } from '@/utils/dateUtils';
import { useRatesOnDate } from '@/hooks/rates';
import { useAvailableRates } from '@/hooks/rates'
import { useCurrencies } from '@/hooks/currencies'
import { Currency } from '@/components/currencies/types'

interface Types {
  open: boolean,
  handleClose: () => void,
}

const AddIncomeForm: React.FC<Types> = ({ open, handleClose }) => {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [selectedCurrency, setSelectedCurrency] = React.useState<string>('')

  const { data: ratesOnDate, isLoading, url } = useRatesOnDate(getFormattedDate(selectedDate))

  const { data: currencies = [] } = useCurrencies()

  const { data: availableRates = {} } = useAvailableRates(selectedDate)

  const handleDateChange = (date: Date | null): void => {
    if (date !== null) setSelectedDate(date);
  }

  return (
    <Dialog maxWidth="sm" fullWidth open={open} onClose={handleClose}>
      <DialogTitle>Add your income</DialogTitle>
      <DialogContent>
        <div className="flex w-full gap-3">
          <div className="flex flex-col gap-3">
            <div className="flex w-full">
              <FormControl>
                <TextField
                  label="Amount"
                  margin="dense"
                  fullWidth
                />
              </FormControl>
            </div>
            <div className="flex w-full">
              <FormControl fullWidth>
                <InputLabel id="account-label">To Account</InputLabel>
                <Select
                  labelId="account-label"
                  label="To Account"
                  fullWidth
                >
                </Select>
              </FormControl>
            </div>
            <div className="flex w-full">
              <FormControl fullWidth>
                <InputLabel id="currency-label">Currency</InputLabel>
                <Select
                  labelId="currency-label"
                  label="Currency"
                  fullWidth
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                >
                  {currencies.map((item: Currency) => (
                    !!availableRates[item.code]
                      ? <MenuItem
                        key={item.uuid}
                        value={item}
                      >
                        {item.sign} {item.verbalName}
                      </MenuItem>
                      : <MenuItem
                        key={item.uuid}
                        value={item}
                        disabled
                      >
                        {item.sign} {item.verbalName} (unavailable)
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
          <div>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <StaticDatePicker
                displayStaticWrapperAs="desktop"
                disabled={isLoading}
                openTo="day"
                value={selectedDate}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params}
                />}
              >
              </StaticDatePicker>
            </LocalizationProvider>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddIncomeForm
