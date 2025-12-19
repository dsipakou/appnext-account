import React from 'react';
import { useSession } from 'next-auth/react';
import { useStore } from '@/app/store';
import { formatMoney } from '@/utils/numberUtils';
import { parseDate, getFormattedDate } from '@/utils/dateUtils';
import { useOccasionalBudgets } from '@/hooks/budget';
import { useCategories } from '@/hooks/categories';
import { BudgetItem } from '@/components/budget/types';
import { Category } from '@/components/categories/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Calendar, DollarSign, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OccasionalBudgetItemProps {
  budget: BudgetItem;
  categories: Category[];
  currencySign: string;
}

const OccasionalBudgetItem: React.FC<OccasionalBudgetItemProps> = ({ budget, categories, currencySign }) => {
  const getCategoryIcon = (uuid: string) => categories.find((cat) => cat.uuid === uuid)?.icon || '📝';

  const getCategoryName = (uuid: string) => categories.find((cat) => cat.uuid === uuid)?.name || 'Unknown';

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getCategoryIcon(budget.category)}</span>
          <div>
            <h3 className="font-semibold text-lg text-gray-800">{budget.title}</h3>
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
          <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">{budget.description}</div>
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
      <div className="flex flex-col h-full max-h-full">
        <div className="flex w-full h-full items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <span className="text-lg text-gray-600">Loading occasional budgets...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col h-full max-h-full">
        <div className="flex w-full h-full items-center justify-center">
          <div className="text-center text-red-600">
            <span className="text-lg">Error loading occasional budgets</span>
          </div>
        </div>
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="flex flex-col h-full max-h-full">
        <div className="flex w-full h-full items-center justify-center">
          <div className="text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <span className="text-xl text-gray-500">No occasional budgets found</span>
            <p className="text-gray-400 mt-2">Create an occasional budget to see it here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-full">
      <div className="flex w-full mt-5 h-full max-h-full">
        <div className="w-full p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Occasional Budgets</h1>
            <p className="text-gray-600">Manage your one-time and irregular budget items</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
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
