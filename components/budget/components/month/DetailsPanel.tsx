import { FC, useEffect, useState } from 'react'
import GroupedBudgetButton from './GroupedBudgetButton'
import { useBudgetMonth } from '@/hooks/budget'
import {
  GroupedByCategoryBudget,
  MonthGroupedBudgetItem,
  MonthBudgetItem
} from '@/components/budget/types'
import GroupedBudgetDetails from './GroupedBudgetDetails'
import CategorySummaryCard from './CategorySummaryCard'
import PreviousMonthsCard from './PreviousMonthsCard'
import DetailsCalendar from './DetailsCalendar'

interface Types {
  activeCategoryUuid: string
  startDate: string
  endDate: string
  user: string
  weekUrl: string
  monthUrl: string
  clickShowTransactions: (uuid: string) => void
}

const DetailsPanel: FC<Types> = ({
  activeCategoryUuid,
  startDate,
  endDate,
  user,
  weekUrl,
  monthUrl,
  clickShowTransactions,
}) => {
  const [budgetTitle, setBudgetTitle] = useState<string | undefined>()
  const [budgetItems, setBudgetItems] = useState<MonthBudgetItem[]>([])
  const [activeBudgetUuid, setActiveBudgetUuid] = useState<string | null>(null)
  const {
    data: budgetList = [],
    isLoading: isBudgetLoading
  } = useBudgetMonth(startDate, endDate, user);

  const activeCategory = budgetList.length > 0
    ? budgetList.find(
      (item: GroupedByCategoryBudget) => item.uuid === activeCategoryUuid
    )
    : null

  const categoryBudgets = activeCategory
    ? activeCategory.budgets
    : []

  const title = activeCategory?.categoryName || 'Choose category'

  useEffect(() => {
    if (!categoryBudgets || isBudgetLoading || !activeBudgetUuid) return;

    if (!activeCategory) {
      setActiveBudgetUuid(null)
      return
    }

    const _budget = categoryBudgets.find(
      (item: MonthBudgetItem) => item.uuid === activeBudgetUuid
    )

    if (!_budget) {
      setActiveBudgetUuid(null)
      return
    }

    setBudgetTitle(_budget.title)
    setBudgetItems(_budget.items || [])
  }, [activeBudgetUuid, categoryBudgets, isBudgetLoading])

  const handleCloseBudgetDetails = (): void => {
    setActiveBudgetUuid(null)
  }

  return (
    <div className="flex h-min-full flex-col p-2 rounded-lg bg-white border">
      <span className="text-2xl font-semibold p-2 self-center">{title}</span>
        {activeBudgetUuid ?
          <DetailsCalendar
            title={budgetTitle}
            items={budgetItems}
            date={startDate}
            handleClose={handleCloseBudgetDetails}
            clickShowTransactions={clickShowTransactions}
            weekUrl={weekUrl}
            monthUrl={monthUrl}
          /> :
          activeCategory && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <CategorySummaryCard item={activeCategory} />
              </div>
              <div>
                <PreviousMonthsCard />
              </div>
              {categoryBudgets.map((item: MonthGroupedBudgetItem) => (
                <div key={item.uuid} onClick={() => setActiveBudgetUuid(item.uuid)}>
                  <GroupedBudgetButton item={item} />
                </div>
              ))}
            </div>
          )
        }
    </div>
  )
}

export default DetailsPanel;
