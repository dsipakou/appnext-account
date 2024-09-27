import React from 'react'
import ReactECharts from 'echarts-for-react'
import { useSession } from 'next-auth/react'
import { useStore } from '@/app/store'
// Types
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
  const { data: { user } } = useSession()
  const currencySign = useStore((state) => state.currencySign)

  const groupedTransactions = React.useMemo(() => transactions.reduce((acc, item: TransactionResponse) => {
    const summ = (acc[item.categoryDetails.parentName] || 0) + item.spentInCurrencies[user?.currency]
    acc[item.categoryDetails.parentName] = summ
    return acc
  }, {}), [transactions])
  const totalAmount = React.useMemo(() => transactions.reduce((sum, item) => sum + item.spentInCurrencies[user?.currency] || 0, 0), [transactions])

  React.useEffect(() => {
    const chartData: ChartData[] = Object.keys(groupedTransactions).map(key => {
      return { name: key, value: Number(groupedTransactions[key].toFixed(2)) }
    })

    setOptions({
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          const { name, value, percent } = params
          return `
          <div class="font-sans p-1">
            <div class="font-bold text-lg mb-1">${name}</div>
            <div class="text-sm">
              <div>Spent: <strong>${value.toFixed(2)}</strong> ${currencySign}</div>
            </div>
          </div>
        `
        },
        extraCssText: 'box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); border-radius: 4px;'
      },
      label: {
        show: true,
        position: 'outside'
      },
      series: [
        {
          name: 'Expenses',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'inside',
            formatter: (params) => {
              const percent = params.percent
              return percent < 2 ? `{d|${percent.toFixed(1)}%}` : `{d|${Math.round(percent)}%}`
            },
            fontSize: 12,
            fontWeight: 'bold',
            color: '#fff',
            rich: {
              d: {
                fontSize: 12,
                fontWeight: 'bold',
                padding: [2, 4],
                borderRadius: 2
              }
            }
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: chartData
        }
      ]
    })
  }, [transactions])

  return (
    <div className="w-full h-[330px] relative">
      <ReactECharts
        style={{ height: '100%', width: '100%' }}
        option={options}
        notMerge={true}
      />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-2xl font-bold">{totalAmount.toFixed(2)} {currencySign}</p>
        <p className="text-sm text-gray-500"><span className="font-semibold">{transactions.length}</span> records</p>
      </div>
    </div>
  )
}

export default DailyChart
