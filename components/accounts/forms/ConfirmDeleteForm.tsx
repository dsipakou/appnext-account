
import { FC, useEffect, useState } from 'react'
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
import { useAccounts } from '@/hooks/accounts';
import { AccountResponse } from '../types';

interface Types {
  open: boolean,
  uuid: string,
  handleClose: () => void;
}

const ConfirmDeleteForm: FC<Types> = ({ open = false, uuid, handleClose }) => {
  const [account, setAccount] = useState<AccountResponse | undefined>();
  const [errors, setErrors] = useState([]);
  const { data: accounts, isLoading, isError } = useAccounts();
  const { mutate } = useSWRConfig();

  useEffect(() => {
    if (isLoading) return;

    const _account = accounts.find((item: AccountResponse) => item.uuid === uuid);
    setAccount(_account);

    return () => setErrors([]);
  }, [isLoading, accounts, uuid])

  const handleDelete = () => {
    // TODO: start loading
    setErrors([]);
    axios
      .delete(`accounts/${account.uuid}`)
      .then(
        res => {
          if (res.status === 204) {
            mutate('accounts/');
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
            You are about to delete {account?.title} account
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

export default ConfirmDeleteForm
