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

interface Types {
  open: boolean
  uuid: string
  url: string
  handleClose: () => void
}

const ConfirmDeleteForm: React.FC<Types> = ({ open = false, uuid, url, handleClose }) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const { toast } = useToast()
  const { mutate } = useSWRConfig()

  const handleDelete = () => {
    setIsLoading(true)
    axios
      .delete(`transactions/${uuid}`)
      .then(
        res => {
          if (res.status === 204) {
            mutate(url)
            handleClose()
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
          You are about to delete a transaction
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
