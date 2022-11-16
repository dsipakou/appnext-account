import dynamic from 'next/dynamic';
import { FC, useEffect, useState } from "react";
import { ChartRates, ChartRate, ChartPeriod, Currency } from './types';
import ApexCharts from 'apexcharts';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });


interface Types {
  data: ChartRates[]
  currencies: Currency[],
  period: ChartPeriod,
  changePeriod: () => void,
}


const CurrencyChart: FC<Types> = ({ data: chartData, currencies, period, changePeriod }) => {
  const [options, setOptions] = useState({});
  const [series, setSeries] = useState([]);

  useEffect(() => {
    if (!chartData) return;

    setOptions({
      chart: {
        id: "main-chart",
        animations: {
          enabled: true,
          easing: 'linear',
          speed: 200,
          animateGradually: {
            enabled: false,
            delay: 50
          },
          dynamicAnimation: {
            enabled: true,
            speed: 40
          }
        }
      },
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        categories: chartData[0].data.map((item: ChartRate) => item.rateDate).reverse(),
        type: "datetime",
      },
      noData: {
        text: "Please, select at least one currency",
      }
    });

    setSeries(
      currencies?.map(
        (_currency: Currency) => (
          {
            name: _currency.code,
            data: chartData.find(
              (_chartRates: ChartRates) => _chartRates.currencyUuid === _currency.uuid
            )?.data.map((_rate: ChartRate) => _rate.rate).reverse(),
          }
        )
      )
    )

  }, [chartData, currencies]);

  return (
    <>
      <FormControl fullWidth>
        <InputLabel id="chart-select-label">Range</InputLabel>
        <Select
          labelId="chart-select-label"
          label="Range"
          value={period}
          sx={{ width: 300, justifyContent: 'flex-end' }}
          onChange={changePeriod}
        >
          <MenuItem value="month">Month</MenuItem>
          <MenuItem value="quarter">3 month</MenuItem>
          <MenuItem value="biannual">6 month</MenuItem>
          <MenuItem value="annual">Year</MenuItem>
        </Select>
      </FormControl>
      <Chart
        options={options}
        series={series}
        type="line"
        width="1000"
        height="400"
      />
    </>
  );
}

export default CurrencyChart;
