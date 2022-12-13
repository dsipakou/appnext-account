import * as React from 'react'
import axios from 'axios'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography
} from '@mui/material'
import { Account, AccountResponse } from '@/components/accounts/types'
import { useAccounts } from '@/hooks/accounts'
import { useCategories } from '@/hooks/categories'
import { Category, CategoryType } from '@/components/categories/types'
import { useUsers } from '@/hooks/users'
import { useSWRConfig } from 'swr'

interface Types {
  uuid: string
  open: boolean
  handleClose: () => void
}

const EditForm: React.FC<Types> = ({ uuid, open = false, handleClose }) => {
  const { mutate } = useSWRConfig()
  const [title, setTitle] = React.useState<string>('')
  const [user, setUser] = React.useState<string>('')
  const [category, setCategory] = React.useState<string>('')
  const [incomeCategories, setIncomeCategories] = React.useState<Category[]>([])
  const [isMain, setIsMain] = React.useState<boolean>(false)
  const [description, setDescription] = React.useState<string>('')
  const [errors, setErrors] = React.useState<string[]>([]);

  const {
    data: accounts,
    isLoading: isAccountLoading
  } = useAccounts()

  const {
    data: users,
    isLoading: isUsersLoading
  } = useUsers()

  const {
    data: categories
  } = useCategories()

  React.useEffect(() => {
    if (!categories) return 

    setIncomeCategories(categories.filter((item: Category) => item.type === CategoryType.Income))
  }, [categories])

  React.useEffect(() => {
    if (!accounts || isAccountLoading) return

    const _account = accounts.find((_item: AccountResponse) => _item.uuid === uuid)!

    setTitle(_account.title)
    setUser(_account.user)
    setIsMain(_account.isMain)
    setCategory(_account.category)
    setDescription(_account.description)
  }, [accounts, isAccountLoading])

  const handleTitleInput = (e): void => {
    setTitle(e.target.value)
  }

  const handleUserChange = (e: ChangeEvent) => {
    setUser(e.target.value)
  }

  const handleCategoryChange = (e) => {
    setCategory(e.target.value)
  }

  const handleIsMainSwitch = (e) => {
    setIsMain(e.target.checked)
  }

  const handleDescriptionInput = (e) => {
    setDescription(e.target.value)
  }

  const handleSave = () => {
    setErrors([])
    const payload: BudgetRequest = {
      title,
      category,
      user,
      isMain,
      description
    }
    axios.patch(`accounts/${uuid}/`, {
      ...payload,
    }).then(
      res => {
        if (res.status === 200) {
          mutate('accounts/')
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
    <Dialog maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle>Edit cateory</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={8}>
            {errors.map((message: string) => (
              <Typography key={message} color="red">{message}</Typography>
            ))}
          </Grid>
          <Grid item xs={8}>
            <TextField
              margin="dense"
              id="title"
              label="Title"
              placeholder="Account name"
              type="text"
              fullWidth
              autoFocus
              value={title}
              onChange={handleTitleInput}
            />
          </Grid>
          <Grid item xs={4} align="center">
            <FormControlLabel control={
              <Switch checked={isMain} onChange={handleIsMainSwitch} />
            } label="Is active" />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="user-select-label">User</InputLabel>
              <Select
                labelId="user-select-label"
                label="User"
                value={user}
                onChange={handleUserChange}
              >
                { users && users.map((item: User) => (
                  <MenuItem key={item.uuid} value={item.uuid}>{item.username}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="income-category-select-label">Income category</InputLabel>
              <Select
                labelId="income-category-select-label"
                label="Income category"
                value={category}
                onChange={handleCategoryChange}
              >
                <MenuItem value="">
                  <em>
                    No income for the account
                  </em>
                </MenuItem>
                { incomeCategories.map((item: Category) => (
                  <MenuItem key={item.uuid} value={item.uuid}>{item.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditForm
