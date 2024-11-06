import React from 'react'
// UI
import * as Slc from '@/components/ui/select'
// Hooks
import { useBudgetWeek } from '@/hooks/budget'
// Types
import { Account } from '@/components/accounts/types'
import { RowData } from '@/components/transactions/components/TransactionTableV2'
import { WeekBudgetItem } from '@/components/budget/types'
// Utils
import { cn } from '@/lib/utils'
import {
  getStartOfWeek,
  getEndOfWeek
} from '@/utils/dateUtils'

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

export default function AccountComponent({
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

  const yourAccounts = accounts.filter((item: Account) => item.user === user)
  const otherAccounts = accounts.filter((item: Account) => item.user !== user)
  const defaultAccount = yourAccounts.find((item: Account) => item.isMain)

  React.useEffect(() => {
    setWeekStart(getStartOfWeek(row.date))
    setWeekEnd(getEndOfWeek(row.date))
  }, [row.date])

  React.useEffect(() => {
    if (!defaultAccount) return
    // If no account passed (i.e. while duplicating) select default
    if (!value) {
      handleChange(row.id, "account", defaultAccount?.uuid || "")
    }
  }, [defaultAccount])

  const isAccountAndBudgetMatch = (newValue: string) => {
    if (!row.budget) {
      return true
    }
    const accountUser = accounts.find((item: Account) => item.uuid === newValue)?.user
    return budgets.some((item: WeekBudgetItem) => item.user === accountUser)
  }

  const changeValue = (value: string) => {
    if (!isAccountAndBudgetMatch(value)) {
      handleChange(row.id, "budget", null)
    }
    handleChange(row.id, "account", value)
  }

  return (
    <Slc.Select
      value={value}
      onValueChange={(value) => changeValue(value)}
      onOpenChange={(open) => {
        if (!open) {
          (document.activeElement as HTMLElement)?.blur();
        }
      }}
    >
      <Slc.SelectTrigger
        className={cn(
          "w-full h-8 px-2 text-sm border-0 focus:ring-0 focus:outline-none focus:border-primary bg-white focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-blue-700 text-left",
          isInvalid && "outline outline-red-400"
        )}
        onKeyDown={(e) => handleKeyDown(e, row.id)}
      >
        <Slc.SelectValue />
      </Slc.SelectTrigger>
      <Slc.SelectContent>
        {!yourAccounts.length && (
          <Slc.SelectItem value="empty" disabled>No accounts</Slc.SelectItem>
        )}
        {!!yourAccounts.length && (
          <>
            <Slc.SelectGroup>
              <Slc.SelectLabel>Your Accounts</Slc.SelectLabel>
              {yourAccounts.map((item: Account) => (
                <Slc.SelectItem key={item.uuid} value={item.uuid}>{item.title}</Slc.SelectItem>
              ))}
            </Slc.SelectGroup>
            <Slc.SelectSeparator />
          </>
        )}
        {!!yourAccounts.length && !!otherAccounts.length && (
          <Slc.SelectGroup>
            <Slc.SelectLabel>Other Accounts</Slc.SelectLabel>
            {otherAccounts.map((item: Account) => (
              <Slc.SelectItem key={item.uuid} value={item.uuid}>{item.title}</Slc.SelectItem>
            ))}
          </Slc.SelectGroup>
        )}
      </Slc.SelectContent>
    </Slc.Select>
  )
}
