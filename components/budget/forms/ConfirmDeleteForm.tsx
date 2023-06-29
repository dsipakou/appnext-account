
import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import axios from 'axios';
import { useSWRConfig } from 'swr';
import { useToast } from '@/components/ui/use-toast'

interface Types {
  uuid: string
  weekUrl: string
  monthUrl: string
  trigger?: React.ReactElement
}

const ConfirmDeleteForm: React.FC<Types> = ({ uuid, weekUrl, monthUrl, trigger }) => {
  const [open, setOpen] = React.useState<boolean>(false)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const { mutate } = useSWRConfig()
  const { toast } = useToast()

  const handleDelete = () => {
    setIsLoading(true)
    axios
      .delete(`budget/${uuid}`)
      .then(
        res => {
          if (res.status === 204) {
            mutate(weekUrl)
            mutate(monthUrl)
            setOpen(false)
            toast({
              title: "Deleted successfully"
            })
          } else {
            // TODO: handle errors [non-empty parent,]
          }
        }
      )
      .catch(
        (err) => {
          toast({
            title: "Please, try again"
          })
        }
      )
      .finally(
        () => {
          setIsLoading(false)
        }
      );
  };

  const defaultTrigger = (
    <Button variant="destructive">Delete</Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Please, confirm deletion</DialogTitle>
        <p className="leading-7">
          You are about to delete a budget
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
