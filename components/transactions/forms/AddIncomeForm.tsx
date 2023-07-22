import React from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
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
  Typography,
} from '@mui/material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { StaticDatePicker } from '@mui/x-date-pickers'
import { getFormattedDate } from '@/utils/dateUtils'
import { useRatesOnDate } from '@/hooks/rates'
import { useAvailableRates } from '@/hooks/rates'
import { useAccounts } from '@/hooks/accounts'
import { useCurrencies } from '@/hooks/currencies'
import { useCategories } from '@/hooks/categories'
import { useUsers } from '@/hooks/users'
import { Currency } from '@/components/currencies/types'
import { Category } from '@/components/categories/types'
import { Account } from '@/components/accounts/types'
import { User } from '@/components/users/types'

interface Types {
  open: boolean,
  handleClose: () => void,
}

const AddIncomeForm: React.FC<Types> = ({ open, handleClose }) => {
  const [selectedDate, setSelectedDate] = React.useState<string>(getFormattedDate(new Date()))
  const [currency, setCurrency] = React.useState<string>('')
  const [category, setCategory] = React.useState<string>('')
  const [amount, setAmount] = React.useState<string>('')
  const [description, setDescription] = React.useState<string>('')
  const [errors, setErrors] = React.useState<string[]>([])

  const { data: ratesOnDate, isLoading, url } = useRatesOnDate(selectedDate)

  const { data: categories = [] } = useCategories()
  const { data: accounts = [] } = useAccounts()
  const incomeCategories: Category[] = categories.filter((item: Category) => item.type === 'INC')

  const { data: currencies = [] } = useCurrencies()

  const { data: availableRates = {} } = useAvailableRates(selectedDate)
  const { data: { user: authUser }} = useSession()
  const { data: users = [] } = useUsers()

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

  const handleDescription = (e) => {
    setDescription(e.target.value)
  }

  const handleSave = () => {
    setErrors([])
    const targetAccount = accounts.find((item: Account) => item.category === category)?.uuid
    const user = users.find((item: User) => item.username === authUser.username)?.uuid

    const payload = {
      account: targetAccount,
      amount,
      currency,
      description,
      transactionDate: selectedDate,
      category,
      user,
    }

    axios.post('transactions/', {
      ...payload,
    }).then(
      res => {
        if (res.status === 201) {
          console.log('All good')
          // TODO: mutate transactions
          // mutate(url)
        }
      }
    ).catch(
      (error) => {
        const errRes = error.response.data
        const errorList = []
        for (const prop in errRes) {
          errorList.push(prop)
        }
        setErrors(errorList)
      }
    ).finally(() => {
      // TODO: stop loading
    })
    console.log(payload)
  }

  return (
    <Dialog maxWidth="sm" fullWidth open={open} onClose={handleClose}>
      <DialogTitle>Add your income</DialogTitle>
      <DialogContent>
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-5">
            {errors.map((message: string) => (
              <Typography key={message} color="red">{message}</Typography>
            ))}
          </div>
          <div className="flex flex-col gap-3 col-span-2">
            <div className="flex w-full">
              <FormControl fullWidth>
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
                <InputLabel id="account-label">Source</InputLabel>
                <Select
                  labelId="account-label"
                  label="Source"
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
                  onChange={handleCurrency}
                >
                  {currencies.map((item: Currency) => (
                    !!availableRates[item.code]
                      ? <MenuItem
                        key={item.uuid}
                        value={item.uuid}
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
            <div>
              <TextField
                margin="dense"
                id="description"
                label="Description"
                value={description}
                placeholder="Description"
                multiline
                rows={2}
                fullWidth
                autoFocus
                onChange={handleDescription}
              />
            </div>
          </div>
          <div className="col-span-3">
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
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddIncomeForm
