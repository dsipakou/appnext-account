import React from 'react'
import ReactECharts from 'echarts-for-react'
import { useSession } from 'next-auth/react'

import { useStore } from '@/app/store'
import { TransactionResponse } from '@/components/transactions/types'

interface Types {
  transactions: TransactionResponse[]
}

interface ChartData {
  name: string
  value: number
}

const DailyChart: React.FC<Types> = ({ transactions }) => {
  const [options, setOptions] = React.useState<object>({})
  const { data: { user }} = useSession()
  const currencySign = useStore((state) => state.currencySign)

  React.useEffect(() => {
    if (!transactions) return

    const groupedTransactions = transactions?.reduce((acc, item: TransactionResponse) => {
      const summ = (acc[item.categoryDetails.parentName] || 0) + item.spentInCurrencies[user?.currency]
      acc[item.categoryDetails.parentName] = summ
      return acc
    }, {})

    const chartData: ChartData[] = Object.keys(groupedTransactions).map(key => {
      return { name: key, value: Number(groupedTransactions[key].toFixed(2)) }
    });

    setOptions({
      tooltip: {
        trigger: 'item'
      },
      legend: {
        bottom: -5,
        left: 'center'
      },
      label: {
        show: true,
        position: 'outside',
      },
      series: [
        {
          name: 'Spent',
          type: 'pie',
          radius: ['40%', '70%'],
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
          labelLine: {
            show: false
          },
          data: chartData,
        }
      ]
    })
  }, [transactions])

  return (
    <div className="flex w-full">
      <ReactECharts style={{width: '100%'}} option={options} notMerge={true} />
    </div>
  )
}

export default DailyChart
