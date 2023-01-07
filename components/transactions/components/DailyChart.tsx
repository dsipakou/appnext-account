import dynamic from 'next/dynamic'
import React from 'react'
import { TransactionResponse } from '@/components/transactions/types'
import { useAuth } from '@/context/auth'
import { formatMoney } from '@/utils/numberUtils'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface Types {
  transactions: TransactionResponse[]
}

const DailyChart: React.FC<Types> = ({ transactions }) => {
  const [groupedTransactions, setGroupedTransactions] = React.useState([])
  const { user } = useAuth()
  React.useEffect(() => {
    if (!transactions) return

    setGroupedTransactions(transactions?.reduce((acc, item: TransactionResponse) => {
      const summ = (acc[item.categoryDetails.parentName] || 0) + item.spentInCurrencies[user?.currency]
      acc[item.categoryDetails.parentName] = Number(formatMoney(summ))
      return acc
    }, {}))
  }, [transactions])

  return (
    <Chart
      type="donut"
      series={Object.values(groupedTransactions)}
      options={{
        labels: Object.keys(groupedTransactions)
      }}
      width="400"
    />
  )
}

export default DailyChart
