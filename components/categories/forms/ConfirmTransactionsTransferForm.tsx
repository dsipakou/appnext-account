import React from 'react'
import axios from 'axios'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CategoryResponse } from '@/hooks/categories'
import { useToast } from '@/components/ui/use-toast'

interface Types {
  open: boolean
  setOpen: (value: boolean) => {}
  sourceCategory: CategoryResponse
  destCategory: string | undefined
}

const ConfirmTransactionsTransferForm: React.FC<Types> = ({
  open,
  setOpen,
  sourceCategory,
  destCategory
}) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const { toast } = useToast()

  const handleTransfer = () => {
    setIsLoading(true)
    axios.post(`categories/${sourceCategory.uuid}/reassign/`, {
      category: destCategory
    }).then(
      res => {
        if (res.status === 200) {
          toast({
            title: 'Transactions transfered!'
          })
          // TODO: mutate here or not?
        } else {
          // TODO: handle errors
        }
      }
    ).catch(
      (error) => {
        toast({
          variant: 'destructive',
          title: 'Something went wrong',
          description: 'Please, check your fields'
        })
        const errRes = error.response.data
        for (const prop in errRes) {
          // setErrors(errRes[prop]);
        }
      }
    ).finally(() => {
      setIsLoading(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Please, confirm transactions transfer</DialogTitle>
        <p className="leading-7">
          Transfer all transactions from category
        </p>
        <p>
          {sourceCategory.name}
        </p>
        <DialogFooter>
          <Button disabled={isLoading} variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={isLoading} variant="default" onClick={handleTransfer}>Transfer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmTransactionsTransferForm
