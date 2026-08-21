import ReactECharts from "echarts-for-react";
import React from "react";

import { ChartPeriod, ChartRates, Currency } from "./types";

interface Props {
  data: ChartRates[];
  isLoading: boolean;
  currencies: Currency[];
  period: ChartPeriod;
}

const CurrencyChart: React.FC<Props> = ({ data: chartData, isLoading, currencies, period }) => {
  const options = React.useMemo(() => {
    if (isLoading || chartData.length === 0) {
      return {
        xAxis: { type: "category", data: [] },
        yAxis: { type: "value" },
        series: [],
      };
    }

    return {
      animationDuration: 500,
      animationEasing: "cubicOut",

      color: ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"],

      grid: {
        top: 20,
        right: 20,
        bottom: 35,
        left: 45,
      },

      legend: {
        top: 0,
        icon: "roundRect",
        itemWidth: 14,
        itemHeight: 4,
      },

      tooltip: {
        trigger: "axis",
        backgroundColor: "#fff",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        textStyle: {
          color: "#111827",
        },
        axisPointer: {
          type: "cross",
          lineStyle: {
            color: "#94A3B8",
          },
        },
      },

      xAxis: {
        type: "category",
        boundaryGap: false,

        data: chartData[0].data.map((item) => item.rateDate).reverse(),

        axisLine: {
          lineStyle: {
            color: "#E5E7EB",
          },
        },

        axisTick: {
          show: false,
        },

        axisLabel: {
          color: "#6B7280",
        },
      },

      yAxis: {
        type: "value",

        // Не начинать ось с нуля
        scale: true,

        // Небольшие отступы сверху и снизу
        min: (value: { min: number; max: number }) =>
          (value.min - (value.max - value.min) * 0.05).toFixed(2),

        max: (value: { min: number; max: number }) =>
          (value.max + (value.max - value.min) * 0.05).toFixed(2),

        splitNumber: 5,

        axisLine: {
          show: false,
        },

        axisTick: {
          show: false,
        },

        axisLabel: {
          color: "#6B7280",
        },

        splitLine: {
          lineStyle: {
            color: "#F3F4F6",
          },
        },
      },

      series: currencies.map((currency) => ({
        name: currency.code,

        type: "line",

        smooth: 0.2,

        showSymbol: false,

        emphasis: {
          focus: "series",
        },

        lineStyle: {
          width: 3,
        },

        data:
          chartData
            .find((item) => {
              return item.currencyUuid === currency.uuid;
            })
            ?.data.map((item) => item.rate)
            ?.reverse() ?? [],
      })),
    };
  }, [chartData, currencies, isLoading, period]);

  return (
    <div className="relative h-83 w-full">
      <ReactECharts option={options} style={{ height: "100%", width: "100%" }} notMerge />
    </div>
  );
};

export default CurrencyChart;
