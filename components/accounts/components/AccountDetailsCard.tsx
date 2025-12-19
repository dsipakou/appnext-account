import React from 'react';
import { useStore } from '@/app/store';
import { ArrowDownRight, ArrowUpRight, DollarSign } from 'lucide-react';
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
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{formattedMonth}</h3>

      <div className="flex flex-col flex-1">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-full">
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-600">Income</span>
            </div>
            {hasIncome ? (
              <span className="text-green-600 font-medium">
                {income.toFixed(2)} {currencySign}
              </span>
            ) : (
              <span className="text-gray-400">No income</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-full">
                <ArrowDownRight className="w-5 h-5 text-red-600" />
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
          <div className="space-y-4 mt-6">
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

        <div className="mt-auto pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-600">Monthly Stats</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-gray-600">Spending Ratio</p>
              {hasIncome || hasExpenses ? (
                <p className="text-lg font-semibold text-gray-800">{spendingRatio.toFixed(1)}%</p>
              ) : (
                <p className="text-lg font-semibold text-gray-400">-</p>
              )}
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
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
