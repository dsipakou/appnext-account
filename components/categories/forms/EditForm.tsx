import { selectChangeEvent, ChangeEvent, useEffect, useState } from 'react';
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
  FormControl,
  InputLabel,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useSWRConfig } from 'swr';
import { useCategories } from '../../../hooks/categories';
import { CategoryRequest } from '../types';

interface Props {
  uuid: string,
  open: boolean,
  handleClose: () => void,
}

const EditForm = ({ uuid, open = false, handleClose }: Props) => {
  const { mutate } = useSWRConfig();
  const { categories, isLoading, isError } = useCategories();

  const [ category, setCategory ] = useState<Category>('');
  const [ name, setName ] = useState<string>('');
  const [ parent, setParent ] = useState<Category>('');
  const [ childrenCategories, setChildrenCategories ] = useState<Category[]>([]);
  const [ parentList, setParentList ] = useState<Category[]>([]);
  const [ errors, setErrors ] = useState<string[]>([]);

  useEffect(() => {
    if (isLoading) return;

    const _category = categories.find((item: any) => item.uuid === uuid);
    
    if (!_category) return;

    const _childrenCategories = categories.filter(
      (item: any) => item.parent === _category.uuid,
    );
    const _parentCategories = categories.filter(
      (item: any) => item.parent === null && item.type === _category.type,
    );

    setCategory(_category);
    setName(_category.name);
    setChildrenCategories(_childrenCategories);
    setParentList(_parentCategories);
    setParent(_category.parent);
  }, [categories, uuid, isLoading]);
  
  const handleEdit = async () => {
    // TODO: start loading
    setErrors([]);
    const payload: CategoryRequest = {
      name,
      type: category.type,
      parent,
    };
    axios
      .patch(`categories/${uuid}/`, payload)
      .then((res) => {
        if (res.status === 200) {
          mutate('categories/');
          handleClose();
        } else {
          // TODO: handle errors
        }
      })
      .catch((error) => {
        const errRes = error.response.data;
        for (const prop in errRes) {
          setErrors(errRes[prop]);
        }
      })
      .finally(() => {
        // TODO: stop-loading
      })
  }

  const handleParentSelect = (e: SelectChangeEvent) => {
    setParent(e.target.value);
  }

  const handleNameTextbox = (e: ChangeEvent) => {
    setName(e.target.value);
  }

  const onClose = () => {
    handleClose();
    setName(category?.name);
    setParent(category?.parent);
    setErrors([]);
  }

  return (
    <Dialog open={open} maxWidth="sm" fullWidth={true} onClose={onClose}>
      <DialogTitle>Edit category</DialogTitle>
      <DialogContent>
        <Grid container spacing={4}>
            { errors.length > 0 && (
              <Grid item xs={12}>
                { errors.map((message: string) => (
                  <Typography key={message} color="red">{message}</Typography>
                ))}
              </Grid>
            )}
            <Grid item xs={12}>
              { category?.parent !== null && (
                <FormControl fullWidth sx={{mt: 1}}>
                  <InputLabel id="parent-select-label">Parent category</InputLabel>
                  <Select
                    labelId="parent-select-label"
                    label="Parent category"
                    value={parent}
                    fullWidth
                    defaultValue=""
                    onChange={handleParentSelect}
                  >
                    { parentList?.map((category: Category) => (
                      <MenuItem key={category.uuid} value={category.uuid}>{category.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Grid>
          <Grid item xs={12}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Category name"
              type="text"
              fullWidth
              value={name}
              onChange={handleNameTextbox}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={name === category?.name} onClick={handleEdit}>Update</Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditForm;
