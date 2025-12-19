import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CategoryResponse } from '@/components/categories/types';
import { useReassignTransactions } from '@/hooks/categories';
import { useToast } from '@/components/ui/use-toast';

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Please, confirm transactions transfer</DialogTitle>
        <p className="leading-7">Transfer all transactions from category</p>
        <p>{sourceCategory.name}</p>
        <DialogFooter>
          <Button disabled={isReassigning} variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={isReassigning} variant="default" onClick={handleTransfer}>
            Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmTransactionsTransferForm;
