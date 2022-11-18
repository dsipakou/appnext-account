import PropTypes from 'prop-types';
import { FC, useState } from 'react';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import { Avatar, Box, Card, Grid, Menu, MenuItem, Typography } from '@mui/material';

// assets
import NorthEastIcon from '@mui/icons-material/NorthEast';
import SouthEastIcon from '@mui/icons-material/SouthEast';

import { Rate } from './types';

interface Types {
  currency: Currency,
  rates: Rates[],
  selectCurrency: (code: string) => void,
  unselectCurrency: (code: string) => void,
}

const CardWrapper = styled(Card)(({ theme, selected }) => ({
  backgroundColor: selected ? theme.palette.primary.dark : 'white',
  color: selected ? 'white' : 'black',
  borderRadius: 15,
  overflow: 'hidden',
  position: 'relative',
  width: 270,
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: theme.palette.primary.light,
    borderRadius: '50%',
    top: -85,
    right: -95,
    opacity: 0.7,
    [theme.breakpoints.down('sm')]: {
      top: -105,
      right: -140
    },
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: theme.palette.primary.light,
    borderRadius: '50%',
    top: -125,
    right: -15,
    opacity: 0.3,
    [theme.breakpoints.down('sm')]: {
      top: -155,
      right: -70
    },
  }
}));


const CurrencyCard: FC<Types> = ({ currency, rates, selectCurrency, unselectCurrency }) => {
  const theme = useTheme();

  const [selected, setSelected] = useState<boolean>(false);

  const getRate = (uuid: string, seqNumber: number = 0): Rate | undefined => {
    if (!rates) {
      return;
    }

    const currencyRates: Rate[] = rates.filter(
      (rate: Rate) => rate.currency === uuid
    )
    if (currencyRates.length < 2) {
      return currencyRates[0];
    }

    return currencyRates[seqNumber];
  }

  const getPercentage = (uuid: string): number => {
    if (!rates) {
      return 0;
    }

    const _rates = rates.filter((rate: Rate) => rate.currency === uuid);
    if (_rates.length < 2) {
      return 0;
    }

    return (1 - (_rates[1].rate / _rates[0].rate)) * 100;
  }

  const handleClick = (): void => {
    setSelected(!selected);

    if (selected) {
      unselectCurrency(currency.code);
    } else {
      selectCurrency(currency.code)
    }
  };

  return (
    <>
      <CardWrapper
        selected={selected}
        raised={!selected}
        onClick={handleClick}
      >
        <Box sx={{ p: 2.25 }}>
          <Grid container direction="column">
            <Grid item>
              <Grid container justifyContent="space-between">
                <Grid item>
                  <Typography sx={{ fontSize: '1.5rem' }}>
                    {currency.code}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container alignItems="baseline">
                <Grid item>
                  <Typography sx={{ fontSize: '2.125rem', fontWeight: 500, mr: 1, mt: 1.75 }}>
                    {getRate(currency.uuid)?.rate.toFixed(4)}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 500, mr: 1 }}>
                    {getRate(currency.uuid, 1)?.rate.toFixed(4)}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container alignItems="center" gap={1}>
                <Grid item>
                  <Typography>
                    {getPercentage(currency.uuid)?.toFixed(2)}%
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography sx={{ fontSize: '.9rem' }}>
                    ({(getRate(currency.uuid)?.rate - getRate(currency.uuid, 1)?.rate).toFixed(4)})
                  </Typography>
                </Grid>
                <Grid item>
                  {getPercentage(currency.uuid) < 0 && <SouthEastIcon sx={{ color: 'red' }} />}
                  {getPercentage(currency.uuid) > 0 && <NorthEastIcon sx={{ color: 'lightgreen' }} />}
                </Grid>
              </Grid>
            </Grid>
            <Grid item sx={{ mb: 1.25, selfAlign: "flex-end" }}>
              <Typography
                sx={{
                  fontSize: '.8rem',
                  fontWeight: 500,
                  color: theme.palette.secondary[200],
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}
              >
                {getRate(currency.uuid)?.rateDate}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </CardWrapper>
    </>
  );
};

export default CurrencyCard;
