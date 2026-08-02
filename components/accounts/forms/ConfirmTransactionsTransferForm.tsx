import React from 'react';

import { Button } from '@/components/ui/button';
import * as Dlg from '@/components/ui/dialog';
import { toastManager } from '@/components/ui/toast';
import { useReassignTransactions } from '@/hooks/accounts';

interface Types {
  open: boolean;
  setOpen: (value: boolean) => void;
  sourceAccount: string;
  destAccount: string | undefined;
}

const ConfirmTransactionsTransferForm: React.FC<Types> = ({ open, setOpen, sourceAccount, destAccount }) => {
  const { trigger: reassignTransactions, isMutating: isReassigning } = useReassignTransactions(sourceAccount);

  const handleTransfer = async () => {
    try {
      await reassignTransactions({ account: destAccount });
      toastManager.add({
        id: 'account-transfer-transactions',
        title: 'Transactions transfered!',
        type: 'success',
      });
    } catch {
      toastManager.add({
        id: 'account-transfer-transactions-error',
        title: 'Something went wrong',
        description: 'Please, check your fields',
        type: 'error',
      });
    }
  };

  return (
    <Dlg.Dialog open={open} onOpenChange={setOpen}>
      <Dlg.DialogPopup>
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Please, confirm transactions transfer</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <Dlg.DialogFooter>
          <Button disabled={isReassigning} variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={isReassigning} variant="default" onClick={handleTransfer}>
            Transfer
          </Button>
        </Dlg.DialogFooter>
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default ConfirmTransactionsTransferForm;
