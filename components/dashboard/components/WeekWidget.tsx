import React from 'react'
import { useStore } from '@/app/store'
import { useSession } from 'next-auth/react'
import { useBudgetWeek } from '@/hooks/budget'
import { WeekBudgetResponse, WeekBudgetItem } from '@/components/budget/types'
import { Progress } from '@/components/ui/progress'
import {
  getStartOfWeek,
  getEndOfWeek
} from '@/utils/dateUtils'

const WeekWidget = () => {
  const currencySign = useStore((state) => state.currencySign)
  const { data: { user: authUser } } = useSession()
  const { data: plannedBudget = [] }: WeekBudgetResponse = useBudgetWeek(
    getStartOfWeek(new Date()),
    getEndOfWeek(new Date()),
    'all'
  )

  const planned: number = plannedBudget.reduce((acc: number, item: WeekBudgetItem) => acc + (item.plannedInCurrencies[authUser?.currency]), 0).toFixed(2)
  const spent: number = plannedBudget.reduce((acc: number, item: WeekBudgetItem) => acc + (item.spentInCurrencies[authUser?.currency] || 0), 0).toFixed(2)
  const percentage: number = Math.floor(spent * 100 / planned)

  return (
    <div className="flex flex-col w-full h-60 bg-white p-4 rounded-md shadow-md">
      <span className="text-2xl font-bold">This week</span>
      <div className="flex flex-col justify-center h-full">
        <div className="flex mt-3 gap-1 text-lg">
          <span className="font-semibold">{spent}</span>
          <span>of</span>
          <span className="font-semibold">{planned} {currencySign}</span>
          <span>spent</span>
        </div>
        <div className="relative">
          <Progress
            className={`h-8 rounded-sm ${percentage > 100 ? 'bg-red-200' : 'bg-gray-300'}`}
            indicatorclassname={`${percentage > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
            value={percentage > 100 ? percentage % 100 : percentage}
          />
          <div className="absolute top-0 w-full h-full">
            <span className="flex text-white text-lg font-semibold h-full items-center justify-center">
              <div className="flex gap-2 items-center">{percentage}%</div>
            </span>
          </div>
        </div>
        <span className="mt-3">{plannedBudget.reduce((acc: number, item: WeekBudgetItem) => {
          if (item.isCompleted) {
            acc += 1
          }
          return acc
        }, 0)} of {plannedBudget.length} budgets completed</span>
      </div>
    </div>
  )
}

export default WeekWidget
