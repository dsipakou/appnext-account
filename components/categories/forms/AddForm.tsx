import { selectChangeEvent, ChangeEvent, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Select,
  InputLabel,
  FormControl,
  MenuItem,
  Button,
} from '@mui/material';
import { Category, CategoryType, CategoryCreateRequest } from '../types';
import { useCategories } from '../../../hooks/categories';
import { useSWRConfig } from 'swr';
import axios from 'axios';

interface Props {
  open: boolean,
  handleClose: () => void;
}

const AddForm = ({ open = false, handleClose }: Props) => {
  const { mutate } = useSWRConfig();
  const { categories, isLoading, isError } = useCategories();

  const [ isParent, setIsParent ] = useState<boolean>(false);
  const [ type, setType ] = useState<CategoryType>(CategoryType.Expense);
  const [ name, setName ] = useState<string>('');
  const [ parentList, setParentList ] = useState<Category[]>([]);
  const [ parent, setParent ] = useState<Category>('');

  useEffect(() => {
    if (isLoading) return;

    const parents = categories.filter(
      (category: Category) => category.parent === null && category.type === type,
    );
    setParentList(parents)
  }, [isLoading, categories, type]);

  const save = async () => {
    const payload: CategoryCreateRequest = {
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
        } else {
          // TODO: handle errors
        }
      }
    ).catch(
      (error) => { console.log(error) }
    ).finally(() => {console.log('stopLoading')})
  }

  const handleTypeChange = (e: SelectChangeEvent) => {
    e.preventDefault();
    setType(e.target.value);
  }

  const handleParentCheckbox = (e: ChangeEvent) => {
    // TODO: disable parent select box
    e.preventDefault();
    setIsParent(e.target.checked);
  }

  const handleParentSelect = (e: SelectChangeEvent) => {
    e.preventDefault();
    setParent(e.target.value);
  }

  const handleNameInput = (e: ChangeEvent) => {
    e.preventDefault();
    setName(e.target.value);
  }

  return (
    <Dialog maxWidth="sm" fullWidth={true} open={open} onClose={handleClose}>
      <DialogTitle>Add category</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              autoFocus
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
              <Checkbox checked={isParent} onChange={handleParentCheckbox} />
            } label="Parent category" />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="parent-select-label">Parent category</InputLabel>
              <Select
                labelId="parent-select-label"
                label="Parent category"
                value={parent}
                fullWidth
                defaultValue=""
                onChange={handleParentSelect}
              >
                { parentList.map((category: Category) => (
                  <MenuItem key={category.uuid} value={category.uuid}>{category.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={save}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddForm;
