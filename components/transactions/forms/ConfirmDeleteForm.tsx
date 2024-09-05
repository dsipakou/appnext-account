import React from 'react'
import { useSWRConfig } from 'swr'
import { Button } from '@/components/ui/button'
import * as Dlg from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { useDeleteTransaction } from '@/hooks/transactions'

interface Types {
  open: boolean
  uuid: string
  url: string
  handleClose: () => void
}

const ConfirmDeleteForm: React.FC<Types> = ({ open = false, uuid, url, handleClose }) => {
  const { toast } = useToast()
  const { mutate } = useSWRConfig()
  const { trigger: deleteTransaction, isMutating: isDeleting } = useDeleteTransaction(uuid)

  const handleDelete = async () => {
    try {
      await deleteTransaction()
      mutate(url)
      handleClose()
    } catch (error) {
      toast({
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
