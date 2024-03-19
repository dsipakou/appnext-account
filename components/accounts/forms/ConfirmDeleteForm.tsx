
import { FC, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import axios from 'axios'
import { useSWRConfig } from 'swr'
import { useAccounts } from '@/hooks/accounts'
import { useToast } from '@/components/ui/use-toast'
import { AccountResponse } from '../types'

interface Types {
  uuid: string
}

const ConfirmDeleteForm: FC<Types> = ({ uuid }) => {
  const [account, setAccount] = useState<AccountResponse>()
  const [open, setOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { data: accounts } = useAccounts()

  const { mutate } = useSWRConfig()
  const { toast } = useToast()

  useEffect(() => {
    if (!accounts) return

    const _account = accounts.find((item: AccountResponse) => item.uuid === uuid)
    if (_account != null) {
      setAccount(_account)
    }
  }, [accounts, uuid])

  const handleDelete = () => {
    if (account == null) return

    setIsLoading(true)
    axios
      .delete(`accounts/${account.uuid}`)
      .then(
        res => {
          if (res.status === 204) {
            mutate('accounts/')
            setOpen(false)
            toast({
              title: 'Deleted successfully'
            })
          } else {
            // TODO: handle errors [non-empty parent,]
          }
        }
      )
      .catch(
        (err) => {
          const message = err.response?.data?.error || 'Please, try again'
          if (message.includes('transaction')) {
            toast({
              variant: 'destructive',
              title: 'This account contains transactions',
              description: 'You need to choose different account to re-assign transactions'
            })
          } else {
            toast({
              variant: 'destructive',
              title: 'Something went wrong'
            })
          }
        }
      )
      .finally(
        () => {
          setIsLoading(false)
        }
      )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Please, confirm deletion</DialogTitle>
        <p className="leading-7">
          You are about to delete {account?.title} account
        </p>
        <DialogFooter>
          <Button disabled={isLoading} variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={isLoading} variant="destructive" onClick={handleDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmDeleteForm
