// External
import React from "react";

// Components
import { TransactionsTable } from "@/components/transactions/components/transactionTable";
// UI
import * as Dlg from "@/components/ui/dialog";
// Hooks
import { useCategoryTransactions } from "@/hooks/transactions";

interface Props {
  open: boolean;
  handleClose: () => void;
  uuid: string;
}

const TransactionsForm: React.FC<Props> = ({ open, handleClose, uuid }) => {
  const { data: categoryTransactions = [] } = useCategoryTransactions(uuid);

  return (
    <Dlg.Dialog open={open} onOpenChange={handleClose}>
      <Dlg.DialogPopup className="my-20 flex h-[90%] min-w-250 flex-col">
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Last 20 transactions</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <Dlg.DialogPanel>
          <TransactionsTable transactions={categoryTransactions} />
        </Dlg.DialogPanel>
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default TransactionsForm;
