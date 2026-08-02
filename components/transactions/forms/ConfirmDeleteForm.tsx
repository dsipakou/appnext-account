import React from 'react';
import { useSWRConfig } from 'swr';

import { RowData } from '@/components/transactions/components/transactionTable';
import { Button } from '@/components/ui/button';
import * as Dlg from '@/components/ui/dialog';
import { toastManager } from '@/components/ui/toast';
import { useDeleteTransaction } from '@/hooks/transactions';
import { getFormattedDate } from '@/utils/dateUtils';

interface Types {
  open: boolean;
  row: RowData;
  handleRemoveCompleted: (id: number) => void;
  handleClose: () => void;
}

const ConfirmDeleteForm: React.FC<Types> = ({ open = false, row, handleRemoveCompleted, handleClose }) => {
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
      toastManager.add({
        id: 'transaction-delete-error',
        title: 'Please, try again',
        type: 'error',
      });
    }
  };

  return (
    <Dlg.Dialog open={open} onOpenChange={handleClose}>
      <Dlg.DialogPopup>
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Please, confirm deletion</Dlg.DialogTitle>
          <Dlg.DialogDescription>You are about to delete a transaction</Dlg.DialogDescription>
        </Dlg.DialogHeader>
        <Dlg.DialogFooter>
          <Dlg.DialogClose render={<Button variant="ghost" />}>Cancel</Dlg.DialogClose>
          <Button disabled={isDeleting} variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </Dlg.DialogFooter>
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default ConfirmDeleteForm;
