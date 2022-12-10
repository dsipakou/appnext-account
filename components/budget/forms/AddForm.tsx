import { FC, useEffect, useState } from 'react'
import axios from 'axios'
import { useSWRConfig } from 'swr';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { CalendarPicker } from '@mui/x-date-pickers/CalendarPicker';
import { useUsers } from '@/hooks/users'
import { useCategories } from '@/hooks/categories'
import { useCurrencies } from '@/hooks/currencies'
import { User } from '@/components/users/types'
import { CategoryResponse } from '@/hooks/categories'
import { RecurrentTypes } from '@/components/budget/types'
import { Category, CategoryType } from '@/components/categories/types'
import { Currency } from '@/components/currencies/types'
import { useAuth } from '@/context/auth'
import { getFormattedDate } from '@/utils/dateUtils'
import { BudgetRequest } from '../../types'

interface Types {
  open: boolean
  handleClose: () => void
  monthUrl: string
  weekUrl: string
}

const AddForm: FC<Types> = ({ open, handleClose, monthUrl, weekUrl }) => {
  const { mutate } = useSWRConfig()
  const [title, setTitle] = useState<string>('')
  const [user, setUser] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [repeatType, setRepeatType] = useState<RecurrentTypes | ''>('')
  const [parentList, setParentList] = useState<Category[]>([]);
  const [amount, setAmount] = useState<string>('')
  const [currency, setCurrency] = useState<string>('')
  const [budgetDate, setBudgetDate] = useState<Date>(new Date())
  const [description, setDescription] = useState<string>('')
  const [errors, setErrors] = useState<string[]>([]);

  const { user: authUser, isLoading: isAuthLoading } = useAuth()

  const {
    data: users,
    isLoading: isUsersLoading
  } = useUsers()

  const {
    data: categories,
    isLoading: isCategoriesLoading
  } = useCategories()

  const {
    data: currencies,
    isLoading: isCurrenciesLoading
  } = useCurrencies()

  useEffect(() => {
    if (isCategoriesLoading) return;

    const parents = categories.filter(
      (category: Category) => (
        category.parent === null && category.type === CategoryType.Expense
      )
    );
    setParentList(parents);

    return () => setErrors([]);
  }, [isCategoriesLoading, categories]);

  useEffect(() => {
    if (isCurrenciesLoading) return

    setCurrency(currencies.find((item: Currency) => item.isDefault)!.uuid) 
  }, [isCurrenciesLoading, currencies])

  useEffect(() => {
    if (!authUser || !users) return

    const _user = users.find((item: User) => item.username === authUser.username)
    setUser(_user.uuid)
  }, [authUser, users])


  const getCurrencySign = (uuid: string): string => {
    return currencies.find((item: Currency) => item.uuid === currency)?.sign
  }

  const handleTitleInput = (e) => {
    setTitle(e.target.value)
  }

  const handleUserChange = (e: ChangeEvent) => {
    setUser(e.target.value)
  }

  const handleCategoryChange = (e: ChangeEvent) => {
    setCategory(e.target.value)
  }

  const handleRepeatTypeChange = (e) => {
    setRepeatType(e.target.value)
  }

  const handleAmountInput = (e) => {
    setAmount(e.target.value)
  }

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value)
  }
  
  const handleDescriptionInput = (e) => {
    setDescription(e.target.value)
  }

  const handleSave = () => {
    setErrors([])
    const payload: BudgetRequest = {
      title,
      amount,
      currency,
      user,
      category,
      recurrent: repeatType,
      budgetDate: getFormattedDate(budgetDate),
      description
    }
    axios.post('budget/', {
      ...payload,
    }).then(
      res => {
        if (res.status === 201) {
          mutate(monthUrl)
          mutate(weekUrl)
          // TODO: mutate week and month
          handleClose();
        } else {
          // TODO: handle errors
        }
      }
    ).catch(
      (error) => {
        const errRes = error.response.data;
        for (const prop in errRes) {
          setErrors(errRes[prop]);
        }
      }
    ).finally(() => {
      // TODO: stop loading
    })
  }

  return (
    <Dialog maxWidth="sm" fullWidth={true} open={open} onClose={handleClose}>
      <DialogTitle>Add budget</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={8}>
            <TextField
              margin="dense"
              id="title"
              label="Title"
              placeholder="Budget name"
              type="text"
              fullWidth
              autoFocus
              onChange={handleTitleInput}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              margin="dense"
              id="amount"
              label="Amount"
              type="text"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">{!isCurrenciesLoading && getCurrencySign(currency.uuid)}</InputAdornment>
              }}
              onChange={handleAmountInput}
            />
          </Grid>
          <Grid item xs={5}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="currency-select-label">Currency</InputLabel>
                  <Select
                    labelId="curreny-select-label"
                    label="Currecny"
                    fullWidth
                    value={currency}
                    onChange={handleCurrencyChange}
                  >
                    { currencies && currencies.map((item: Currency) => (
                      <MenuItem key={item.uuid} value={item.uuid}>{item.verbalName}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="user-select-label">User</InputLabel>
                  <Select
                    labelId="user-select-label" label="User"
                    fullWidth
                    value={user}
                    onChange={handleUserChange}
                  >
                    { users && users.map((item: User) => (
                      <MenuItem key={item.uuid} value={item.uuid}>{item.username}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="category-select-label">Category</InputLabel>
                  <Select
                    labelId="category-select-label"
                    label="Category"
                    fullWidth
                    value={category}
                    onChange={handleCategoryChange}
                  >
                    { parentList.map((item: Category) => (
                        <MenuItem key={item.uuid} value={item.uuid}>{item.name}</MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <ToggleButtonGroup
                  value={repeatType}
                  exclusive
                  onChange={handleRepeatTypeChange}
                  aria-label="text alignment"
                >
                  <ToggleButton value="" aria-label="left aligned">
                    Once
                  </ToggleButton>
                  <ToggleButton value="weekly" aria-label="centered">
                    Weekly
                  </ToggleButton>
                  <ToggleButton value="monthly" aria-label="right aligned">
                    Monthly
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={7}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <CalendarPicker date={budgetDate} onChange={(newDate) => setBudgetDate(newDate)} />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12}>
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
              onChange={handleDescriptionInput}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddForm
