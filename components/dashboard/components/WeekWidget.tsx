import React from 'react'
import { BarChartIcon } from 'lucide-react'
import ReactECharts from 'echarts-for-react'
import { useStore } from '@/app/store'
import { useSession } from 'next-auth/react'
import { useBudgetWeek } from '@/hooks/budget'
import { WeekBudgetResponse, WeekBudgetItem } from '@/components/budget/types'
import * as Crd from '@/components/ui/card'
import {
  getStartOfWeek,
  getEndOfWeek
} from '@/utils/dateUtils'
import { parseDate, getFormattedDate } from '@/utils/dateUtils'

interface WeeklySummary {
  name: string
  index: number
  planned: number
  actual: number
}


function getMappedWeekdayIndex(dateStr: Date): number {
  const date = new Date(dateStr);
  const weekday = date.getDay();
  return (weekday === 0) ? 6 : weekday - 1;
}

const WeekWidget = () => {
  const currencySign = useStore((state) => state.currencySign)
  const [weeklySummary, setWeeklySummary] = React.useState<WeeklySummary[]>([])
  const { data: { user: authUser } } = useSession()
  const { data: budget = [] }: WeekBudgetResponse = useBudgetWeek(
    getStartOfWeek(new Date()),
    getEndOfWeek(new Date()),
    'all'
  )
  React.useEffect(() => {
    const template = Array(7).fill(0).map(() => ({
      name: '',
      index: 0,
      planned: 0,
      actual: 0,
    }));

    budget.forEach((item: WeekBudgetItem) => {
      const weekday = getMappedWeekdayIndex(parseDate(item.budgetDate))

      if (!template[weekday].name) {
        template[weekday].name = getFormattedDate(parseDate(item.budgetDate), 'EEE')
      }
      template[weekday].planned += item.plannedInCurrencies[authUser?.currency]
      template[weekday].actual += item.spentInCurrencies[authUser?.currency] || 0
    })
    setWeeklySummary(template)
  }, [budget])

  const weekSpendingOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['Planned', 'Actual']
    },
    xAxis: {
      data: weeklySummary.map(item => item.name)
    },
    yAxis: {},
    series: [
      {
        name: 'Planned',
        type: 'bar',
        data: weeklySummary.map(item => item.planned.toFixed(2)),
        color: '#3B82F6'
      },
      {
        name: 'Actual',
        type: 'bar',
        data: weeklySummary.map(item => item.actual.toFixed(2)),
        color: '#10B981'
      }
    ]
  }

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
  )
}

export default WeekWidget
