import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useReassignTransactions } from '@/hooks/accounts'

interface Types {
  open: boolean
  setOpen: (value: boolean) => {}
  sourceAccount: string
  destAccount: string | undefined
}

const ConfirmTransactionsTransferForm: React.FC<Types> = ({
  open,
  setOpen,
  sourceAccount,
  destAccount
}) => {
  const { toast } = useToast()
  const { trigger: reassignTransactions, isMutating: isReassigning } = useReassignTransactions(sourceAccount)

  const handleTransfer = async () => {
    try {
      await reassignTransactions({ account: destAccount })
      toast({
        title: 'Transactions transfered!'
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'Please, check your fields'
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Please, confirm transactions transfer</DialogTitle>
        <DialogFooter>
          <Button disabled={isReassigning} variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={isReassigning} variant="default" onClick={handleTransfer}>Transfer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmTransactionsTransferForm
