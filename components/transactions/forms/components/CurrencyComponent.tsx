import React from 'react'
import {
  useGridApiContext
} from '@mui/x-data-grid'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  useCurrencies
} from '@/hooks/currencies'
import { useAvailableRates } from '@/hooks/rates'
import { Currency } from '@/components/currencies/types'
import {
  getFormattedDate
} from '@/utils/dateUtils'
import { AvailableRate } from '@/components/rates/types'

const CurrencyComponent: React.FC<any> = (params) => {
  const { id, field, row, value } = params
  const apiRef = useGridApiContext()
  const transactionDate = getFormattedDate(row.transactionDate || new Date())
  const budgetCurrencyUuid = row.budget?.currency

  const { data: currencies = [] } = useCurrencies()

  const { data: availableRates = [] } = useAvailableRates(transactionDate)

  React.useEffect(() => {
    if (!currencies) return

    const defaultCurrency = currencies.find((item: Currency) => item.isDefault)
    const isDefaultCurrencyAvailable = availableRates.find((item: AvailableRate) => item.currencyCode === defaultCurrency?.code)
    const baseCurrency = currencies.find((item: Currency) => item.isBase)
    const budgetCurrency = currencies.find((item: Currency) => item.uuid === budgetCurrencyUuid)
    const isBudgetCurrencyAvailable = availableRates.find((item: AvailableRate) => item.currencyCode === budgetCurrency?.code)

    // Check
    // 1. If budget currency available
    // 2. or if default currency available
    // 3. else base currency 
    const newValue = isBudgetCurrencyAvailable ? budgetCurrency : isDefaultCurrencyAvailable ? defaultCurrency : baseCurrency

    apiRef.current.setEditCellValue({ id, field, value: newValue || null })
  }, [availableRates, currencies])

  const handleChange = (item: Currency) => {
    apiRef.current.setEditCellValue({ id, field, value: item })
  }

  return (
    <div className="flex w-full h-full bg-slate-100 select-none items-center">
      {!currencies.length
        ? (
          <span className="italic text-red-500">No currency</span>
        )
        : (
          <Select
            onValueChange={handleChange}
            value={value}
          >
            <SelectTrigger className="relative border bg-white rounded-lg h-full">
              <SelectValue placeholder="Select a currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Currencies</SelectLabel>
                {currencies && currencies.map((item: Currency) => {
                  const rate = availableRates.find((rate: AvailableRate) => rate.currencyCode === item.code)
                  if (rate) {
                    if (rate.rateDate === transactionDate) {
                      return (
                        <SelectItem key={item.uuid} value={item}>{item.code}</SelectItem>
                      )
                    } else {
                      return (
                        <SelectItem key={item.uuid} value={item}>{item.code} (old)</SelectItem>
                      )
                    }
                  } else {
                    return (
                      <SelectItem key={item.uuid} value={item} disabled>{item.code}</SelectItem>
                    )
                  }
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
    </div>
  )
}

export default CurrencyComponent
