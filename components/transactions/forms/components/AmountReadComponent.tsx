import React from 'react'
import { GridRenderCellParams } from '@mui/x-data-grid'

interface Types extends GridRenderCellParams {}

const AmountReadComponent: React.FC<Types> = (params) => {
  const currencySign = params.row.currency?.sign || ''

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
