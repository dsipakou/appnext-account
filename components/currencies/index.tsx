import { FC, useEffect, useState } from 'react';
import { Box, Button, Grid, Toolbar, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useRatesChart } from '@/hooks/rates';
import CurrencyCard from './CurrencyCard';
import { useCurrencies } from '@/hooks/currencies';
import { Currency, ChartPeriod, ChartPeriodMap } from './types';
import CurrencyChart from './CurrencyChart';

const Index: FC = () => {
  const [selectedCurrencies, setSelectedCurrencies] = useState<Currency[]>([]);
  const [period, setPeriod] = useState<ChartPeriod>("month")
  const { currencies, isLoading, isError } = useCurrencies();
  const { chartRates, isLoading: isChartLoading, isError: isChartError } = useRatesChart(ChartPeriodMap[period]);

  const selectCurrency = (code: string): void => {
    if (!selectedCurrencies.find((item: Currency) => item.code === code)) {
      setSelectedCurrencies([...selectedCurrencies, currencies.find(
        (item: Currency) => item.code === code)]
      );
    }
  }

  const changeChartPeriod = (e: SelectChangeEvent) => {
    const period: ChartPeriod = e.target.value;
    setPeriod(period);
  }

  const unselectCurrency = (code: string): void => {
    if (selectedCurrencies.find((item: Currency) => item.code === code)) {
      setSelectedCurrencies(selectedCurrencies.filter((item: Currency) => item.code !== code));
    }
  }

  const currencyCard = (item: Currency, index: number) => (
    <Grid item key={index}>
      <CurrencyCard
        currency={item}
        amount="2.59"
        percentage="-4"
        selectCurrency={selectCurrency}
        unselectCurrency={unselectCurrency}
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
          {!isLoading && currencies.map((item: Currency, index: number) => (
            !item.isBase && currencyCard(item, index)
          ))}
        </Grid>
        <Grid container justifyContent="center" sx={{ mt: 5 }}>
          <Grid item>
            <CurrencyChart
              data={chartRates}
              currencies={selectedCurrencies}
              period={period}
              changePeriod={changeChartPeriod}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default Index;
