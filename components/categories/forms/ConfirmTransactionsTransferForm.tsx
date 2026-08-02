import React from 'react';

import { CategoryResponse } from '@/components/categories/types';
import { Button } from '@/components/ui/button';
import * as Dlg from '@/components/ui/dialog';
import { toastManager } from '@/components/ui/toast';
import { useReassignTransactions } from '@/hooks/categories';

interface Types {
  open: boolean;
  setOpen: (value: boolean) => {};
  sourceCategory: CategoryResponse;
  destCategory: string | undefined;
}

const ConfirmTransactionsTransferForm: React.FC<Types> = ({ open, setOpen, sourceCategory, destCategory }) => {
  const { trigger: reassignTransactions, isMutating: isReassigning } = useReassignTransactions(sourceCategory.uuid);

  const handleTransfer = async () => {
    try {
      await reassignTransactions({ category: destCategory });
      toastManager.add({
        id: 'category-transfer-transactions',
        title: 'Transactions transfered!',
        type: 'success',
      });
    } catch (error) {
      toastManager.add({
        id: 'category-transfer-transactions-error',
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
          <Dlg.DialogDescription>Transfer all transactions from category</Dlg.DialogDescription>
        </Dlg.DialogHeader>
        <Dlg.DialogPanel>
          <p>{sourceCategory.name}</p>
        </Dlg.DialogPanel>
        <Dlg.DialogFooter>
          <Dlg.DialogClose render={<Button variant="ghost" />}>Cancel</Dlg.DialogClose>
          <Button disabled={isReassigning} variant="default" onClick={handleTransfer}>
            Transfer
          </Button>
        </Dlg.DialogFooter>
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default ConfirmTransactionsTransferForm;
