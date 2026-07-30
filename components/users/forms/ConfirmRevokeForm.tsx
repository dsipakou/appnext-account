import React from 'react';
import { useSWRConfig } from 'swr';

import { Button } from '@/components/ui/button';
import * as Dlg from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useRevokeInvite } from '@/hooks/users';

interface Types {
  uuid: string;
}

const ConfirmRevokeForm: React.FC<Types> = ({ uuid }) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const { mutate } = useSWRConfig();
  const { toast } = useToast();
  const { trigger: revokeInvite, isMutating: isDeleting } = useRevokeInvite(uuid);

  const handleRevoke = async (): void => {
    try {
      await revokeInvite();
      mutate('users/invite/');
      toast({
        title: 'Invite revoked!',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
      });
    }
  };

  return (
    <Dlg.Dialog open={open} onOpenChange={setOpen}>
      <Dlg.DialogTrigger render={<Button variant="link" />}>Revoke</Dlg.DialogTrigger>
      <Dlg.DialogPopup>
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Please, confirm revoking</Dlg.DialogTitle>
          <Dlg.DialogDescription>Are you sure you want to revoke the invite?</Dlg.DialogDescription>
        </Dlg.DialogHeader>
        <Dlg.DialogFooter>
          <Dlg.DialogClose render={<Button variant="ghost" />}>Cancel</Dlg.DialogClose>
          <Button disabled={isDeleting} variant="destructive" onClick={handleRevoke}>
            Revoke
          </Button>
        </Dlg.DialogFooter>
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default ConfirmRevokeForm;
