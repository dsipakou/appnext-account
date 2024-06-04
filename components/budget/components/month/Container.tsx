import React from 'react'
import { useSession } from 'next-auth/react'
import { useBudgetMonth } from '@/hooks/budget'
import { GroupedByCategoryBudget } from '@/components/budget/types'
import CategorySummaryButton from './CategorySummaryButton'
import DetailsPanel from './DetailsPanel'

interface Types {
  startDate: string
  endDate: string
  user: string
  weekUrl: string
  monthUrl: string
  clickShowTransactions: (uuid: string) => void
}

const Container: React.FC<Types> = ({
  startDate,
  endDate,
  user,
  weekUrl,
  monthUrl,
  clickShowTransactions
}) => {
  const { data: { user: authUser } } = useSession()
  const [activeCategoryUuid, setActiveCategoryUuid] = React.useState<string>('')
  const { data: budget = [] } = useBudgetMonth(startDate, endDate, user)

  React.useEffect(() => {
    if (budget.length === 0) return

    if (!activeCategoryUuid) {
      setActiveCategoryUuid(budget[0].uuid)
    }
  }, [budget])

  return (
    <div className="grid grid-cols-12 h-full w-full max-h-full">
      <div className="col-span-4 overflow-y-auto h-full">
        <div className="flex flex-col gap-2">
          {budget && budget.map((item: GroupedByCategoryBudget) => (
            <div className="flex justify-center"
              key={item.uuid}
              onClick={() => setActiveCategoryUuid(item.uuid)}
            >
              <CategorySummaryButton
                title={item.categoryName}
                isActive={activeCategoryUuid === item.uuid}
                planned={item.plannedInCurrencies[authUser?.currency]}
                spent={item.spentInCurrencies[authUser?.currency]}
                currencyCode={authUser?.currency}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-8 overflow-y-auto">
        <DetailsPanel
          activeCategoryUuid={activeCategoryUuid}
          startDate={startDate}
          endDate={endDate}
          user={user}
          clickShowTransactions={clickShowTransactions}
          weekUrl={weekUrl}
          monthUrl={monthUrl}
        />
      </div>
    </div>
  )
}

export default Container
