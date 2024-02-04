import { FC } from 'react'
import { useBudgetLastMonthsUsage } from '@/hooks/budget'
import { useSession } from 'next-auth/react'
import { MonthSummedUsage } from '../../types'
import { parseAndFormatDate, MONTH_ONLY_FORMAT } from '@/utils/dateUtils'
import { calculatePercentage } from '@/utils/numberUtils'

interface Types {
  month: string
  category: string
}

const PreviousMonthsCard: FC<Types> = ({month, category}) => {
  const {
    data: lastMonths = [],
  } = useBudgetLastMonthsUsage(month, category)

  const minValue = Math.min(...lastMonths.map((item: MonthSummedUsage) => item.amount)) || 1
  const maxValue = Math.max(...lastMonths.map((item: MonthSummedUsage) => item.amount)) || 1

  return (
    <div className="flex flex-col w-full h-full">
      <div>
        <span className="text-xl font-semibold">Previous 6 months</span>
      </div>
      <div className="flex h-full justify-center align-bottom">
        {lastMonths.map((item: MonthSummedUsage, index: number) => (
          <div className="flex flex-col h-full" key={index}>
            <div className="flex flex-col h-full justify-end items-center">
              <div className="flex flex-col h-full justify-end items-center text-yellow-100">
                <span className="flex text-xs h-0 z-10">
                  <span className="font-semibold">{item.amount}</span>
                </span>
                <div
                  className="flex w-8 bg-yellow-400 mx-1 rounded-t-lg rounded-b-sm"
                  style={{height: `${calculatePercentage(item.amount, minValue, maxValue)}%`}}
                ></div>
              </div>
              <span className="flex text-xs font-semibold justify-center">
                {parseAndFormatDate(item.month, MONTH_ONLY_FORMAT)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PreviousMonthsCard
