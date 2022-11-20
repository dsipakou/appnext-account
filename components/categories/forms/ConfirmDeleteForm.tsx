import { FC, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
} from '@mui/material';
import axios from 'axios';
import { useSWRConfig } from 'swr';
import { useRouter } from 'next/router';
import { useCategories } from '../../../hooks/categories';
import { Category } from '../types';

interface Types {
  open: boolean,
  uuid: string,
  handleClose: () => void;
}

const ConfirmDeleteForm: FC<Types> = ({ open = false, uuid, handleClose }) => {
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState([]);
  const { data: categories, isLoading, isError } = useCategories();
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const { uuid: queryUuid } = router.query;

  useEffect(() => {
    if (isLoading) return;

    const category = categories.find((category: Category) => category.uuid === uuid);
    setCategory(category);

    return () => setErrors([]);
  }, [isLoading, categories, uuid])

  const handleDelete = () => {
    // TODO: start loading
    setErrors([]);
    axios
      .delete(`categories/${category.uuid}`)
      .then(
        res => {
          if (res.status === 204) {
            if (category.uuid === queryUuid) {
              router.push('/categories/');
            }
            mutate('categories/');
            handleClose();
          } else {
            // TODO: handle errors [non-empty parent,]
          }
        }
      )
      .catch(
        (err) => {
          setErrors(err.response.data);
        }
      )
      .finally(
        () => {
          // TODO: stop-loading
        }
      );
  };

  return (
    <Dialog maxWidth="sm" fullWidth={true} open={open} onClose={handleClose}>
      <DialogTitle>Please, confirm deletion</DialogTitle>
      <DialogContent>
        {errors.length > 0 && (
          <Box>
            {errors.map((message: string) => (
              <Typography key={message} color="red">{message}</Typography>
            ))}
          </Box>
        )}
        <Box>
          <Typography variant="body1">
            You are about to delete {category?.name} category
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button color="warning" variant="contained" onClick={handleDelete}>Delete</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDeleteForm;
