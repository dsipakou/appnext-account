import React from 'react';
import { useSWRConfig } from 'swr';
import { Button } from '@/components/ui/button';
import * as Dlg from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useDeleteTransaction } from '@/hooks/transactions';
import { RowData } from '@/components/transactions/components/transactionTable';
import { getFormattedDate } from '@/utils/dateUtils';

interface Types {
  open: boolean;
  row: RowData;
  handleRemoveCompleted: (id: number) => void;
  handleClose: () => void;
}

const ConfirmDeleteForm: React.FC<Types> = ({ open = false, row, handleRemoveCompleted, handleClose }) => {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const { trigger: deleteTransaction, isMutating: isDeleting } = useDeleteTransaction(row?.uuid);

  const shouldRevalidateTransactionList = (key: unknown, transactionDate: string): boolean => {
    if (typeof key !== 'string' || !key.startsWith('transactions?')) {
      return false;
    }

    const hasDateFilter = key.includes('dateFrom');
    const includesTransactionDate =
      key.includes(`dateFrom=${transactionDate}`) || key.includes(`dateTo=${transactionDate}`);

    // Revalidate if: no date filter (all transactions) OR the date range includes this transaction
    return !hasDateFilter || includesTransactionDate;
  };

  const handleDelete = async () => {
    try {
      await deleteTransaction();

      // Mutate transaction lists that might contain this transaction
      const transactionDate = getFormattedDate(row.date);
      mutate((key) => shouldRevalidateTransactionList(key, transactionDate), undefined, { revalidate: true });

      handleRemoveCompleted(row.id);
      handleClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Please, try again',
      });
    }
  };

  return (
    <Dlg.Dialog open={open} onOpenChange={handleClose}>
      <Dlg.DialogTrigger></Dlg.DialogTrigger>
      <Dlg.DialogContent>
        <Dlg.DialogTitle>Please, confirm deletion</Dlg.DialogTitle>
        <p className="leading-7">You are about to delete a transaction</p>
        <Dlg.DialogFooter>
          <Button disabled={isDeleting} variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button disabled={isDeleting} variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </Dlg.DialogFooter>
      </Dlg.DialogContent>
    </Dlg.Dialog>
  );
};

export default ConfirmDeleteForm;
