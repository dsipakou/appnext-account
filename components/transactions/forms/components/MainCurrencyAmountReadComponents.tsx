
import React from 'react'
import { GridRenderCellParams } from '@mui/x-data-grid'
import { Currency } from '@/components/currencies/types'

interface Types extends GridRenderCellParams {
  currency?: Currency
}

const MainCurrencyAmountReadComponent: React.FC<Types> | undefined = (params) => {
  const currencySign = params.currency?.sign || ''

  if (!params.value) {
    return
  }

  return (
    <div className="flex w-full pl-2 items-center gap-1">
      <span className="text-sm italic">({params.value}</span><span>{currencySign})</span>
    </div>
  )
}

export default MainCurrencyAmountReadComponent
