import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { useCategories } from '../../../hooks/categories';

interface Props {
  uuid: string,
  open: boolean,
  handleClose: () => void,
}

const EditForm = ({ uuid, open = false, handleClose }: Props) => {
  const { categories, isLoading, isError } = useCategories();

  const [category, setCategory] = useState();
  const [childrenCategories, setChildrenCategories] = useState([]);
  const [allParentCategories, setAllParentCategories] = useState([]);

  useEffect(() => {
    if (isLoading) return;

    const category = categories.find((item: any) => item.uuid === uuid);
    const childrenCategories = categories.filter((item: any) => item.parent === category?.uuid);
    const parentCategories = categories.filter((item: any) => item.parent === null);

    setCategory(category);
    setChildrenCategories(childrenCategories);
    setAllParentCategories(parentCategories);
  }, [categories, uuid, isLoading]);

  const handleChange = (event: SelectChangeEvent) => {
    console.log('here');
    setEditParent(event.target.value);
  }

  return (
    <Dialog open={open} maxWidth="sm" fullWidth={true} onClose={handleClose}>
      <DialogTitle>Edit category</DialogTitle>
      <DialogContent>
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <Select
              label="Parent"
              fullWidth
              onChange={handleChange}
            >
              {allParentCategories.map((item: any) => (
                <MenuItem value={item.uuid} key={item.uuid}>{item.name}</MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Category name"
              type="text"
              fullWidth
              value={category?.name}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleClose}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditForm;
