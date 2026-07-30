import { FC, useEffect, useState } from 'react';
import { useSWRConfig } from 'swr';

import { Button } from '@/components/ui/button';
import * as Dlg from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAccounts, useDeleteAccount } from '@/hooks/accounts';
import { extractErrorMessage } from '@/utils/stringUtils';

import { AccountResponse } from '../types';

interface Types {
  uuid: string;
}

const ConfirmDeleteForm: FC<Types> = ({ uuid }) => {
  const [account, setAccount] = useState<AccountResponse>();
  const [open, setOpen] = useState<boolean>(false);

  const { data: accounts } = useAccounts();
  const { trigger: deleteAccount, isMutating: isDeleting } = useDeleteAccount(uuid);

  const { mutate } = useSWRConfig();
  const { toast } = useToast();

  useEffect(() => {
    if (!accounts) return;

    const _account = accounts.find((item: AccountResponse) => item.uuid === uuid);
    if (_account != null) {
      setAccount(_account);
    }
  }, [accounts, uuid]);

  const handleDelete = async () => {
    if (account == null) return;

    try {
      await deleteAccount();
      mutate('accounts/');
      setOpen(false);
      toast({
        title: 'Deleted successfully',
      });
    } catch (error) {
      const message = extractErrorMessage(error);
      if (message.error?.includes('transaction')) {
        toast({
          variant: 'destructive',
          title: 'This account contains transactions',
          description: 'You need to choose different account to re-assign transactions',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Something went wrong',
        });
      }
    }
  };

  return (
    <Dlg.Dialog open={open} onOpenChange={setOpen}>
      <Dlg.DialogTrigger render={<Button variant="destructive" />}>Delete</Dlg.DialogTrigger>
      <Dlg.DialogPopup>
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Please, confirm deletion</Dlg.DialogTitle>
          <Dlg.DialogDescription>You are about to delete {account?.title} account</Dlg.DialogDescription>
        </Dlg.DialogHeader>
        <Dlg.DialogFooter>
          <Button disabled={isDeleting} variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={isDeleting} variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </Dlg.DialogFooter>
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default ConfirmDeleteForm;
