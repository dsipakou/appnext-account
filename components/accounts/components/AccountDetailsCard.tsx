import { ArrowDownRight, ArrowUpRight, DollarSign } from 'lucide-react';
import React from 'react';

import { useStore } from '@/app/store';
import { ProgressBar } from '@/components/accounts/components/ProgressBar';
import { getFormattedDate } from '@/utils/dateUtils';

interface AccountDetailsCardProps {
  month: string;
  income: number;
  spendings: number;
}

const AccountDetailsCard: React.FC<AccountDetailsCardProps> = ({ month, income, spendings }) => {
  const formattedMonth = getFormattedDate(new Date(month), 'yyyy MMM');
  const hasIncome = income > 0;
  const hasExpenses = spendings > 0;
  const spendingRatio = hasIncome ? (spendings / income) * 100 : hasExpenses ? 100 : 0;
  const savingsRatio = hasIncome ? 100 - spendingRatio : 0;
  const currencySign = useStore((state) => state.currency.sign);

  return (
    <div className="flex h-full flex-col rounded-lg bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">{formattedMonth}</h3>

      <div className="flex flex-1 flex-col">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-green-100 p-2">
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-gray-600">Income</span>
            </div>
            {hasIncome ? (
              <span className="font-medium text-green-600">
                {income.toFixed(2)} {currencySign}
              </span>
            ) : (
              <span className="text-gray-400">No income</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-red-100 p-2">
                <ArrowDownRight className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-gray-600">Expenses</span>
            </div>
            {hasExpenses ? (
              <span className={`font-medium ${hasIncome ? 'text-red-600' : 'text-gray-600'}`}>
                {spendings.toFixed(2)} {currencySign}
              </span>
            ) : (
              <span className="text-gray-400">No expenses</span>
            )}
          </div>
        </div>

        {(hasIncome || hasExpenses) && (
          <div className="mt-6 space-y-4">
            <ProgressBar
              value={spendings}
              maxValue={hasIncome ? income : spendings}
              colorClass={hasIncome ? 'bg-red-500' : 'bg-gray-500'}
              label="Spending Rate"
            />
            {hasIncome && (
              <ProgressBar
                value={Math.max(income - spendings, 0)}
                maxValue={income}
                colorClass="bg-green-500"
                label="Savings Rate"
              />
            )}
          </div>
        )}

        <div className="mt-auto border-t pt-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-blue-100 p-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-gray-600">Monthly Stats</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg bg-gray-100 p-3">
              <p className="text-gray-600">Spending Ratio</p>
              {hasIncome || hasExpenses ? (
                <p className="text-lg font-semibold text-gray-800">{spendingRatio.toFixed(1)}%</p>
              ) : (
                <p className="text-lg font-semibold text-gray-400">-</p>
              )}
            </div>
            <div className="rounded-lg bg-gray-100 p-3">
              <p className="text-gray-600">Savings Ratio</p>
              {hasIncome ? (
                <p className="text-lg font-semibold text-gray-800">{savingsRatio.toFixed(1)}%</p>
              ) : (
                <p className="text-lg font-semibold text-gray-400">-</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailsCard;
