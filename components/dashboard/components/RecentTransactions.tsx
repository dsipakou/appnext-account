// External
import React from 'react';
import { TrendingUpIcon, ArrowDownIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
// Internal
import { useStore } from '@/app/store';
// UI
import * as Crd from '@/components/ui/card';
// Hooks
import { useTransactions } from '@/hooks/transactions';
// Types
import { TransactionResponse } from '@/components/transactions/types';

const RecentTransactions = () => {
  const { data: recentTransactions = [] } = useTransactions({ limit: 6 });

  const currencySign = useStore((state) => state.currency.sign);
  const {
    data: { user: authUser },
  } = useSession();

  return (
    <Crd.Card className="shadow-md hover:shadow-lg transition-all duration-300 bg-white">
      <Crd.CardHeader className="pb-2">
        <Crd.CardTitle className="flex items-center text-gray-700 text-xl">
          <TrendingUpIcon className="w-6 h-6 mr-2 text-gray-500" />
          Recent Transactions
        </Crd.CardTitle>
      </Crd.CardHeader>
      <Crd.CardContent className="pt-2">
        <ul className="space-y-2">
          {recentTransactions.map((transaction: TransactionResponse) => (
            <li
              key={transaction.uuid}
              className="flex justify-between items-center text-sm py-2 border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-150 rounded-md px-2"
            >
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full mr-2 bg-red-300"></span>
                <div className="w-64">
                  <span className="font-medium truncate w-[30%]">{transaction.budgetDetails.title}</span>
                  <span className="ml-3 text-gray-400 w-[70%] truncate">{transaction.categoryDetails.parentName}</span>
                </div>
              </span>
              <span className="flex items-center">
                <span className="font-semibold text-red-600">
                  {Math.abs(transaction.spentInCurrencies[authUser?.currency]).toFixed(2)} {currencySign}
                </span>
                <ArrowDownIcon className="ml-1 w-4 h-4 text-red-600" />
              </span>
            </li>
          ))}
        </ul>
      </Crd.CardContent>
    </Crd.Card>
  );
};

export default RecentTransactions;
