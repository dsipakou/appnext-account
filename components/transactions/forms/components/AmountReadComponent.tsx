import React from 'react'
import { GridRenderCellParams } from '@mui/x-data-grid'
import { Currency } from '@/components/currencies/types'

interface Types extends GridRenderCellParams {
  currency: Currency
}

const AmountReadComponent: React.FC<Types> = (params) => {
  const currencySign = params.currency?.sign || ''

  if (!params.value) {
    return
  }

  return (
    <div className="flex w-full pl-2 items-center gap-2">
      <span className="text-sm font-semibold">{params.value}</span><span>{currencySign}</span>
    </div>
  )
}

export default AmountReadComponent
