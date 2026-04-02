import React from 'react';
import { BarChartIcon } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useStore } from '@/app/store';
import { useSession } from 'next-auth/react';
import { useBudgetWeek } from '@/hooks/budget';
import { WeekBudgetResponse, WeekBudgetItem } from '@/components/budget/types';
import * as Crd from '@/components/ui/card';
import { getStartOfWeek, getEndOfWeek } from '@/utils/dateUtils';
import { parseDate, getFormattedDate } from '@/utils/dateUtils';

interface WeeklySummary {
  name: string;
  index: number;
  planned: number;
  actual: number;
}

function getMappedWeekdayIndex(dateStr: Date): number {
  const date = new Date(dateStr);
  const weekday = date.getDay();
  return weekday === 0 ? 6 : weekday - 1;
}

const WeekWidget = () => {
  const currencySign = useStore((state) => state.currency.sign);
  const [weeklySummary, setWeeklySummary] = React.useState<WeeklySummary[]>([]);
  const {
    data: { user: authUser },
  } = useSession();
  const { data: budget = [] }: WeekBudgetResponse = useBudgetWeek(
    getStartOfWeek(new Date()),
    getEndOfWeek(new Date()),
    'all'
  );
  React.useEffect(() => {
    const template = Array(7)
      .fill(0)
      .map(() => ({
        name: '',
        index: 0,
        planned: 0,
        actual: 0,
      }));

    budget.forEach((item: WeekBudgetItem) => {
      const weekday = getMappedWeekdayIndex(parseDate(item.budgetDate));

      if (!template[weekday].name) {
        template[weekday].name = getFormattedDate(parseDate(item.budgetDate), 'EEE');
      }
      template[weekday].planned += item.plannedInCurrencies[authUser?.currency];
      template[weekday].actual += item.spentInCurrencies[authUser?.currency] || 0;
    });
    setWeeklySummary(template);
  }, [budget]);

  const weekSpendingOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any[]) => {
        const planned = params.find((p) => p.seriesName === 'Planned');
        const actual = params.find((p) => p.seriesName === 'Actual');
        const day = params[0]?.axisValue ?? '';
        return `
          <div class="font-sans p-1">
            <div class="font-bold mb-1">${day}</div>
            <div class="text-sm">
              <div>Planned: <strong>${Number(planned?.value ?? 0).toFixed(2)}</strong> ${currencySign}</div>
              <div>Actual: <strong>${Number(actual?.value ?? 0).toFixed(2)}</strong> ${currencySign}</div>
            </div>
          </div>
        `;
      },
      extraCssText: 'box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-radius: 4px;',
    },
    legend: {
      data: ['Planned', 'Actual'],
      top: 0,
      textStyle: { color: '#6B7280' },
    },
    grid: {
      top: '12%',
      left: '3%',
      right: '3%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      data: weeklySummary.map((item) => item.name),
      axisLabel: { color: '#6B7280', fontWeight: 500 },
      axisLine: { lineStyle: { color: '#E5E7EB' } },
    },
    yAxis: {
      type: 'value',
      splitNumber: 4,
      axisLabel: { color: '#9CA3AF' },
      splitLine: { lineStyle: { color: '#F3F4F6' } },
    },
    series: [
      {
        name: 'Planned',
        type: 'bar',
        data: weeklySummary.map((item) => item.planned.toFixed(2)),
        itemStyle: {
          color: '#3B82F6',
          borderRadius: [6, 6, 0, 0],
        },
        emphasis: {
          focus: 'series',
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' },
        },
      },
      {
        name: 'Actual',
        type: 'bar',
        data: weeklySummary.map((item) => item.actual.toFixed(2)),
        itemStyle: {
          color: '#10B981',
          borderRadius: [6, 6, 0, 0],
        },
        emphasis: {
          focus: 'series',
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' },
        },
      },
    ],
  };

  return (
    <Crd.Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 lg:col-span-2">
      <Crd.CardHeader className="pb-2">
        <Crd.CardTitle className="flex items-center text-gray-700">
          <BarChartIcon className="w-6 h-6 mr-2 text-gray-500" />
          Week Budget
        </Crd.CardTitle>
      </Crd.CardHeader>
      <Crd.CardContent className="pt-4">
        <ReactECharts option={weekSpendingOption} style={{ height: '250px' }} />
      </Crd.CardContent>
    </Crd.Card>
  );
};

export default WeekWidget;
