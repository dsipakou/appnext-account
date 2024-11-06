// External
import React from 'react'
import { CalendarIcon } from 'lucide-react'
// UI
import * as Crd from '@/components/ui/card'
// Hooks
import { useCurrencies } from '@/hooks/currencies'
import { useGetUpcommingBudget } from '@/hooks/budget'
// Types
import { BudgetItem } from '@/components/budget/types'
import { Currency } from '@/components/currencies/types'
// Utils
import { getRelativeDate } from '@/utils/dateUtils'

const UpcommingExpenses = () => {
  const { data: upcomingExpenses = [] } = useGetUpcommingBudget()
  const { data: currencies = [] } = useCurrencies()

  return (
    <Crd.Card className="shadow-md hover:shadow-lg transition-all duration-300 bg-white">
      <Crd.CardHeader className="pb-2">
        <Crd.CardTitle className="flex items-center text-gray-700 text-xl">
          <CalendarIcon className="w-6 h-6 mr-2 text-gray-500" />
          Upcoming Expenses
        </Crd.CardTitle>
      </Crd.CardHeader>
      <Crd.CardContent className="pt-2">
        <ul className="space-y-2">
          {upcomingExpenses.map((item: BudgetItem) => (
            <li key={item.uuid} className="flex justify-between items-center text-sm py-2 border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-150 rounded-md px-2">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full mr-2 bg-yellow-300"></span>
                <span className="text-xs w-16 text-gray-500 mr-2">{getRelativeDate(item.budgetDate)}</span>
                <span className="font-medium truncate w-40">{item.title}</span>
              </span>
              <span className="flex items-center space-x-2">
                <span className="font-semibold text-gray-700">
                  {item.amount.toFixed(2)}
                  {currencies.find((currency: Currency) => currency.uuid === item.currency)?.sign}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Crd.CardContent>
    </Crd.Card>
  )
}

export default UpcommingExpenses
