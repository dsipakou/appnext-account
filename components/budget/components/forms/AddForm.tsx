import { FC, useEffect, useState } from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Grid,
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
import { User } from '@/components/users/types'
import { CategoryResponse } from '@/hooks/categories'
import { RecurrentTypes } from '@/components/budget/types'
import { Category, CategoryType } from '@/components/categories/types'

interface Types {
  open: boolean,
  handleClose: () => void;
}

const AddForm: FC<Types> = ({ open, handleClose }) => {
  const [title, setTitle] = useState<string>('')
  const [user, setUser] = useState<User>('')
  const [category, setCategory] = useState<CategoryResponse>('')
  const [repeatType, setRepeatType] = useState<RecurrentTypes>('')
  const [parentList, setParentList] = useState<Category[]>([]);
  const [amount, setAmount] = useState<string>('')
  const [currency, setCurrency] = useState<string>('')
  const [budgetDate, setBudgetDate] = useState<Date>(new Date())
  const [errors, setErrors] = useState<string[]>([]);

  const {
    data: users,
    isLoading: isUsersLoading
  } = useUsers()
  const {
    data: categories,
    isLoading: isCategoriesLoading
  } = useCategories()

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
    setCurrencyType(e.target.value)
  }

  const handleSave = () => {
      
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
              placeholder="How much"
              type="text"
              fullWidth
              autoFocus
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
                    <MenuItem value="">Do not repeat</MenuItem>
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
