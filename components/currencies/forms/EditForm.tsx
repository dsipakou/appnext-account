
import { FC, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useSWRConfig } from 'swr';

import { useCurrencies } from '@/hooks/currencies';

import { Currency, CurrencyRequest } from '../types';

interface Types {
  uuid: string
  open: boolean,
  handleClose: () => void,
}

const EditForm: FC<Types> = ({ uuid, open, handleClose }) => {
  const { mutate } = useSWRConfig();
  const [currency, setCurrency] = useState<Currency>();
  const [verbalName, setVerbalName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [sign, setSign] = useState<string>('');
  const [isDefault, setIsDefault] = useState<boolean>(false);
  const [comments, setComments] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const { data: currencies, isLoading, isError } = useCurrencies();

  useEffect(() => {
    if (isLoading) return;

    const _currency = currencies.find((item: Currency) => item.uuid === uuid);
    if (!_currency) return;

    setCurrency(_currency);
    setVerbalName(_currency.verbalName);
    setCode(_currency.code);
    setSign(_currency.sign);
    setIsDefault(_currency.isDefault);
    setComments(_currency.comments);

    return () => setErrors([]);
  }, [isLoading, currencies, uuid])

  const handleIsDefaultSwitch = (e: ChangeEvent) => {
    setIsDefault(e.target.checked);
  }

  const handleVerbalNameInput = (e: ChangeEvent) => {
    setVerbalName(e.target.value);
  }

  const handleCodeInput = (e: ChangeEvent) => {
    setCode(e.target.value);
  }

  const handleSignInput = (e: ChangeEvent) => {
    setSign(e.target.value);
  }

  const handleCommentsInput = (e: ChangeEvent) => {
    setComments(e.target.value);
  }

  const handleUpdate = async (): void => {
    setErrors([]);
    const payload: CurrencyRequest = {
      verbalName,
      code,
      sign,
      isDefault,
      comments,
    };
    axios.patch(`currencies/${currency.uuid}/`, {
      ...payload,
    }).then(
      res => {
        if (res.status === 200) {
          mutate('currencies/');
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

  return (
    <Dialog maxWidth="sm" fullWidth={true} open={open} onClose={handleClose}>
      <DialogTitle>Edit category</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={8}>
            {errors.map((message: string) => (
              <Typography key={message} color="red">{message}</Typography>
            ))}
          </Grid>
          <Grid item xs={6}>
            <TextField
              margin="dense"
              id="verbalName"
              label="Verbal Name"
              placeholder="US Dollar"
              type="text"
              fullWidth
              autoFocus
              value={verbalName}
              onChange={handleVerbalNameInput}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              margin="dense"
              id="code"
              label="Code"
              placeholder="USD"
              type="text"
              fullWidth
              value={code}
              onChange={handleCodeInput}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              margin="dense"
              id="sign"
              label="Sign"
              placeholder="$"
              type="text"
              fullWidth
              value={sign}
              onChange={handleSignInput}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel control={
              <Switch checked={isDefault} onChange={handleIsDefaultSwitch} />
            } label="This is default currency" />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline={true}
              rows={3}
              id="comments"
              label="Comments"
              value={comments}
              onChange={handleCommentsInput}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleUpdate}>Update</Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditForm;
