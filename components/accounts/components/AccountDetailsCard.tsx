import React from 'react';
import { useStore } from '@/app/store'
import { ArrowDownRight, ArrowUpRight, DollarSign } from 'lucide-react';
import { ProgressBar } from '@/components/accounts/components/ProgressBar';

interface AccountDetailsCardProps {
  month: string;
  income: number
  spendings: number
}

const AccountDetailsCard = ({ month, income, spendings }: AccountDetailsCardProps) => {
  const spendingRatio = income !== 0 ? (spendings / income) * 100 : 100
  const savingsRatio = 100 - spendingRatio
  const currencySign = useStore((state) => state.currencySign)

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{month}</h3>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-full">
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-600">Income</span>
            </div>
            <span className="text-green-600 font-medium">{income.toFixed(2)} {currencySign}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-full">
                <ArrowDownRight className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-gray-600">Expenses</span>
            </div>
            <span className="text-red-600 font-medium">{spendings.toFixed(2)} {currencySign}</span>
          </div>
        </div>

        <div className="space-y-4">
          <ProgressBar
            value={spendings}
            maxValue={income}
            colorClass="bg-red-500"
            label="Spending Rate"
          />
          <ProgressBar
            value={Math.max(income - spendings, 0)}
            maxValue={income !== 0 ? income : spendings}
            colorClass="bg-green-500"
            label="Savings Rate"
          />
        </div>

        <div className="pt-4 border-t">
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
              <p className="text-lg font-semibold text-gray-800">
                {spendingRatio.toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-gray-600">Savings Ratio</p>
              <p className="text-lg font-semibold text-gray-800">
                {savingsRatio.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountDetailsCard;
