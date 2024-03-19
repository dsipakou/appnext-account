import React from 'react'
import axios from 'axios'
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
import { useCurrencies } from '@/hooks/currencies'
import { Currency } from '../types'

interface Types {
  uuid: string
  open: boolean
  handleClose: () => void
}

const ConfirmDeleteForm: React.FC<Types> = ({ open = false, uuid, handleClose }) => {
  const [currency, setCurrency] = React.useState<Currency>()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const { data: currencies = [] } = useCurrencies()
  const { mutate } = useSWRConfig()
  const { toast } = useToast()

  React.useEffect(() => {
    if (!currencies.length) return

    const _currency = currencies.find((item: Currency) => item.uuid === uuid)
    setCurrency(_currency)
  }, [currencies, uuid])

  const handleDelete = () => {
    if (currency == null) return

    setIsLoading(true)
    axios
      .delete(`currencies/${currency.uuid}`)
      .then(
        res => {
          if (res.status === 204) {
            mutate('currencies/')
            handleClose()
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
          toast({
            title: 'Please, try again'
          })
        }
      )
      .finally(
        () => {
          setIsLoading(false)
        }
      )
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
          <Button disabled={isLoading} variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button disabled={isLoading} variant="destructive" onClick={handleDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmDeleteForm
