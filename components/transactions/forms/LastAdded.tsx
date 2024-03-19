import React from 'react'
import axios from 'axios'
import { useSWRConfig } from 'swr'
import { useSession } from 'next-auth/react'
import {
  Button
} from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import TransactionTable from '@/components/transactions/components/TransactionTable'
import { useLastAddedTransactions } from '@/hooks/transactions'
import { useUsers } from '@/hooks/users'
import { useToast } from '@/components/ui/use-toast'

const LastAdded: React.FC = () => {
  const [user, setUser] = React.useState()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const { mutate } = useSWRConfig()

  const { data: transactions = [], url } = useLastAddedTransactions()
  const { data: users = [] } = useUsers()
  const { data: { user: authUser } } = useSession()

  const { toast } = useToast()

  React.useEffect(() => {
    if (!authUser || (users.length === 0)) return

    const _user = users.find((item: User) => item.username === authUser.username)!
    setUser(_user.uuid)
  }, [authUser, users])

  const handleMarkAsSeenClick = () => {
    if (!user) return

    const payload = {
      user,
      transaction: transactions[0].uuid
    }

    setIsLoading(true)
    axios.post('transactions/last-added/', {
      ...payload
    }).then(
      res => {
        if (res.status === 201) {
          mutate(url)
          toast({
            title: 'Transactions marked as viewed'
          })
        }
      }
    ).catch(
      (error) => {
        const errRes = error.response.data
        for (const prop in errRes) {
          toast({
            variant: 'destructive',
            title: 'Something went wrong'
          })
        }
      }
    ).finally(() => {
      setIsLoading(false)
    })
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="link">See last added</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col min-w-[1000px] h-screen my-20">
        <DialogHeader>
          <div className="flex justify-between pr-7">
            <DialogTitle>Transactions added since your last visit</DialogTitle>
            <Button disabled={isLoading || (transactions.length === 0)} onClick={handleMarkAsSeenClick}>Mark as seen</Button>
          </div>
        </DialogHeader>
        <div className="h-full">
          <TransactionTable
            transactions={transactions}
            withDate={true}
            handleDeleteClick={() => {}}
            handleEditClick={() => {}}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LastAdded
