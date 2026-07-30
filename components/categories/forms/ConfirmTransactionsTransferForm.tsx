import React from 'react';

import { CategoryResponse } from '@/components/categories/types';
import { Button } from '@/components/ui/button';
import * as Dlg from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useReassignTransactions } from '@/hooks/categories';

interface Types {
  open: boolean;
  setOpen: (value: boolean) => {};
  sourceCategory: CategoryResponse;
  destCategory: string | undefined;
}

const ConfirmTransactionsTransferForm: React.FC<Types> = ({ open, setOpen, sourceCategory, destCategory }) => {
  const { toast } = useToast();
  const { trigger: reassignTransactions, isMutating: isReassigning } = useReassignTransactions(sourceCategory.uuid);

  const handleTransfer = async () => {
    try {
      await reassignTransactions({ category: destCategory });
      toast({
        title: 'Transactions transfered!',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'Please, check your fields',
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
