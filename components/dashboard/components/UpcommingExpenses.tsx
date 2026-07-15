// External
import { CalendarIcon } from 'lucide-react';
import React from 'react';

// Types
import { BudgetItem } from '@/components/budget/types';
import { Currency } from '@/components/currencies/types';
// UI
import * as Crd from '@/components/ui/card';
import { useGetUpcommingBudget } from '@/hooks/budget';
// Hooks
import { useCurrencies } from '@/hooks/currencies';
// Utils
import { getRelativeDate } from '@/utils/dateUtils';

const UpcommingExpenses = () => {
  const { data: upcomingExpenses = [] } = useGetUpcommingBudget();
  const { data: currencies = [] } = useCurrencies();

  return (
    <Crd.Card className="bg-white shadow-md transition-all duration-300 hover:shadow-lg">
      <Crd.CardHeader className="pb-2">
        <Crd.CardTitle className="flex items-center text-xl text-gray-700">
          <CalendarIcon className="mr-2 h-6 w-6 text-gray-500" />
          Upcoming Expenses
        </Crd.CardTitle>
      </Crd.CardHeader>
      <Crd.CardContent className="pt-2">
        <ul className="space-y-2">
          {upcomingExpenses.map((item: BudgetItem) => (
            <li
              key={item.uuid}
              className="flex items-center justify-between rounded-md border-b px-2 py-2 text-sm transition-colors duration-150 last:border-b-0 hover:bg-gray-50"
            >
              <span className="flex items-center">
                <span className="mr-2 h-2 w-2 rounded-full bg-yellow-300"></span>
                <span className="mr-2 w-16 text-xs text-gray-500">{getRelativeDate(item.budgetDate)}</span>
                <span className="w-40 truncate font-medium">{item.title}</span>
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
  );
};

export default UpcommingExpenses;
