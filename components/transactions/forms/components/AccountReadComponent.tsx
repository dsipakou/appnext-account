import React from 'react'
import { CreditCard } from 'lucide-react'
import { GridRenderCellParams } from '@mui/x-data-grid'
import { Account } from '@/components/accounts/types'

interface Types extends GridRenderCellParams<Account> { }

const AccountReadComponent: React.FC<Types> = (params) => {
  return (
    <div className="flex w-full pl-2 items-center gap-2">
      <CreditCard className="h-5" />
      <span className="text-sm">{params.value.title}</span>
    </div>
  )
}

export default AccountReadComponent
