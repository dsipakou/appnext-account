import React from 'react'
import ReactECharts from 'echarts-for-react'
import { useSession } from 'next-auth/react'
import { useStore } from '@/app/store'
import { useBudgetMonth } from '@/hooks/budget'
import {
  getStartOfMonth,
  getEndOfMonth
} from '@/utils/dateUtils'
import { GroupedByCategoryBudget } from '@/components/budget/types'

const WeekWidget = () => {
  const [options, setOptions] = React.useState<object>({})
  const { data: { user: authUser } } = useSession()
  const { data: budget = [] } = useBudgetMonth(getStartOfMonth(new Date()), getEndOfMonth(new Date()), 'all')
  const currencySign = useStore((state) => state.currencySign)

  React.useEffect(() => {
    setOptions({
      tooltip: {
        trigger: 'item',
        formatter: `{b}: {c} ${currencySign}`
      },
      label: {
        show: true,
        position: 'outside'
      },
      series: [
        {
          name: 'Spent',
          type: 'pie',
          radius: ['60%', '90%'],
          avoidLabelOverlap: false,
          padAngle: 2,
          itemStyle: {
            borderRadius: 3
          },
          label: {
            show: true,
            position: 'inside',
            formatter: '{d}%'

          },
          labelLine: {
            length: 30
          },
          emphasis: {
            label: {
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          data: budget.map((item: GroupedByCategoryBudget) => {
            return {
              name: item.categoryName,
              value: item.spentInCurrencies[authUser?.currency]?.toFixed(2) || 0
            }
          })
        }
      ]
    })
  }, [budget])

  return (
    <div className="flex flex-col w-full h-60 bg-white p-4 rounded-md shadow-md">
      <span className="text-2xl font-bold">This month</span>
      <div className="flex w-full h-full">
        <div className="flex flex-col justify-center w-full h-full">
          <span className="text-lg font-bold mt-1">Your plans</span>
          <span className="">{budget.reduce((acc: number, item: GroupedByCategoryBudget) => {
            return acc + item.plannedInCurrencies[authUser?.currency]
          }, 0) || 0} {currencySign}</span>
          <span className="text-lg font-bold mt-1">Your spendings</span>
          <span className="">{budget.reduce((acc: number, item: GroupedByCategoryBudget) => {
            return acc + item.spentInCurrencies[authUser?.currency]
          }, 0) || 0} {currencySign}</span>
        </div>
        <div className="flex w-full h-full">
          <ReactECharts style={{ width: '100%', height: '100%' }} option={options} notMerge={true} />
        </div>
      </div>
    </div>
  )
}

export default WeekWidget
