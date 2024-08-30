import React from 'react'
import { useSWRConfig } from 'swr'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { useCurrencies, useDeleteCurrency } from '@/hooks/currencies'
import { Currency } from '../types'

interface Types {
  uuid: string
  open: boolean
  handleClose: () => void
}

const ConfirmDeleteForm: React.FC<Types> = ({ open = false, uuid, handleClose }) => {
  const [currency, setCurrency] = React.useState<Currency>()
  const { data: currencies = [] } = useCurrencies()
  const { mutate } = useSWRConfig()
  const { toast } = useToast()
  const { trigger: deleteCurrency, isMutating: isDeleting } = useDeleteCurrency(uuid)

  React.useEffect(() => {
    if (!currencies.length) return

    const _currency = currencies.find((item: Currency) => item.uuid === uuid)
    setCurrency(_currency)
  }, [currencies, uuid])

  const handleDelete = () => {
    if (currency == null) return

    try {
      await deleteCurrency()
      mutate('currencies/')
      handleClose()
      toast({
        title: 'Deleted successfully'
      })
    } catch (error) {
      toast({
        title: 'Please, try again'
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger></DialogTrigger>
      <DialogContent>
        <DialogTitle>Please, confirm deletion</DialogTitle>
        <p className="leading-7">
          You are about to delete {currency?.code} currency
        </p>
        <DialogFooter>
          <Button disabled={isDeleting} variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button disabled={isDeleting} variant="destructive" onClick={handleDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmDeleteForm
