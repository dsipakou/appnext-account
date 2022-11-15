import { FC, useEffect } from 'react';
import { Box, Button, Grid, Toolbar, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CurrencyCard from './CurrencyCard';
import { useCurrencies } from '@/hooks/currencies';
import { Currency } from './types';

const Index: FC = () => {
  const { currencies, isLoading, isError } = useCurrencies();

  const currencyCard = (item: Currency) => (
    <Grid item>
      <CurrencyCard
        title={item.verbalName}
        sign={item.sign}
        code={item.code}
        amount="2.59"
        percentage="-4"
        selected={true}
      />
    </Grid>
  )

  return (
    <>
      <Toolbar sx={{ pb: 4 }}>
        <Typography variant="h4" sx={{ my: 2 }}>Currencies</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          sx={{ textTransform: 'none' }}
          onClick={() => { }}
        >
          Add currency
        </Button>
      </Toolbar>
      <Box>
        <Grid container spacing={2} wrap="nowrap" sx={{ overflowX: 'scroll', pb: 2 }}>
          {!isLoading && currencies.map((item: Currency) => (
            !item.isBase && currencyCard(item)
          ))}
        </Grid>
      </Box>
    </>
  )
}

export default Index;
