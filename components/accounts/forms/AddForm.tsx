import * as React from 'react'
import axios from 'axios'
import { useSWRConfig } from 'swr';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  InputLabel,
  Select,
  Switch,
  TextField,
  Typography
} from '@mui/material'
import { useAuth } from '@/context/auth'
import { useUsers } from '@/hooks/users'
import { useCategories } from '@/hooks/categories'
import { Category, CategoryType } from '@/components/categories/types'
import { User } from '@/components/users/types'
import { Switch as SwitchNew } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface Types {
  open: boolean
  handleClose: () => void
}

const AddForm: React.FC<Types> = ({ open = false, handleClose }) => {
  const { mutate } = useSWRConfig()
  const [title, setTitle] = React.useState<string>('')
  const [user, setUser] = React.useState<string>('')
  const [category, setCategory] = React.useState<string>('')
  const [incomeCategories, setIncomeCategories] = React.useState<Category[]>([])
  const [isMain, setIsMain] = React.useState<boolean>(false)
  const [description, setDescription] = React.useState<string>('')
  const [errors, setErrors] = React.useState<string[]>([]);

  const { user: authUser, isLoading: isAuthLoading } = useAuth()

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

  const handleTitleInput = (e): void => {
    setTitle(e.target.value)
  }

  const handleUserChange = (e: ChangeEvent) => {
    setUser(e.target.value)
  }

  const handleCategoryChange = (e) => {
    setCategory(e.target.value)
  }

  const handleIsMainSwitch = (isMain: boolean) => {
    setIsMain(isMain)
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
    axios.post('accounts/', {
      ...payload,
    }).then(
      res => {
        if (res.status === 201) {
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
      <DialogTitle>Add category</DialogTitle>
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
              onChange={handleTitleInput}
            />
          </Grid>
          <div className="flex items-center space-x-2">
            <SwitchNew id="is-active" checked={isMain} onCheckedChange={handleIsMainSwitch} />
            <Label htmlFor="is-acitve">Active</Label>
          </div>
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

export default AddForm
