import { useEffect, useState } from 'react';
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
import { useCurrencies } from '@/hooks/currencies';
import { Currency } from '../types';

interface Props {
  open: boolean,
  uuid: string,
  handleClose: () => void;
}

const ConfirmDeleteForm = ({ open = false, uuid, handleClose }: Props) => {
  const [currency, setCurrency] = useState('');
  const [errors, setErrors] = useState([]);
  const { currencies, isLoading, isError } = useCurrencies();
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const { uuid: queryUuid } = router.query;

  useEffect(() => {
    if (isLoading) return;

    const currency = currencies.find((currency: Currency) => currency.uuid === uuid);
    setCurrency(currency);

    return () => setErrors([]);
  }, [isLoading, currencies, uuid])

  const handleDelete = () => {
    // TODO: start loading
    setErrors([]);
    axios
      .delete(`currencies/${currency.uuid}`)
      .then(
        res => {
          if (res.status === 204) {
            mutate('currencies/');
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
            You are about to delete {currency?.code} currency
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
