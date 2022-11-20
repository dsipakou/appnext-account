import { FC, useEffect, useState } from 'react';
import { Box, Button, Grid, FormControl, InputLabel, MenuItem, Select, Toolbar, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useRates, useRatesChart } from '@/hooks/rates';
import CurrencyCard from './CurrencyCard';
import { useCurrencies } from '@/hooks/currencies';
import { Currency, ChartPeriod, ChartPeriodMap } from './types';
import CurrencyChart from './CurrencyChart';
import AddForm from './forms/AddForm';
import EditForm from './forms/EditForm';
import ConfirmDeleteForm from './forms/ConfirmDeleteForm';
import AddRatesForm from './forms/AddRatesForm';

const Index: FC = () => {
  const [selectedCurrencies, setSelectedCurrencies] = useState<Currency[]>([]);
  const [isAddCurrencyOpen, setIsAddCurrencyOpen] = useState<boolean>(false);
  const [isEditCurrencyOpen, setIsEditCurrencyOpen] = useState<boolean>(false);
  const [isDeleteCurrencyOpen, setIsDeleteCurrencyOpen] = useState<boolean>(false);
  const [isRatesFormOpen, setIsRatesFormOpen] = useState<boolean>(false);
  const [period, setPeriod] = useState<ChartPeriod>("month")
  const [activeCurrency, setActiveCurrency] = useState<Currency>();
  const { currencies, isLoading, isError } = useCurrencies();
  const { chartRates, isLoading: isChartLoading, isError: isChartError } = useRatesChart(ChartPeriodMap[period]);
  const { rates, isLoading: isRatesLoading, isError: isRatesError } = useRates(2);

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

  const openAddCurrencyForm = (): void => {
    setIsAddCurrencyOpen(true);
  };

  const openDeleteCurrencyForm = (uuid: string): void => {
    setActiveCurrency(uuid);
    setIsDeleteCurrencyOpen(true);
  }

  const openEditCurrencyForm = (uuid: string): void => {
    setActiveCurrency(uuid);
    setIsEditCurrencyOpen(true);
  }

  const openAddRatesForm = (): void => {
    setIsRatesFormOpen(true);
  }

  const closeAddCurrencyForm = (): void => {
    setIsAddCurrencyOpen(false);
  };

  const handleCloseModals = (): void => {
    setIsEditCurrencyOpen(false);
    setIsDeleteCurrencyOpen(false);
    setIsRatesFormOpen(false);
  }

  const currencyCard = (item: Currency, index: number) => (
    <Grid item key={index}>
      <CurrencyCard
        currency={item}
        rates={rates}
        selectCurrency={selectCurrency}
        unselectCurrency={unselectCurrency}
        handleDeleteClick={openDeleteCurrencyForm}
        handleEditClick={openEditCurrencyForm}
      />
    </Grid>
  )

  return (
    <>
      <Toolbar sx={{ pb: 1 }}>
        <Typography variant="h4" sx={{ my: 2 }}>Currencies</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          sx={{ textTransform: 'none' }}
          onClick={openAddCurrencyForm}
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
          <Grid item xs={12}>
            <Toolbar>
              <FormControl>
                <InputLabel id="chart-select-label">Range</InputLabel>
                <Select
                  labelId="chart-select-label"
                  label="Range"
                  value={period}
                  sx={{ width: 300, justifyContent: 'flex-end' }}
                  onChange={changeChartPeriod}
                >
                  <MenuItem value="month">Month</MenuItem>
                  <MenuItem value="quarter">3 months</MenuItem>
                  <MenuItem value="biannual">6 months</MenuItem>
                  <MenuItem value="annual">Year</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                sx={{ textTransform: 'none' }}
                onClick={openAddRatesForm}
              >
                Add rates
              </Button>
            </Toolbar>
          </Grid>
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
      <AddForm open={isAddCurrencyOpen} handleClose={closeAddCurrencyForm} />
      <EditForm open={isEditCurrencyOpen} uuid={activeCurrency} handleClose={handleCloseModals} />
      <ConfirmDeleteForm open={isDeleteCurrencyOpen} uuid={activeCurrency} handleClose={handleCloseModals} />
      <AddRatesForm open={isRatesFormOpen} handleClose={handleCloseModals} currencies={currencies} />
    </>
  )
}

export default Index;
