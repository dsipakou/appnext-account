import * as React from 'react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useAccounts } from '@/hooks/accounts'
import { useUsers } from '@/hooks/users'
import { AccountResponse } from './types'
import { User } from '@/components/users/types'
import { AddForm as AddAccount, EditForm as EditAccount, ConfirmDeleteForm } from './forms'

const Index: React.FC = () => {
  const { data: users = [] } = useUsers()

  const { data: accounts = [] } = useAccounts()

  const getUser = (uuid: string): User | undefined => {
    return users.find((item: User) => item.uuid === uuid)
  }

  const noAccounts = (
    <div className="flex justify-center items-center flex-1">
      <span className="text-2xl">No accounts added</span>
    </div>
  )

  return (
    <div className="flex flex-col flex-1">
      <div className="flex w-full px-6 my-3 justify-between items-center">
        <span className="text-xl font-semibold">Accounts</span>
        <AddAccount />
      </div>
      {
        !accounts.length && noAccounts
      }
      <div className="grid grid-cols-3 gap-3">
        {!!accounts.length && accounts.map((item: AccountResponse) => (
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
    </div>
  )
}

export default Index
