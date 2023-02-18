import { ChangeEvent, FC, useEffect, useState } from 'react';
import InputMask from 'react-input-mask';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Grid,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material';
import axios from 'axios';
import { useSWRConfig } from 'swr';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers';
import { useRatesOnDate } from '@/hooks/rates';
import { getFormattedDate } from '@/utils/dateUtils';
import { RateResponse } from '@/hooks/rates';
import { Currency, RatePostRequest, RateItemPostRequest } from '../types';

interface Types {
  open: boolean
  onClose: () => void
  onSave: () => void
  currencies: Currency[]
}

interface RatesMap {
  [key: string]: number
}

const AddRatesForm: FC<Types> = ({ open, onSave, onClose, currencies = [] }) => {
  const { mutate } = useSWRConfig();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date);
  const [ratesInputMap, setRatesInputMap] = useState({});
  const [errors, setErrors] = useState<string[]>([]);
  const { data: ratesOnDate, isLoading, url } = useRatesOnDate(getFormattedDate(selectedDate));

  useEffect(() => {
    if (!ratesOnDate || isLoading || !open) return;

    let ratesValues = {}

    ratesOnDate.forEach(
      (item: RateResponse) => {
        ratesValues = {
          ...ratesValues,
          [item.currency]: item.rate,
        } as RatesMap
      }
    )
    setRatesInputMap(ratesValues);
  }, [isLoading, selectedDate, open]);

  const getBaseCurrency = (): Currency => {
    return currencies.find((item: Currency) => item.isBase)!
  }

  const handleDateChange = (date: Date | null): void => {
    if (date !== null) setSelectedDate(date);
  }

  const handleRateChange = (uuid: string, e: ChangeEvent): void => {
    const ratesValues = {
      ...ratesInputMap,
      [uuid]: e.target.value,
    }
    setRatesInputMap(ratesValues);
  }

  const prepareSaveRequest = (): RatePostRequest => {
    const requestPayload: RatePostRequest = {
      baseCurrency: getBaseCurrency().code,
      items: [],
      rateDate: getFormattedDate(selectedDate),
    }

    Object.keys(ratesInputMap).forEach((_uuid: string) => {
      const code = currencies.find(
        (_currency: Currency) => _currency.uuid === _uuid
      )!.code
      const normalizedRate: number = typeof ratesInputMap[_uuid] === 'number' ?
        ratesInputMap[_uuid] :
        Number(ratesInputMap[_uuid].replace(/[^0-9.]/g, ''))
      const rateItem: RateItemPostRequest = {
        code,
        rate: normalizedRate
      }
      if (normalizedRate !== 0) requestPayload.items.push(rateItem);
    });

    return requestPayload;
  }

  const handleSave = async (): void => {
    setErrors([]);

    const payload = prepareSaveRequest();

    axios.post('rates/batched/', {
      ...payload,
    }).then(
      res => {
        if (res.status === 200) {
          mutate(url)
          onSave()
          handleClose()
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

  const handleClose = (): void => {
    setRatesInputMap({});
    onClose();
  }

  return (
    <Dialog maxWidth="sm" fullWidth={true} open={open} onClose={handleClose}>
      <DialogTitle>Add rates</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Stack gap={1}>
              {currencies.map((item: Currency) => (!item.isBase &&
                <Box key={item.uuid}>
                  <InputMask
                    mask='9.9999'
                    value={ratesInputMap[item.uuid] || ''}
                    onChange={(e: ChangeEvent) => handleRateChange(item.uuid, e)}
                  >
                    {() => (
                      <TextField
                        fullWidth
                        InputProps={{
                          startAdornment: <InputAdornment position="start">{item.sign}</InputAdornment>,
                        }}
                      />
                    )}
                  </InputMask>
                </Box>
              ))}
            </Stack>
          </Grid>
          <Grid item xs={8}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <StaticDatePicker
                displayStaticWrapperAs="desktop"
                disabled={isLoading}
                openTo="day"
                value={selectedDate}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params}
                />}
              >
              </StaticDatePicker>
            </LocalizationProvider>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button variant="contained" disabled={isLoading} onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddRatesForm;
