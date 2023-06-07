import * as React from 'react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Box,
  Grid,
  Toolbar,
  Typography
} from '@mui/material'
import { useAccounts } from '@/hooks/accounts'
import { UserResponse, useUsers } from '@/hooks/users'
import { AccountResponse } from './types'
import { User } from '@/components/users/types'
import { AddForm as AddAccount, EditForm as EditAccount, ConfirmDeleteForm } from './forms'

const Index: React.FC = () => {
  const { data: users = [] } = useUsers()

  const { data: accounts } = useAccounts()

  const getUser = (uuid: string): User | undefined => {
    return users.find((item: User) => item.uuid === uuid)
  }

  return (
    <>
      <Toolbar sx={{ pb: 1 }}>
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Accounts</h4>
        <Box sx={{ flexGrow: 1 }} />
        <AddAccount />
      </Toolbar>
      <div className="grid grid-cols-3 gap-3">
        {accounts && accounts.map((item: AccountResponse) => (
          <div key={item.uuid}>
            <Card>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{getUser(item.user)?.username}</p>
              </CardContent>
              <CardFooter className="flex justify-end">
                <EditAccount uuid={item.uuid} />
                <ConfirmDeleteForm uuid={item.uuid} />
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    </>
  )
}

export default Index
