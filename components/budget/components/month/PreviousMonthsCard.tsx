import React from 'react'
import ReactECharts from 'echarts-for-react'
import { useStore } from '@/app/store'
import { useBudgetLastMonthsUsage } from '@/hooks/budget'
import { MonthSummedUsage } from '../../types'
import { parseAndFormatDate, MONTH_ONLY_FORMAT } from '@/utils/dateUtils'

interface Types {
  month: string
  category: string
}

const PreviousMonthsCard: React.FC<Types> = ({ month, category }) => {
  const [options, setOptions] = React.useState({})
  const {
    data: lastMonths = []
  } = useBudgetLastMonthsUsage(month, category)
  const currencySign = useStore((state) => state.currencySign)

  React.useEffect(() => {
    const optionsLocal = {
      xAxis: {
        type: 'category',
        data: lastMonths.map((item: MonthSummedUsage) => parseAndFormatDate(item.month, MONTH_ONLY_FORMAT))
      },
      yAxis: {
        type: 'value',
        minInterval: 100,
        maxInterval: 20000,
        splitNumber: 5
      },
      grid: {
        top: '10%',
        left: '3%',
        right: '3%',
        bottom: '3%',
        containLabel: true
      },
      series: {
        name: 'Spent',
        data: lastMonths.map((item: MonthSummedUsage) => item.amount),
        type: 'bar',
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.3)'
          }
        },
        label: {
          show: true,
          fontSize: 10,
          formatter: (params) => params.value > 1000 ? Number(params.value / 1000).toFixed(2) + 'k ' + currencySign : Number(params.value).toFixed(0) + ' ' + currencySign,
          textBorderColor: 'white',
          textBorderWidth: 3,
          color: 'black'
        },
        itemStyle: {
          color: '#93c5fd',
          borderRadius: [8, 8, 0, 0]
        }
      },
      tooltip: {
        formatter: '{b}:  {c}' + currencySign
      }
    }

    setOptions(optionsLocal)
  }, [lastMonths])

  return (
    <div className="flex flex-col w-full h-full">
      <div>
        <span className="text-xl font-semibold">Previous 6 months</span>
      </div>
      <div className="flex h-44 justify-center w-full align-center">
        <ReactECharts style={{ height: '100%', width: '100%' }} option={options} notMerge={true} />
      </div>
    </div>
  )
}

export default PreviousMonthsCard
