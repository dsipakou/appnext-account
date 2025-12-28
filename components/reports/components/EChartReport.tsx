import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useSession } from 'next-auth/react';
import { useStore } from '@/app/store';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTransactionsMonthlyReport } from '@/hooks/transactions';
import { getFormattedDate } from '@/utils/dateUtils';
import { addMonths, endOfMonth, getDate, startOfMonth, subMonths } from 'date-fns';
import { ChartCategory, ChartData } from '../types';
import RangeSwitcher from './RangeSwitcher';

interface GroupByCategory {
  [key: string]: number[];
}

const generateExpenseHeader = (outcomeTotal: number, currencySign: string) => `
  <div class="grid grid-cols-2 h-full">
    <div class="flex items-center pl-5 pb-2">
      <span class="font-bold text-lg">Expenses</span>
    </div>
    <div class="flex">
      <span class="text-lg text-right pr-1 text-red-500">
        &#9660;
      </span>
      <span class="text-lg pr-5">
        ${outcomeTotal.toFixed(2)} ${currencySign}
      </span>
    </div>
`;

const generateIncomeHeader = (incomeTotal: number, currencySign: string) => `
  <div class="grid grid-cols-2 h-full w-fit">
    <div class="flex items-center pl-5 pb-2 w-4">
      <span class="font-bold text-lg">Income</span>
    </div>
    <div class="flex items-center">
      <span class="text-lg text-right pr-1 text-green-500">
        &#9650;
      </span>
      <span class="text-lg pr-5">
        ${incomeTotal.toFixed(2)} ${currencySign}
      </span>
    </div>
`;

const generateCategoryRow = (item: any, isHovered: boolean, currencySign: string, isIncome: boolean = false) => `
  <div style="background-color: ${isHovered && item.color}" class="flex w-full items-center py-[2px] ${isHovered && 'text-white rounded-l-sm'}">
    <div style="background-color: ${item.color}" class="h-4 w-1 mr-3"></div>
    <span class="${isHovered && 'font-bold text-lg'} w-full overflow-hidden">${item.seriesName}</span>
  </div>
  <div style="background-color: ${isHovered && item.color}" class="flex w-fit text-right items-center px-5 ${isHovered ? 'font-semibold text-lg text-white rounded-r-sm' : 'text-sm'}">
    ${isIncome ? '<span class="w-full">' : ''}${isIncome ? '+' : '-'} ${Number(item.value).toFixed(2)} ${currencySign}${isIncome ? '</span>' : ''}
  </div>
`;

const generateBalanceRow = (item: any, currencySign: string) => `
    <div class="font-bold mt-4">
      <div class="flex items-center">
        <span class="font-bold text-xl">Balance</span>
      </div>
    </div>
    <div class="font-bold text-right text-2xl mt-4">
      <span class="text-lg text-right pr-1 text-${item.value >= 0 ? 'green' : 'red'}-500">
        ${item.value >= 0 ? '&#9650;' : '&#9660;'}
      </span>
      <span>
        ${Number(item.value).toFixed(2)} ${currencySign}
      </span>
    </div>
`;

