import React from 'react'
import { useSession } from 'next-auth/react'
import { useBudgetWeek } from '@/hooks/budget'
import { WeekBudgetResponse, CompactWeekItem, WeekBudgetItem } from '@/components/budget/types'
import {
  getStartOfWeek,
  getEndOfWeek
} from '@/utils/dateUtils'

const WeekWidget = () => {
  const { data: { user: authUser }} = useSession()
  const { data: plannedBudget = [] }: WeekBudgetResponse = useBudgetWeek(
    getStartOfWeek(new Date()),
    getEndOfWeek(new Date()),
    'all',
  )

  console.log(plannedBudget)

  return (
    <div className="flex flex-col w-full h-60 bg-white p-4 rounded-md shadow-md">
      <span className="text-2xl font-bold">This week</span>
      <span className="text-xl ml-2">Spent</span>
      <div className="w-2/3 bg-sky-400 p-1 text-white font-bold mb-1">{plannedBudget.reduce((acc: number, item: WeekBudgetItem) => {
        console.log(item.spentInCurrencies[authUser?.currency])
        return acc + (item.spentInCurrencies[authUser?.currency] || 0)
      }, 0).toFixed(2)}</div>
      <span className="text-xl ml-2">Planned</span>
      <div className="w-3/4 bg-sky-500 p-1 text-white font-bold mb-1">
        {plannedBudget.reduce((acc: number, item: WeekBudgetItem) => {
          return acc + item.plannedInCurrencies[authUser?.currency]
        }, 0).toFixed(2)}
      </div>
      <span className="text-xl ml-2">Budget Completed</span>
      <span>{plannedBudget.reduce((acc: number, item: WeekBudgetItem) => {
        if (item.isCompleted) {
          acc += 1
        }
        return acc
      }, 0)} of {plannedBudget.length}</span>
    </div>
  )
}

export default WeekWidget
