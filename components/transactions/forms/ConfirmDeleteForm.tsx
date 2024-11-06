import React from 'react'
import { Button } from '@/components/ui/button'
import * as Dlg from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { useDeleteTransaction } from '@/hooks/transactions'
import { RowData } from '@/components/transactions/components/TransactionTableV2'

interface Types {
  open: boolean
  row: RowData
  handleRemoveCompleted: (id: number) => void
  handleClose: () => void
}

const ConfirmDeleteForm: React.FC<Types> = ({
  open = false,
  row,
  handleRemoveCompleted,
  handleClose,
}) => {
  const { toast } = useToast()
  const { trigger: deleteTransaction, isMutating: isDeleting } = useDeleteTransaction(row?.uuid)

  const handleDelete = async () => {
    try {
      await deleteTransaction()
      handleRemoveCompleted(row.id)
      handleClose()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Please, try again'
      })
    }
  }

  return (
    <Dlg.Dialog open={open} onOpenChange={handleClose}>
      <Dlg.DialogTrigger></Dlg.DialogTrigger>
      <Dlg.DialogContent>
        <Dlg.DialogTitle>Please, confirm deletion</Dlg.DialogTitle>
        <p className="leading-7">
          You are about to delete a transaction
        </p>
        <Dlg.DialogFooter>
          <Button disabled={isDeleting} variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button disabled={isDeleting} variant="destructive" onClick={handleDelete}>Delete</Button>
        </Dlg.DialogFooter>
      </Dlg.DialogContent>
    </Dlg.Dialog>
  )
}

export default ConfirmDeleteForm
