import React from 'react';
import { useSWRConfig } from 'swr';
import { useRates, useRatesChart } from '@/hooks/rates';
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import CurrencyCard from './CurrencyCard';
import { useCurrencies } from '@/hooks/currencies';
import { Currency, ChartPeriod, ChartPeriodMap } from './types';
import CurrencyChart from './CurrencyChart';
import AddForm from './forms/AddForm';
import EditForm from './forms/EditForm';
import ConfirmDeleteForm from './forms/ConfirmDeleteForm';
import AddRatesForm from './forms/AddRatesForm';

const Index: React.FC = () => {

  const [selectedCurrencies, setSelectedCurrencies] = React.useState<Currency[]>([]);
  const [isAddCurrencyOpen, setIsAddCurrencyOpen] = React.useState<boolean>(false);
  const [isEditCurrencyOpen, setIsEditCurrencyOpen] = React.useState<boolean>(false);
  const [isDeleteCurrencyOpen, setIsDeleteCurrencyOpen] = React.useState<boolean>(false);
  const [period, setPeriod] = React.useState<ChartPeriod>("month")
  const [activeCurrency, setActiveCurrency] = React.useState<string>();
  const { data: currencies = [] } = useCurrencies();
  const {
    data: chartRates = [],
    isLoading: isChartLoading,
    url: chartRatesUrl,
  } = useRatesChart(ChartPeriodMap[period]);
  const {
    data: rates = [],
    url: ratesUrl,
  } = useRates(2);

  const selectCurrency = (code: string): void => {
    if (!selectedCurrencies.find((item: Currency) => item.code === code)) {
      setSelectedCurrencies([...selectedCurrencies, currencies.find(
        (item: Currency) => item.code === code)]
      );
    }
  }

  const changeChartPeriod = (value: ChartPeriod) => {
    const period: ChartPeriod = value
    setPeriod(period)
  }

  const baseCurrency = currencies.find((item: Currency) => item.isBase)

  const unselectCurrency = (code: string): void => {
    if (selectedCurrencies.find((item: Currency) => item.code === code)) {
      setSelectedCurrencies(selectedCurrencies.filter((item: Currency) => item.code !== code));
    }
  }

  const openDeleteCurrencyForm = (uuid: string): void => {
    setActiveCurrency(uuid);
    setIsDeleteCurrencyOpen(true);
  }

  const openEditCurrencyForm = (uuid: string): void => {
    setActiveCurrency(uuid);
    setIsEditCurrencyOpen(true);
  }

  const closeAddCurrencyForm = (): void => {
    setIsAddCurrencyOpen(false);
  };

  const handleCloseModals = (): void => {
    setIsEditCurrencyOpen(false);
    setIsDeleteCurrencyOpen(false);
  }

  const currencyCard = (item: Currency, index: number) => (
    <div key={index}>
      <CurrencyCard
        currency={item}
        rates={rates}
        selectCurrency={selectCurrency}
        unselectCurrency={unselectCurrency}
        handleDeleteClick={openDeleteCurrencyForm}
        handleEditClick={openEditCurrencyForm}
      />
    </div>
  )

  return (
    <div className="flex flex-col">
      <div className="flex w-full px-6 my-3 justify-between items-center">
        <span className="text-xl font-semibold">Currencies</span>
        <div>
          {currencies.length && <AddRatesForm currencies={currencies} />}
          <AddForm open={isAddCurrencyOpen} handleClose={closeAddCurrencyForm} />
        </div>
      </div>
      { !currencies.length ? (
        <div className="flex w-full justify-center pt-3">
          <span className="text-2xl">Add your base currency first</span>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="flex items-center w-2/3 justify-center gap-3 p-1 mb-2 bg-white border rounded">
            <span className="text-xl">Base currency:</span>
            <span className="text-xl font-semibold">{baseCurrency.verbalName}</span>
            <Button className="h-6" onClick={() => openEditCurrencyForm(baseCurrency.uuid)}>Edit</Button>
          </div>
          <div className="flex gap-3 w-full nowrap overflow-x-scroll p-2">
            {currencies.length && currencies.map((item: Currency, index: number) => (
              !item.isBase && currencyCard(item, index)
            ))}
          </div>
          {
            !!selectedCurrencies.length ? (
              <div className="flex flex-col mt-10 justify-center w-full">
                <div className="flex justify-between">
                  <div className="flex gap-2 items-center pl-10">
                    <span className="text-sm font-semibold">Show data for</span>
                    <Select
                      defaultValue={period || 'month'}
                      onValueChange={changeChartPeriod}
                    >
                      <SelectTrigger className="flex bg-white w-40">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Period</SelectLabel>
                          <SelectItem value="month">Month</SelectItem>
                          <SelectItem value="quarter">3 months</SelectItem>
                          <SelectItem value="biannual">6 months</SelectItem>
                          <SelectItem value="annual">Year</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <CurrencyChart
                    data={chartRates}
                    isLoading={isChartLoading}
                    currencies={selectedCurrencies}
                    period={period}
                    changePeriod={changeChartPeriod}
                  /> 
                </div>
              </div>
            ) : (
              <span className="text-xl">Choose any currency to view the chart</span>
            )
          }
        </div>
      )}
      <EditForm uuid={activeCurrency} open={isEditCurrencyOpen} setOpen={handleCloseModals} />
      <ConfirmDeleteForm uuid={activeCurrency} open={isDeleteCurrencyOpen} handleClose={handleCloseModals} />
    </div>
  )
}

export default Index
