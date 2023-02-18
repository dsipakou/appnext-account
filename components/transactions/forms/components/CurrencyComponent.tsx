import React from 'react'
import {
  useGridApiContext
} from '@mui/x-data-grid'
import { SelectChangeEvent } from '@mui/material/Select'
import {
  FormControl,
  MenuItem,
  Select
} from '@mui/material'
import {
  useCurrencies
} from '@/hooks/currencies'
import { useAvailableRates } from '@/hooks/rates'
import { Currency } from '@/components/currencies/types'
import {
  getFormattedDate
} from '@/utils/dateUtils'

const CurrencyComponent: React.FC<any> = (params) => {
  const { id, field, row, value } = params
  const apiRef = useGridApiContext()
  const date = getFormattedDate(row.transactionDate || new Date())

  const {
    data: currencies = []
  } = useCurrencies()

  const {
    data: availableRates = {}
  } = useAvailableRates(date)

  React.useEffect(() => {
    if (!currencies) return

    const defaultCurrency = currencies.find((item: Currency) => item.isDefault)
    const baseCurrency = currencies.find((item: Currency) => item.isBase)
    const newValue = availableRates[defaultCurrency?.code] ? defaultCurrency : baseCurrency

    apiRef.current.setEditCellValue({ id, field, value: newValue || '' })
  }, [availableRates, currencies])

  const handleChange = (event: SelectChangeEvent) => {
    apiRef.current.setEditCellValue({ id, field, value: event.target.value })
  }

  return (
    <FormControl fullWidth>
      <Select
        fullWidth
        value={value}
        onChange={handleChange}
      >
        {currencies.map((item: Currency) => (
          !!availableRates[item.code]
            ? <MenuItem key={item.uuid} value={item}>{item.sign} {item.verbalName}</MenuItem>
            : <MenuItem
              key={item.uuid}
              value={item}
              disabled
            >
              {item.sign} {item.verbalName} (unavailable)
            </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default CurrencyComponent
