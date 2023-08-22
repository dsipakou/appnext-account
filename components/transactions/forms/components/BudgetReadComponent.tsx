import React from 'react'
import { GridRenderCellParams } from '@mui/x-data-grid'
import { WeekBudgetItem, BudgetSlim } from '@/components/budget/types'

interface Types extends GridRenderCellParams<WeekBudgetItem | BudgetSlim> {}

const BudgetReadComponent: React.FC<Types> = (params) => {
  return (
    <div className="flex w-full px-2 items-center gap-2">
      <span className="text-sm border rounded-sm px-1 bg-slate-100 overflow-x-hidden">{params.value?.title}</span>
    </div>
  )
}

export default BudgetReadComponent
