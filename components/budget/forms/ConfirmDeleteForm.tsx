import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog'
import { useSWRConfig } from 'swr'
import { useToast } from '@/components/ui/use-toast'
import { useDeleteBudget, usePendingBudget } from '@/hooks/budget'

interface Types {
  open: boolean
  setOpen: (open: boolean) => void
  uuid: string
  weekUrl: string
  monthUrl: string
  trigger?: React.ReactElement
}

const ConfirmDeleteForm: React.FC<Types> = ({ open, setOpen, uuid, weekUrl, monthUrl, trigger }) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const { url: pendingUrl } = usePendingBudget()

  const { mutate } = useSWRConfig()
  const { toast } = useToast()
  const { trigger: deleteBudget, isMutating: isDeleting } = useDeleteBudget(uuid)

  const handleDelete = async () => {
    try {
      await deleteBudget()
      setOpen(false)
      toast({
        title: 'Deleted successfully'
      })
      mutate(weekUrl)
      mutate(monthUrl)
      mutate(pendingUrl)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Please, try again'
      })
    }
  }

  const defaultTrigger = (
    <Button variant="destructive">Delete</Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Please, confirm deletion</DialogTitle>
        <p className="leading-7">
          You are about to delete a budget
        </p>
        <DialogFooter>
          <Button disabled={isDeleting} variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={isDeleting} variant="destructive" onClick={handleDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmDeleteForm
