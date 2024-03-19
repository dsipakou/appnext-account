import React from 'react'
import {
  GridRenderEditCellParams,
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
import { AccountResponse } from '@/components/accounts/types'

interface AccountComponentTypes extends GridRenderEditCellParams {
  accounts: AccountResponse[]
}

const AccountComponent: React.FC<AccountComponentTypes> = (params) => {
  const { id, field, value, accounts } = params
  const apiRef = useGridApiContext()

  const handleChange = (newValue: AccountResponse) => {
    apiRef.current.setEditCellValue({ id, field, value: newValue })
  }

  return (
    <div className="flex w-full h-full bg-slate-100 p-[2px] select-none items-center">
      {(accounts.length === 0)
        ? (
        <span className="italic text-red-500">No accounts found</span>
          )
        : (
        <Select
          onValueChange={handleChange}
          value={value}
        >
          <SelectTrigger className="relative bg-white text-xs border-2 h-full rounded-xl">
            <SelectValue placeholder="Select an account" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Accounts</SelectLabel>
              {accounts.map((item: AccountResponse) => (
                <SelectItem key={item.uuid} value={item}>{item.title}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
          )}
    </div>
  )
}

export default AccountComponent
