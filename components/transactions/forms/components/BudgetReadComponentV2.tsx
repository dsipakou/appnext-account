import React from 'react'
import { GridRenderCellParams } from '@mui/x-data-grid'
import { WeekBudgetItem, BudgetSlim } from '@/components/budget/types'
import { TransactionResponse } from '../../types'

interface Types extends TransactionResponse { }

const BudgetReadComponentV2: React.FC<Types> = (transaction) => {
  return (
    <div className="flex w-full px-2 items-center gap-2">
      <span className="text-sm border rounded-sm px-1 bg-slate-100 overflow-x-hidden">{transaction.budget}</span>
    </div>
  )
}

export default BudgetReadComponentV2
