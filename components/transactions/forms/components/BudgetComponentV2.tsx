import React from 'react'
// UI
import * as Slc from '@/components/ui/select'
// Hooks
import { useBudgetWeek } from '@/hooks/budget'
// Types
import { Account } from '@/components/accounts/types'
import { WeekBudgetItem } from '@/components/budget/types'
import { RowData } from '@/components/transactions/components/TransactionTableV2'
// Utils
import { cn } from '@/lib/utils'
import { getEndOfWeek, getStartOfWeek } from '@/utils/dateUtils'

type Props = {
  user: string
  value: string
  accounts: Account[]
  budgets: WeekBudgetItem[]
  handleChange: (id: number, key: string, value: string) => void
  handleKeyDown: (e: React.KeyboardEvent, id: number) => void
  row: RowData
  isInvalid: boolean
}

export default function BudgetComponent({
  user,
  value,
  accounts,
  handleChange,
  handleKeyDown,
  row,
  isInvalid,
}: Props) {
  const [weekStart, setWeekStart] = React.useState<string>(getStartOfWeek(row.date || new Date()))
  const [weekEnd, setWeekEnd] = React.useState<string>(getEndOfWeek(row.date || new Date()))

  const { data: budgets = [] } = useBudgetWeek(weekStart, weekEnd)

  const accountUser = accounts.find((item: Account) => item.uuid === row.account)?.user

  const filteredBudgets = budgets.filter((item: WeekBudgetItem) => item.user === accountUser)

  React.useEffect(() => {
    setWeekStart(getStartOfWeek(row.date))
    setWeekEnd(getEndOfWeek(row.date))
  }, [row.date])

  const onChange = (value: string) => {
    const budgetName = filteredBudgets.find((item: WeekBudgetItem) => item.uuid === value)?.title || ''
    handleChange(row.id, "budget", value)
    handleChange(row.id, "budgetName", budgetName)
  }

  return (
    <Slc.Select
      value={value}
      onValueChange={(value) => onChange(value)}
      onOpenChange={(open) => {
        if (!open) {
          (document.activeElement as HTMLElement)?.blur();
        }
      }}
      disabled={!accountUser}
    >
      <Slc.SelectTrigger
        className={cn(
          "w-full h-8 px-2 text-sm border-0 focus:ring-0 focus:outline-none focus:border-primary bg-white focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-blue-700 text-left",
          isInvalid && "outline outline-red-400"
        )}
        onKeyDown={(e) => handleKeyDown(e, row.id)}
      >
        <Slc.SelectValue placeholder={!accountUser ? "Select account first" : ""} />
      </Slc.SelectTrigger>
      <Slc.SelectContent>
        {filteredBudgets.length === 0 ? (
          <Slc.SelectItem value="empty" disabled>No budgets</Slc.SelectItem>
        ) : (
          filteredBudgets.map((item: WeekBudgetItem) => (
            <Slc.SelectItem key={item.uuid} value={item.uuid}>{item.title}</Slc.SelectItem>
          ))
        )}
      </Slc.SelectContent>
    </Slc.Select>
  )
}
