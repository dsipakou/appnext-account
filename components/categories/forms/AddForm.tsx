import { FC } from 'react';
import { selectChangeEvent, ChangeEvent, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Select,
  InputLabel,
  FormControl,
  MenuItem,
  Button,
  Typography,
} from '@mui/material';
import { Category, CategoryType, CategoryRequest } from '../types';
import { useCategories } from '../../../hooks/categories';
import { useSWRConfig } from 'swr';
import axios from 'axios';

interface Types {
  open: boolean,
  handleClose: () => void;
}

const AddForm: FC<Types> = ({ open = false, handleClose }) => {
  const { mutate } = useSWRConfig();
  const { data: categories, isLoading, isError } = useCategories();

  const [isParent, setIsParent] = useState<boolean>(false);
  const [type, setType] = useState<CategoryType>(CategoryType.Expense);
  const [name, setName] = useState<string>('');
  const [parentList, setParentList] = useState<Category[]>([]);
  const [parent, setParent] = useState<Category>('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isLoading) return;

    const parents = categories.filter(
      (category: Category) => category.parent === null && category.type === type,
    );
    setParentList(parents);

    return () => setErrors([]);
  }, [isLoading, categories, type]);

  const handleSave = async () => {
    setErrors([]);
    const payload: CategoryRequest = {
      name,
      type,
      parent,
    };
    axios.post('categories/', {
      ...payload,
    }).then(
      res => {
        if (res.status === 201) {
          mutate('categories/');
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
    ).finally(() => { console.log('stopLoading') })
  }

  const handleTypeChange = (e: SelectChangeEvent) => {
    setType(e.target.value);
  }

  const handleParentSwitch = (e: ChangeEvent) => {
    // TODO: disable parent select box
    setIsParent(e.target.checked);
    setParent('');
  }

  const handleParentSelect = (e: SelectChangeEvent) => {
    setParent(e.target.value);
  }

  const handleNameInput = (e: ChangeEvent) => {
    setName(e.target.value);
  }

  return (
    <Dialog maxWidth="sm" fullWidth={true} open={open} onClose={handleClose}>
      <DialogTitle>Add category</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {errors.map((message: string) => (
              <Typography key={message} color="red">{message}</Typography>
            ))}
          </Grid>
          <Grid item xs={12}>
            <TextField
              autoFocus={true}
              margin="dense"
              id="name"
              label="Category name"
              type="text"
              fullWidth
              onChange={handleNameInput}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="type-select-label">Type</InputLabel>
              <Select
                labelId="type-select-label"
                label="Type"
                fullWidth
                value={type}
                onChange={handleTypeChange}
              >
                <MenuItem value={CategoryType.Income}>Income</MenuItem>
                <MenuItem value={CategoryType.Expense}>Expense</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel control={
              <Switch checked={isParent} onChange={handleParentSwitch} />
            } label="This is parent category" />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth disabled={isParent}>
              <InputLabel id="parent-select-label">Parent category</InputLabel>
              <Select
                labelId="parent-select-label"
                label="Parent category"
                value={parent}
                fullWidth
                defaultValue=""
                onChange={handleParentSelect}
              >
                {parentList.map((category: Category) => (
                  <MenuItem key={category.uuid} value={category.uuid}>{category.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
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

export default AddForm;