const EChartReport: React.FC = () => {
  const [tooltipAxis, setTooltipAxis] = React.useState<'axis' | 'item'>('axis');
  const [date, setDate] = React.useState<Date>(new Date());
  const [upToDay, setUpToDay] = React.useState<number>(getDate(new Date()));
  const [showUpToDay, setShowUpToDay] = React.useState<boolean>(false);
  const [showIncome, setShowIncome] = React.useState<boolean>(false);
  const [options, setOptions] = React.useState({});
  const highlightedIndexRef = React.useRef<number>(-1);

  const dateFrom = getFormattedDate(startOfMonth(subMonths(date, 11)));
  const dateTo = getFormattedDate(endOfMonth(date));

  const {
    data: { user: authUser },
  } = useSession();
  const { data: chartData = [], isLoading: isDataLoading } = useTransactionsMonthlyReport(
    dateFrom,
    dateTo,
    authUser?.currency,
    showUpToDay ? upToDay : undefined
  );
  const currencySign = useStore((state) => state.currency.sign);

  const monthDayArray = Array.from({ length: 31 }, (_, i) => i + 1);

  React.useEffect(() => {
    if (isDataLoading) return;
    if (chartData.length === 0) return;

    const groupByCategory: GroupByCategory = chartData.reduce((acc: GroupByCategory, curr: ChartData) => {
      /*
       * {
       *  "Food": [100, 80],
       *  "Transport": [40, 10],
       *  "Entertainment": [30]
       * }
       */
      curr.categories.forEach((category: ChartCategory) => {
        acc[category.name] = acc[category.name] || [];
        acc[category.name].push(category.value);
      });
      return acc;
    }, {});

    const outcomeCategories = chartData[0].categories
      .filter((item: ChartCategory) => item.categoryType === 'EXP')
      .reverse();
    const incomeCategories = chartData[0].categories.filter((item: ChartCategory) => item.categoryType === 'INC');
    const diffArray = chartData.map((item: ChartData) => {
      const outcome = item.categories.reduce((acc: number, category: ChartCategory) => {
        if (category.categoryType === 'EXP') acc += category.value;
        return acc;
      }, 0);
      const income = item.categories.reduce((acc: number, category: ChartCategory) => {
        if (category.categoryType === 'INC') acc += category.value;
        return acc;
      }, 0);
      return income - outcome;
    });

    // Add outcome
    const formattedSeries = outcomeCategories.map((item: ChartCategory) => ({
      name: item.name,
      data: groupByCategory[item.name] || [],
      itemStyle: {
        borderRadius: [2, 2, 2, 2],
      },
      stack: 'outcome',
      type: 'bar',
      emphasis: {
        focus: 'series',
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.3)',
        },
      },
      label: {
        show: true,
        fontSize: 10,
        formatter: (params: any) =>
          params.value > 1000
            ? '-' + Number(params.value / 1000).toFixed(2) + 'k'
            : '-' + Number(params.value).toFixed(0),
        textBorderColor: 'black',
        textBorderWidth: 2,
        color: 'white',
      },
    }));

    // Add income
    if (showIncome) {
      formattedSeries.push(
        ...incomeCategories.map((item: ChartCategory) => ({
          name: item.name,
          data: groupByCategory[item.name] || [],
          stack: 'income',
          sampling: 'sum',
          type: 'bar',
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.3)',
            },
          },
          label: {
            show: true,
            formatter: (params: any) => '+' + Number(params.value).toFixed(0),
            fontSize: 10,
            textBorderColor: 'white',
            textBorderWidth: 2,
            color: 'black',
          },
        }))
      );
    }

    // Add difference
    if (showIncome) {
      formattedSeries.push({
        name: 'Difference',
        data: diffArray || [],
        stack: 'difference',
        itemStyle: {
          color: '#ddd',
        },
        type: 'bar',
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.3)',
          },
        },
        label: {
          show: true,
          formatter: (params) => Number(params.value).toFixed(0),
          fontSize: 10,
          textBorderColor: 'white',
          textBorderWidth: 2,
          color: 'black',
        },
      });
    }

    const optionsLocal = {
      xAxis: {
        type: 'category',
        data: chartData.map((item: ChartData) => item.date),
      },
      yAxis: {
        type: 'value',
        minInterval: 100,
        maxInterval: 20000,
        splitNumber: 20,
      },
      grid: {
        left: '3%',
        right: '20%',
        top: '3%',
        bottom: '3%',
        containLabel: true,
      },
      legend: {
        data: outcomeCategories.map((item: ChartCategory) => item.name).reverse(),
        orient: 'vertical',
        top: 'center',
        right: 10,
        width: '20%',
      },
      series: formattedSeries,
      tooltip: {
        trigger: tooltipAxis,
        position: (point: number[]) => {
          return [(point[0] % 700) + 40, point[1] % 200];
        },

        formatter: (params: any, ticket: any) => {
          if (tooltipAxis === 'axis') {
            let output = '<div class="flex gap-2">';

            const outcomeTotal = params.reduce((acc: number, item: any) => {
              if (outcomeCategories.map((category: ChartCategory) => category.name).includes(item.seriesName)) {
                acc += item.value;
              }
              return acc;
            }, 0);

            output += generateExpenseHeader(outcomeTotal, currencySign);

            output += params.reduce((acc: string, item: any) => {
              if (outcomeCategories.map((category: ChartCategory) => category.name).includes(item.seriesName)) {
                const isHovered = highlightedIndexRef.current === item.componentIndex;
                acc = generateCategoryRow(item, isHovered, currencySign, false) + acc;
              }
              return acc;
            }, '');

            output += '</div>';

            if (!showIncome) {
              output += '</div>';
              return output;
            }

            const incomeTotal = params.reduce((acc: number, item: any) => {
              if (incomeCategories.map((category: ChartCategory) => category.name).includes(item.seriesName)) {
                acc += item.value;
              }
              return acc;
            }, 0);

            output += generateIncomeHeader(incomeTotal, currencySign);

            output += params.reduce((acc: string, item: any) => {
              if (incomeCategories.map((item: ChartCategory) => item.name).includes(item.seriesName)) {
                const isHovered = item.componentIndex === highlightedIndexRef.current;
                acc += generateCategoryRow(item, isHovered, currencySign, true);
              }
              return acc;
            }, '');

            params.forEach((item: any) => {
              if (item.seriesName === 'Difference') {
                output += generateBalanceRow(item, currencySign);
              }
            });

            output += '</div></div>';
            return output;
          }
          return params.seriesName + ' ' + params.value.toFixed(2);
        },
      },
    };

    setOptions(optionsLocal);
  }, [chartData, showIncome, isDataLoading]);

  const onChartHover = React.useCallback((param, echart) => {
    highlightedIndexRef.current = param.componentIndex;
  }, []);

  const chartEvents = React.useMemo(
    () => ({
      mouseover: onChartHover,
    }),
    [onChartHover]
  );

  return (
    <div className="flex flex-col relative gap-2 h-full">
      <div className="flex flex-row justify-center">
        <RangeSwitcher
          dateFrom={dateFrom}
          dateTo={dateTo}
          clickBack={() => setDate(subMonths(date, 1))}
          clickForward={() => setDate(addMonths(date, 1))}
        />
      </div>
      <div className="flex justify-start">
        <div className="flex items-center gap-2 m-3">
          <Checkbox checked={showUpToDay} onClick={() => setShowUpToDay(!showUpToDay)} />
          <span className="flex items-center text-sm">Show till this</span>
          <Select defaultValue={upToDay} onValueChange={setUpToDay}>
            <SelectTrigger className="relative bg-white h-8 w-14">
              <SelectValue placeholder="Show up to this day" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Day</SelectLabel>
                {monthDayArray.map((day: number, index: number) => (
                  <SelectItem value={day} key={index}>
                    {day}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <span className="flex items-center text-sm">day of each month</span>
          <Checkbox checked={showIncome} onClick={() => setShowIncome(!showIncome)} />
          <span className="flex items-center text-sm">Show income</span>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ReactECharts
          option={options}
          notMerge={true}
          onEvents={chartEvents}
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    </div>
  );
};

export default EChartReport;
