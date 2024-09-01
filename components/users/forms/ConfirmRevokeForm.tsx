import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useSWRConfig } from 'swr'
import { useToast } from '@/components/ui/use-toast'
import { useRevokeInvite } from '@/hooks/users'

interface Types {
  uuid: string
}

const ConfirmRevokeForm: React.FC<Types> = ({ uuid }) => {
  const [open, setOpen] = React.useState<boolean>(false)
  const { mutate } = useSWRConfig()
  const { toast } = useToast()
  const { trigger: revokeInvite, isMutating: isDeleting } = useRevokeInvite(uuid)

  const handleRevoke = async (): void => {
    try {
      await revokeInvite()
      mutate('users/invite/')
      toast({
        title: 'Invite revoked!'
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong'
      })
    }
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
          <Button disabled={isDeleting} variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={isDeleting} variant="destructive" onClick={handleRevoke}>Revoke</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmRevokeForm
