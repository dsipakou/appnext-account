import { Calendar, CheckCircle, DollarSign, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React from 'react';

import { useStore } from '@/app/store';
import { BudgetItem } from '@/components/budget/types';
import { Category } from '@/components/categories/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useOccasionalBudgets } from '@/hooks/budget';
import { useCategories } from '@/hooks/categories';
import { cn } from '@/lib/utils';
import { getFormattedDate, parseDate } from '@/utils/dateUtils';
import { formatMoney } from '@/utils/numberUtils';

interface OccasionalBudgetItemProps {
  budget: BudgetItem;
  categories: Category[];
  currencySign: string;
}

const OccasionalBudgetItem: React.FC<OccasionalBudgetItemProps> = ({ budget, categories, currencySign }) => {
  const getCategoryIcon = (uuid: string) => categories.find((cat) => cat.uuid === uuid)?.icon || '📝';

  const getCategoryName = (uuid: string) => categories.find((cat) => cat.uuid === uuid)?.name || 'Unknown';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-md transition-shadow hover:shadow-lg">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getCategoryIcon(budget.category)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{budget.title}</h3>
            <p className="text-sm text-gray-500">{getCategoryName(budget.category)}</p>
          </div>
        </div>
        {budget.isCompleted && <CheckCircle className="h-6 w-6 text-green-500" />}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>Amount</span>
          </div>
          <span className="font-medium">
            {formatMoney(parseFloat(budget.amount))} {currencySign}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Date</span>
          </div>
          <span>{getFormattedDate(budget.budgetDate, 'MMM dd, yyyy')}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <User className="h-4 w-4" />
            <span>User</span>
          </div>
          <Badge variant="secondary">{budget.user}</Badge>
        </div>

        {budget.description && (
          <div className="mt-3 rounded bg-gray-50 p-2 text-sm text-gray-700">{budget.description}</div>
        )}
      </div>
    </div>
  );
};

const Container: React.FC = () => {
  const { data: session } = useSession();
  const currencySign = useStore((state) => state.currency.sign);

  const { data: budgets = [], isLoading, isError } = useOccasionalBudgets();
  const { data: categories = [] } = useCategories();

  if (isLoading) {
    return (
      <div className="flex h-full max-h-full flex-col">
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
            <span className="text-lg text-gray-600">Loading occasional budgets...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full max-h-full flex-col">
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center text-red-600">
            <span className="text-lg">Error loading occasional budgets</span>
          </div>
        </div>
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="flex h-full max-h-full flex-col">
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center">
            <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <span className="text-xl text-gray-500">No occasional budgets found</span>
            <p className="mt-2 text-gray-400">Create an occasional budget to see it here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full max-h-full flex-col">
      <div className="mt-5 flex h-full max-h-full w-full">
        <div className="w-full p-4">
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold text-gray-800">Occasional Budgets</h1>
            <p className="text-gray-600">Manage your one-time and irregular budget items</p>
          </div>

          <div className="grid grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => (
              <OccasionalBudgetItem
                key={`${budget.title}-${budget.budgetDate}-${budget.user}`}
                budget={budget}
                categories={categories}
                currencySign={currencySign}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Container;
