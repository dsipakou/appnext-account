// External
import React from 'react';
// Components
import { TransactionsTable } from '@/components/transactions/components/transactionTable';
// UI
import * as Dlg from '@/components/ui/dialog';
// Hooks
import { useCategoryTransactions } from '@/hooks/transactions';

interface Props {
  open: boolean;
  handleClose: () => void;
  uuid: string;
}

const TransactionsForm: React.FC<Props> = ({ open, handleClose, uuid }) => {
  const { data: categoryTransactions = [] } = useCategoryTransactions(uuid);

  return (
    <Dlg.Dialog open={open} onOpenChange={handleClose}>
      <Dlg.DialogTrigger></Dlg.DialogTrigger>
      <Dlg.DialogContent className="flex flex-col min-w-[1000px] h-[90%] my-20">
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Last 20 transactions</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <div className="h-full">
          <TransactionsTable transactions={categoryTransactions} />
        </div>
      </Dlg.DialogContent>
    </Dlg.Dialog>
  );
};

export default TransactionsForm;
