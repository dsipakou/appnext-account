import React from 'react'
import {
  GridRenderCellParams,
  GridRowModesModel,
  GridRowModes
} from '@mui/x-data-grid'
import { useCurrencies } from '@/hooks/currencies'
import { Currency } from '@/components/currencies/types'

interface Types extends GridRenderCellParams {
  rowModesModel: GridRowModesModel
}

const BaseAmountReadComponent: React.FC<Types> = (params) => {
  const { data: currencies = [] } = useCurrencies()
  const baseCurrencySign = currencies.find((item: Currency) => item.isBase)?.sign || ''

  const isInEditMode = params.rowModesModel[params.id]?.mode === GridRowModes.Edit
  if (isInEditMode) {
    return (
      <div className="flex w-full h-full bg-slate-100 p-2 select-none"></div>
    )
  }
  return (
    <span
      className="italic text-slate-500"
    >
      {params.formattedValue && `${params.formattedValue} ${baseCurrencySign}`}
    </span>
  )
}

export default BaseAmountReadComponent
