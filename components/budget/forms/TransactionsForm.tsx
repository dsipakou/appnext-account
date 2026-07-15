// External
import React from 'react';

// Components
import { TransactionsTable } from '@/components/transactions/components/transactionTable';
// UI
import * as Dlg from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
// Hooks
import { useBudgetTransactions } from '@/hooks/transactions';

interface Props {
  open: boolean;
  handleClose: () => void;
  uuid: string;
}

const TransactionsForm: React.FC<Props> = ({ open, handleClose, uuid }) => {
  const { data: budgetTransactions = [], isLoading } = useBudgetTransactions(uuid);

  const LoadingScreen = () => (
    <div className="rounded-lg border">
      <div className="max-h-[calc(100vh-300px)] overflow-auto">
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-20" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dlg.Dialog open={open} onOpenChange={handleClose}>
      <Dlg.DialogTrigger></Dlg.DialogTrigger>
      <Dlg.DialogContent className="my-20 flex h-auto min-w-[1000px] flex-col">
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Transactions for selected budget</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <div>{isLoading ? <LoadingScreen /> : <TransactionsTable transactions={budgetTransactions} />}</div>
      </Dlg.DialogContent>
    </Dlg.Dialog>
  );
};

export default TransactionsForm;
