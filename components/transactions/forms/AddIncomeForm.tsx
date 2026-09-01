import React from "react";
import { useSWRConfig } from "swr";

import * as Dlg from "@/components/ui/dialog";

import { TransactionsTable } from "../components/transactionTable";
import { UnsavedTransactionsAlert } from "./AddForm";

type Types = {
  open: boolean;
  url: string;
  handleClose: () => void;
};

const AddIncomeForm: React.FC<Types> = ({ open, url, handleClose }) => {
  const [canClose, setCanClose] = React.useState<boolean>(true);
  const [alertOpen, setAlertOpen] = React.useState(false);

  const { mutate } = useSWRConfig();

  const handleCanClose = (flag: boolean) => {
    setCanClose(flag);
  };

  const onClose = (nextOpen: boolean) => {
    if (nextOpen) {
      return;
    }

    mutate(url);
    if (canClose) {
      handleClose();
      return;
    }

    setAlertOpen(!alertOpen);
  };

  return (
    <>
      <Dlg.Dialog open={open} onOpenChange={onClose}>
        <Dlg.DialogPopup className="mx-3 flex h-[95vh] w-4/5 flex-col overflow-hidden sm:max-w-full">
          <Dlg.DialogHeader className="flex-shrink-0">
            <Dlg.DialogTitle>Add income transactions</Dlg.DialogTitle>
          </Dlg.DialogHeader>
          <Dlg.DialogPanel className="min-h-0 flex-1">
            <TransactionsTable
              categoryType="INC"
              disabledColumns={["budget"]}
              handleCanClose={handleCanClose}
              mode="bulk"
              transactionType="income"
            />
          </Dlg.DialogPanel>
        </Dlg.DialogPopup>
      </Dlg.Dialog>
      <UnsavedTransactionsAlert open={alertOpen} setOpen={setAlertOpen} />
    </>
  );
};

export default AddIncomeForm;
