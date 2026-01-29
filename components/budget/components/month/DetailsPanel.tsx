import { FC, useEffect, useState } from 'react';
import GroupedBudgetButton from './GroupedBudgetButton';
import { useBudgetMonth } from '@/hooks/budget';
import { GroupedByCategoryBudget, MonthGroupedBudgetItem, MonthBudgetItem } from '@/components/budget/types';
import CategorySummaryCard from './CategorySummaryCard';
import PreviousMonthsCard from './PreviousMonthsCard';
import DetailsCalendar from './DetailsCalendar';

interface Types {
  activeCategoryUuid: string;
  startDate: string;
  endDate: string;
  user: string;
  clickShowTransactions: (uuid: string) => void;
}

const DetailsPanel: FC<Types> = ({
  activeCategoryUuid,
  startDate,
  endDate,
  user,
  clickShowTransactions,
}) => {
  const [budgetTitle, setBudgetTitle] = useState<string | undefined>();
  const [budgetItems, setBudgetItems] = useState<MonthBudgetItem[]>([]);
  const [activeBudgetUuid, setActiveBudgetUuid] = useState<string | null>(null);
  const { data: budgetList = [], isLoading: isBudgetLoading } = useBudgetMonth(startDate, endDate, user);

  const activeCategory =
    budgetList.length > 0 ? budgetList.find((item: GroupedByCategoryBudget) => item.uuid === activeCategoryUuid) : null;

  const getBudgets = (category: GroupedByCategoryBudget): MonthGroupedBudgetItem[] => {
    if (category.budgets == null) return [];
    return category.budgets;
  };

  const categoryBudgets = activeCategory != null ? activeCategory.budgets : [];

  const title = activeCategory?.categoryName || 'Choose category';

  useEffect(() => {
    if (!categoryBudgets || isBudgetLoading || !activeBudgetUuid) return;

    if (activeCategory == null) {
      setActiveBudgetUuid(null);
      return;
    }

    const _budget = categoryBudgets.find((item: MonthBudgetItem) => item.uuid === activeBudgetUuid);

    if (_budget == null) {
      setActiveBudgetUuid(null);
      return;
    }

    setBudgetTitle(_budget.title);
    setBudgetItems(_budget.items || []);
  }, [activeBudgetUuid, categoryBudgets, isBudgetLoading]);

  const handleCloseBudgetDetails = (): void => {
    setActiveBudgetUuid(null);
  };

  return (
    <div className="flex h-min-full flex-col p-2 rounded-lg bg-white border">
      {activeBudgetUuid ? (
        <DetailsCalendar
          title={title + ' > ' + budgetTitle}
          items={budgetItems}
          date={startDate}
          handleClose={handleCloseBudgetDetails}
          clickShowTransactions={clickShowTransactions}
        />
      ) : (
        activeCategory != null && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <CategorySummaryCard item={activeCategory} />
            </div>
            <div>
              <PreviousMonthsCard month={startDate} category={activeCategoryUuid} />
            </div>
            {categoryBudgets.map((item: MonthGroupedBudgetItem) => (
              <div key={item.uuid} onClick={() => setActiveBudgetUuid(item.uuid)}>
                <GroupedBudgetButton item={item} />
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default DetailsPanel;
