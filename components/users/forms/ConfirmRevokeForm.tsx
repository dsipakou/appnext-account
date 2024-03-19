import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { useSWRConfig } from 'swr'
import { useToast } from '@/components/ui/use-toast'

interface Types {
  uuid: string
}

const ConfirmRevokeForm: React.FC<Types> = ({ uuid }) => {
  const [open, setOpen] = React.useState<boolean>(false)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const { mutate } = useSWRConfig()
  const { toast } = useToast()

  const handleRevoke = (): void => {
    setIsLoading(true)
    axios
      .delete(`users/invite/${uuid}`)
      .then(
        res => {
          if (res.status === 204) {
            mutate('users/invite/')
            toast({
              title: 'Invite revoked!'
            })
          } else {
            // TODO: handle errors [non-empty parent,]
          }
        }
      )
      .catch(
        (err) => {
          toast({
            variant: 'destructive',
            title: 'Something went wrong'
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link">Revoke</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Please, confirm revoking</DialogTitle>
        <p className="leading-7">
          Are you sure you want to revoke the invite?
        </p>
        <DialogFooter>
          <Button disabled={isLoading} variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={isLoading} variant="destructive" onClick={handleRevoke}>Revoke</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmRevokeForm
