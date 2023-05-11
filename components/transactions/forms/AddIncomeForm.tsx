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
import { StaticDatePicker } from '@mui/x-date-pickers'
import { getFormattedDate } from '@/utils/dateUtils'
import { useRatesOnDate } from '@/hooks/rates'
import { useAvailableRates } from '@/hooks/rates'
import { useCurrencies } from '@/hooks/currencies'
import { useCategories } from '@/hooks/categories'
import { Currency } from '@/components/currencies/types'
import { Category } from '@/components/categories/types'

interface Types {
  open: boolean,
  handleClose: () => void,
}

const AddIncomeForm: React.FC<Types> = ({ open, handleClose }) => {
  const [selectedDate, setSelectedDate] = React.useState<string>(getFormattedDate(new Date()))
  const [currency, setCurrency] = React.useState<string>('')
  const [category, setCategory] = React.useState<string>('')
  const [amount, setAmount] = React.useState<string>('')

  const { data: ratesOnDate, isLoading, url } = useRatesOnDate(selectedDate)

  const { data: categories = [] } = useCategories()
  const incomeCategories: Category[] = categories.filter((item: Category) => item.type === 'INC')

  const { data: currencies = [] } = useCurrencies()

  const { data: availableRates = {} } = useAvailableRates(selectedDate)

  const handleDateChange = (date: Date | null): void => {
    if (date !== null) setSelectedDate(getFormattedDate(date));
    setCurrency('')
  }

  const handleAmountInput = (e) => {
    setAmount(e.target.value)
  }

  const handleCategoryChange = (e) => {
    setCategory(e.target.value)
  }

  const handleCurrency = (e) => {
    setCurrency(e.target.value)
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
                  value={amount}
                  fullWidth
                  onChange={handleAmountInput}
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
                  value={category}
                  onChange={handleCategoryChange}
                >
                  {incomeCategories.map((item: Category) => (
                    <MenuItem
                      key={item.uuid}
                      value={item.uuid}
                    >
                      {item.name}
                    </MenuItem>
                  ))}
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
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
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
