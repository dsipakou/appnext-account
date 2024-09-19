import React from 'react'
// UI
import * as Slc from '@/components/ui/select'
// Hooks
import { useBudgetWeek } from '@/hooks/budget'
import { useCurrencies } from '@/hooks/currencies'
import { useAvailableRates } from '@/hooks/rates'
// Types
import { Account } from '@/components/accounts/types'
import { WeekBudgetItem } from '@/components/budget/types'
import { Currency } from '@/components/currencies/types'
import { AvailableRate } from '@/components/rates/types'
import { RowData } from '@/components/transactions/components/TransactionTableV2'
// Utils
import { cn } from '@/lib/utils'
import { getEndOfWeek, getFormattedDate, getStartOfWeek } from '@/utils/dateUtils'

type Props = {
  user: string
  value: string
  row: RowData
  isInvalid: boolean
  handleChange: (id: number, key: string, value: string) => void
  handleKeyDown: (e: React.KeyboardEvent, id: number) => void
}

export default function CurrencyComponent({
  user,
  value,
  row,
  isInvalid,
  handleChange,
  handleKeyDown,
}: Props) {
  const [selectedDate, setSelectedDate] = React.useState<Date>(row.date || new Date())
  const [budgetUuid, setBudgetUuid] = React.useState<string>('')
  const [weekStart, setWeekStart] = React.useState<string>(getStartOfWeek(row.date || new Date()))
  const [weekEnd, setWeekEnd] = React.useState<string>(getEndOfWeek(row.date || new Date()))

  const { data: budgets = [], isLoading: isBudgetsLoading } = useBudgetWeek(weekStart, weekEnd)
  const { data: currencies = [], isLoading: isCurrenciesLoading } = useCurrencies()
  const { data: availableRates = [], isLoading: isRatesLoading } = useAvailableRates(getFormattedDate(selectedDate))

  const baseCurrency = currencies.find((item: Currency) => item.isBase)

  const selectedBudget = budgets.find((item: WeekBudgetItem) => item.uuid === budgetUuid)
  console.log('selectedBudget', selectedBudget)
  const budgetCurrency = selectedBudget ? currencies.find((item: Currency) => item.uuid === selectedBudget.currency) : null
  console.log('budgetCurrency', budgetCurrency)
  const isBudgetCurrencyAvailable = budgetCurrency ? availableRates.find((item: AvailableRate) => item.currencyCode === budgetCurrency.code) : false

  const defaultCurrency = currencies.find((item: Currency) => item.isDefault)
  const isDefaultCurrencyAvailable = availableRates.find((item: AvailableRate) => item.currencyCode === defaultCurrency?.code)

  const preselectedValue = () => {
    if (isBudgetCurrencyAvailable) {
      console.log('budget')
      return budgetCurrency!.uuid
    }
    if (isDefaultCurrencyAvailable) {
      console.log('default')
      return defaultCurrency!.uuid
    }
    console.log('base')
    return baseCurrency.uuid
  }

  React.useEffect(() => {
    setSelectedDate(row.date)
    setWeekStart(getStartOfWeek(row.date))
    setWeekEnd(getEndOfWeek(row.date))
  }, [row.date])

  React.useEffect(() => {
    if (row.budget) {
      console.log('budget changed', row.budget)
      setBudgetUuid(row.budget)
    }
  }, [row.budget])

  React.useEffect(() => {
    handleChange(row.id, 'currency', preselectedValue() as string)
  }, [isBudgetCurrencyAvailable, isDefaultCurrencyAvailable])

  const changeValue = (value: string) => {
    handleChange(row.id, "account", value)
  }

  return (
    <Slc.Select
      value={value || preselectedValue().uuid as string}
      onValueChange={(value) => handleChange(row.id, 'currency', value)}
      onOpenChange={(open) => {
        if (!open) {
          (document.activeElement as HTMLElement)?.blur();
        }
      }}
      disabled={isRatesLoading || isCurrenciesLoading || isBudgetsLoading}
    >
      <Slc.SelectTrigger
        className={cn(
          "w-full h-8 px-2 text-sm border-0 bg-white text-left",
          "focus:ring-0 focus:outline-none focus:border-primary focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-blue-700",
          isInvalid && "outline outline-red-400",
        )}
        onKeyDown={(e) => handleKeyDown(e, row.id)}
      >
        <Slc.SelectValue />
      </Slc.SelectTrigger>
      <Slc.SelectContent>
        {currencies && currencies.map((item: Currency) => {
          const rate = availableRates.find((rate: AvailableRate) => rate.currencyCode === item.code)
          if (rate) {
            if (item.isBase || rate.rateDate === getFormattedDate(row.date)) {
              return (
                <Slc.SelectItem key={item.uuid} value={item.uuid}>{item.code}</Slc.SelectItem>
              )
            } else {
              return (
                <Slc.SelectItem key={item.uuid} value={item.uuid}>{item.code} (old)</Slc.SelectItem>
              )
            }
          } else {
            return (
              <Slc.SelectItem key={item.uuid} value={item.uuid} disabled>{item.code}</Slc.SelectItem>
            )
          }
        })}
      </Slc.SelectContent>
    </Slc.Select>
  )
}
