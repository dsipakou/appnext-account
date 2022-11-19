import dynamic from 'next/dynamic';
import { FC, useEffect, useState } from "react";
import { ChartRates, ChartRate, ChartPeriod, Currency } from './types';
import ApexCharts from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });


interface Types {
  data: ChartRates[]
  currencies: Currency[],
  period: ChartPeriod,
}


const CurrencyChart: FC<Types> = ({ data: chartData, currencies, period }) => {
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
        labels: {
          rotateAlways: false,
          hideOverlappingLabels: true,
          rotate: -30
        }
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
    <Chart
      options={options}
      series={series}
      type="line"
      width="1000"
      height="380"
    />
  );
}

export default CurrencyChart;
