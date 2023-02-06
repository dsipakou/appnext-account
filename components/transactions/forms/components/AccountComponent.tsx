import React from 'react'
import {
  GridRenderEditCellParams,
  useGridApiContext
} from '@mui/x-data-grid'
import {
  FormControl,
  MenuItem,
  Select
} from '@mui/material'
import { AccountResponse } from '@/components/accounts/types'


interface AccountComponentTypes extends GridRenderEditCellParams {
  accounts: AccountResponse[]
}

const AccountComponent: React.FC<AccountComponentTypes> = (params) => {
  const { id, field, value, accounts } = params
  const apiRef = useGridApiContext()

  const handleChange = (newValue: any) => {
    apiRef.current.setEditCellValue({ id, field, value: newValue.target.value })
  }

  return (
    <FormControl fullWidth>
      <Select
        fullWidth
        value={value}
        onChange={handleChange}
      >
        {accounts.map((item: AccountResponse) => (
          <MenuItem key={item.uuid} value={item}>{item.title}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default AccountComponent
