import React from 'react'
import axios from 'axios'
import { useSWRConfig } from 'swr'
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material'
import { CalendarPicker } from '@mui/x-date-pickers/CalendarPicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useTransaction } from '@/hooks/transactions'
import { useAccounts } from '@/hooks/accounts'
import { useBudgetWeek } from '@/hooks/budget'
import { useCategories } from '@/hooks/categories'
import { useCurrencies } from '@/hooks/currencies'
import { useAvailableRates } from '@/hooks/rates'
import { AccountResponse } from '@/components/accounts/types'
import { WeekBudgetItem } from '@/components/budget/types'
import { Category, CategoryType } from '@/components/categories/types'
import { parseDate, getStartOfWeek, getEndOfWeek, getFormattedDate } from '@/utils/dateUtils'

interface Types {
  uuid: string,
  open: boolean,
  url: string,
  handleClose: () => void,
}

const EditForm: React.FC<Types> = ({ uuid, open, url, handleClose }) => {
  const { mutate } = useSWRConfig()
  const [errors, setErrors] = React.useState<string[]>([])
  const [amount, setAmount] = React.useState<number>('')
  const [accountUuid, setAccountUuid] = React.useState<string>('')
  const [budgetUuid, setBudgetUuid] = React.useState<string>('')
  const [currencyUuid, setCurrencyUuid] = React.useState<string>('')
  const [categoryUuid, setCategoryUuid] = React.useState<string>('')
  const [transactionDate, setTransactionDate] = React.useState<Date>(new Date())
  const [weekStart, setWeekStart] = React.useState<string>(getStartOfWeek(transactionDate))
  const [weekEnd, setWeekEnd] = React.useState<string>(getEndOfWeek(transactionDate))
  const [filteredBudgets, setFilteredBudgets] = React.useState<WeekBudgetItem[]>([])

  const { data: transaction } = useTransaction(uuid)

  const {
    data: accounts = []
  } = useAccounts()

  const {
    data: budgets = []
  } = useBudgetWeek(weekStart, weekEnd)

  const {
    data: categories = []
  } = useCategories()

  const {
    data: currencies,
    isLoading: isCurrenciesLoading
  } = useCurrencies()

  const {
    data: availableRates = {}
  } = useAvailableRates(getFormattedDate(transactionDate))

  const parents = categories.filter(
    (category: Category) => (
      category.parent === null && category.type === CategoryType.Expense
    )
  )

  const getChildren = (uuid: string): Category[] => {
    return categories.filter(
      (item: Category) => item.parent === uuid
    ) || []
  }

  React.useEffect(() => {
    if (!transaction) return

    setAmount(transaction.amount)
    setAccountUuid(transaction.account)
    setBudgetUuid(transaction.budget)
    setCategoryUuid(transaction.category)
    setCurrencyUuid(transaction.currency)
    setTransactionDate(parseDate(transaction.transactionDate))
  }, [transaction])

  React.useEffect(() => {
    if (!transactionDate) return

    setWeekStart(getStartOfWeek(transactionDate))
    setWeekEnd(getEndOfWeek(transactionDate))
  }, [transactionDate])

  React.useEffect(() => {
    if (!accountUuid || !budgets) return

    const account = accounts.find((item: WeekBudgetItem) => item.uuid === accountUuid)
    setFilteredBudgets(budgets.filter((item: WeekBudgetItem) => item.user === account.user))
  }, [accountUuid, budgets])

  const handleAmountInput = (e: ChangeEvent) => {
    setAmount(e.target.value)
  }

  const handleAccountChange = (e: ChangeEvent) => {
    setAccountUuid(e.target.value)
  }

  const handleTransactionDateChange = (e: ChangeEvent) => {
    setTransactionDate(e.target.value)
  }

  const handleBudgetChange = (e: ChangeEvent) => {
    setBudgetUuid(e.target.value)
  }

  const handleCategoryChange = (e): void => {
    setCategoryUuid(e.target.value)
  }

  const handleCurrencyChange = (e): void => {
    setCurrencyUuid(e.target.value)
  }

  const handleSave = (): void => {
    const payload = {
      account: accountUuid,
      amount,
      budget: budgetUuid,
      category: categoryUuid,
      currency: currencyUuid,
      transactionDate: getFormattedDate(transactionDate)
    }

    axios.patch(`transactions/${uuid}/`, payload).then(
      res => {
        if (res.status === 200) {
          mutate(url)
        }
      }
    ).catch(
      (error) => {
        console.log(`cannot update: ${error}`)
      }
    )

  }

  return (
    <Dialog maxWidth="md" fullWidth={true} open={open} onClose={handleClose}>
      <DialogTitle>Update transaction</DialogTitle>
      <DialogContent>
        <div className="grid grid-cols-3 gap-3">
          {errors.map((message: string) => (
            <Typography key={message} color="red">{message}</Typography>
          ))}
        </div>
        <div className="grid grid-cols-6 gap-3">
          <div className="col-span-2">
            <div className="flex flex-col gap-3">
              <div>
                <TextField
                  margin="dense"
                  id="amount"
                  label="Amount"
                  placeholder="0.00"
                  type="text"
                  fullWidth
                  autoFocus
                  value={amount}
                  onChange={handleAmountInput}
                />
              </div>
              <div>
                <FormControl fullWidth>
                  <InputLabel id="currency-select-label">Currency</InputLabel>
                  <Select
                    labelId="currency-select-label"
                    fullWidth
                    value={currencyUuid}
                    onChange={handleCurrencyChange}
                  >
                    {currencies && currencies.map((item: Currency) => (
                      !!availableRates[item.code]
                        ? <MenuItem
                          key={item.uuid}
                          value={item.uuid}
                        >
                          {item.verbalName}
                        </MenuItem>
                        : <MenuItem
                          key={item.uuid}
                          value={item.uuid}
                          disabled
                        >
                          {item.verbalName}
                        </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div>
                <FormControl fullWidth>
                  <InputLabel id="category-select-label">Category</InputLabel>
                  <Select
                    labelId="category-select-label"
                    label="Category"
                    fullWidth
                    value={categoryUuid}
                    onChange={handleCategoryChange}
                  >
                    {parents.map((item: Category) => {
                      return getChildren(item.uuid).map((subitem: Category) => (
                        <MenuItem key={subitem.uuid} value={subitem.uuid}>{item.name} - {subitem.name}</MenuItem>
                      ))
                    }
                    )}
                  </Select>
                </FormControl>
              </div>
              <div>
                <FormControl fullWidth>
                  <InputLabel id="budget-select-label">Budget</InputLabel>
                  {
                    <Select
                      labelId="budget-select-label"
                      label="Budget"
                      fullWidth
                      value={
                        filteredBudgets.find((item: WeekBudgetItem) => item.uuid === budgetUuid)
                          ? budgetUuid
                          : ""
                      }
                      onChange={handleBudgetChange}
                    >
                      {
                        filteredBudgets.map((item: WeekBudgetItem) => (
                          <MenuItem key={item.uuid} value={item.uuid}>{item.title}</MenuItem>
                        ))
                      }
                    </Select>
                  }
                </FormControl>
              </div>
              <div>
                <FormControl fullWidth>
                  <InputLabel id="account-select-label">Account</InputLabel>
                  <Select
                    labelId="account-select-label"
                    label="Account"
                    fullWidth
                    value={accountUuid}
                    onChange={handleAccountChange}
                  >
                    {
                      accounts.map((item: AccountResponse) => (
                        <MenuItem key={item.uuid} value={item.uuid}>{item.title}</MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
              </div>
            </div>
          </div>
          <div className="col-span-4">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <CalendarPicker date={transactionDate} onChange={(newDate) => setTransactionDate(newDate)} />
            </LocalizationProvider>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditForm
