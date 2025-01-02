// System
import * as React from 'react'
import { User as UserIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
// Components
import { Progress } from "@/components/ui/progress"
import {
  EditForm as EditAccount,
  ConfirmDeleteForm,
  ReassignTransactionsForm,
} from '@/components/accounts/forms'
// UI
import * as Card from '@/components/ui/card'
// Hooks
import { useUsers } from '@/hooks/users'
import { useAccountUsage } from '@/hooks/transactions'
// Types
import { User } from '@/components/users/types'
import { AccountResponse } from '@/components/accounts/types'

interface Types {
  account: AccountResponse
}


const AccountCard: React.FC<Types> = ({ account }) => {
  const { data: users = [] } = useUsers()
  const { data: { user: authUser } } = useSession()
  const { data: usage = {} } = useAccountUsage(account.uuid)
  const income = usage.income || 0
  const expenses = usage.spent || 0

  const max = Math.max(income, expenses, 1)
  const incomePercentage = (income / max) * 100
  const expensesPercentage = (expenses / max) * 100
  const isOverBudget = expenses > income
  const isZeroState = income === 0 && expenses === 0


  const getUser = (uuid: string): User | undefined => {
    return users.find((item: User) => item.uuid === uuid)
  }
  return (
    <Card.Card>
      <Card.CardHeader>
        <Card.CardTitle>
          <div className="flex justify-between gap-2">
            {account.title}
            <div className="flex gap-2 items-center font-normal text-sm">
              <UserIcon className="h-4 w-4" /><p>
                {getUser(account.user)?.username}
              </p>
            </div>
          </div>
        </Card.CardTitle>
      </Card.CardHeader>
      <Card.CardContent>
        <>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Income: ${income}</span>
              </div>
              <Progress
                value={incomePercentage}
                className="h-2 w-full bg-blue-200"
                indicatorClassName="bg-blue-600"
              /> </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expenses: {expenses}</span>
              </div>
              <Progress
                value={expensesPercentage}
                className={`h-2 w-full ${isOverBudget ? 'bg-red-200' : 'bg-green-200'}`}
                indicatorClassName={isOverBudget ? 'bg-red-600' : 'bg-green-600'}
              />
            </div>
          </div>
          <div className="flex justify-between text-sm">
            {isZeroState ? (
              <div className="text-muted-foreground">Add income or expenses to see the balance.</div>
            ) : (
              <>
                <div className={income > expenses ? "text-green-600 font-medium" : "text-muted-foreground"}>
                  Balance: {income - expenses}
                </div>
                <div className={isOverBudget ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                  {isOverBudget ? `Overspent: ${expenses - income}` : "Within budget"}
                </div>
              </>
            )}
          </div>
        </>
      </Card.CardContent>
      <Card.CardFooter className="flex justify-between">
        <div>
          <Link className="text-sm p-2" href={`/accounts/${account.uuid}`}>Details >></Link>
        </div>
        <div>
          <ReassignTransactionsForm uuid={account.uuid} />
          <EditAccount uuid={account.uuid} />
          <ConfirmDeleteForm uuid={account.uuid} />
        </div>
      </Card.CardFooter>
    </Card.Card>
  )
}

export default AccountCard
