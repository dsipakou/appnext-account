// External
import { ArrowDownIcon, TrendingUpIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React from 'react';

// Internal
import { useStore } from '@/app/store';
// Types
import { TransactionResponse } from '@/components/transactions/types';
// UI
import * as Crd from '@/components/ui/card';
// Hooks
import { useTransactions } from '@/hooks/transactions';

const RecentTransactions = () => {
  const { data: recentTransactions = [] } = useTransactions({ limit: 6 });

  const currencySign = useStore((state) => state.currency.sign);
  const {
    data: { user: authUser },
  } = useSession();

  return (
    <Crd.Card className="bg-white shadow-md transition-all duration-300 hover:shadow-lg">
      <Crd.CardHeader className="pb-2">
        <Crd.CardTitle className="flex items-center text-xl text-gray-700">
          <TrendingUpIcon className="mr-2 h-6 w-6 text-gray-500" />
          Recent Transactions
        </Crd.CardTitle>
      </Crd.CardHeader>
      <Crd.CardContent className="pt-2">
        <ul className="space-y-2">
          {recentTransactions.map((transaction: TransactionResponse) => (
            <li
              key={transaction.uuid}
              className="flex items-center justify-between rounded-md border-b px-2 py-2 text-sm transition-colors duration-150 last:border-b-0 hover:bg-gray-50"
            >
              <span className="flex items-center">
                <span className="mr-2 h-2 w-2 rounded-full bg-red-300"></span>
                <div className="w-64">
                  <span className="w-[30%] truncate font-medium">{transaction.budgetDetails.title}</span>
                  <span className="ml-3 w-[70%] truncate text-gray-400">{transaction.categoryDetails.parentName}</span>
                </div>
              </span>
              <span className="flex items-center">
                <span className="font-semibold text-red-600">
                  {Math.abs(transaction.spentInCurrencies[authUser?.currency]).toFixed(2)} {currencySign}
                </span>
                <ArrowDownIcon className="ml-1 h-4 w-4 text-red-600" />
              </span>
            </li>
          ))}
        </ul>
      </Crd.CardContent>
    </Crd.Card>
  );
};

export default RecentTransactions;
