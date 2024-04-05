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
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useAccounts } from '@/hooks/accounts'
import { Account, AccountResponse } from '@/components/accounts/types'

interface AccountComponentTypes extends GridRenderEditCellParams {
  user: string
}

const AccountComponent: React.FC<AccountComponentTypes> = (params) => {
  const { id, field, value, user } = params
  const apiRef = useGridApiContext()
  const { data: accounts = [] } = useAccounts()

  const getDefaultAccountForCurrentUser = (): AccountResponse | undefined => {
    if (user) {
      return accounts.find((item: Account) => item.user === user && item.isMain)
    }
    return undefined
  }

  React.useEffect(() => {
    if (!accounts.length) return

    const defaultValue = getDefaultAccountForCurrentUser()
    if (defaultValue) {
      apiRef.current.setEditCellValue({ id, field, value: getDefaultAccountForCurrentUser() })
    }
  }, [accounts])

  const yourAccounts = accounts.filter((item: Account) => item.user === user)
  const otherAccounts = accounts.filter((item: Account) => item.user !== user)

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
              <SelectLabel>Your Accounts</SelectLabel>
              {yourAccounts.map((item: AccountResponse) => (
                <SelectItem key={item.uuid} value={item}>{item.title}</SelectItem>
              ))}
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Other Accounts</SelectLabel>
              {otherAccounts.map((item: AccountResponse) => (
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
