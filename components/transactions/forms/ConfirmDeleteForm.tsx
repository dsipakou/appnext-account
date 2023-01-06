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
import { TransactionResponse } from '../types';

interface Types {
  open: boolean
  uuid: string
  handleClose: () => void
  mutateTransactions: () => void
}

const ConfirmDeleteForm: FC<Types> = ({ open = false, uuid, handleClose, mutateTransactions }) => {
  const [errors, setErrors] = useState([]);
  const { mutate } = useSWRConfig();

  const handleDelete = () => {
    // TODO: start loading
    setErrors([]);
    axios
      .delete(`transactions/${uuid}`)
      .then(
        res => {
          if (res.status === 204) {
            mutateTransactions()
            handleClose()
          } else {
            // TODO: handle errors [non-empty parent,]
          }
        }
      )
      .catch(
        (err) => {
          setErrors(err.response.data)
        }
      )
      .finally(
        () => {
          // TODO: stop-loading
        }
      )
  }

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
            You are about to delete 1 transaction
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
