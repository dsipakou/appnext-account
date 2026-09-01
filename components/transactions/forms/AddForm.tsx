import * as React from "react";
import { useSWRConfig } from "swr";

// Types
import type { CompactWeekItem } from "@/components/budget/types";

// UI
import * as Alr from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import * as Dlg from "@/components/ui/dialog";

// Components
import { TransactionsTable } from "../components/transactionTable";

type Types = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  budget?: CompactWeekItem;
};

export const UnsavedTransactionsAlert: React.FC<{
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({ open = false, setOpen }) => {
  return (
    <Alr.AlertDialog open={open} onOpenChange={setOpen}>
      <Alr.AlertDialogTrigger />
      <Alr.AlertDialogContent>
        <Alr.AlertDialogHeader>
          <Alr.AlertDialogTitle>You have unsubmitted transactions</Alr.AlertDialogTitle>
          <Alr.AlertDialogDescription>Either remove or submit them</Alr.AlertDialogDescription>
        </Alr.AlertDialogHeader>
        <Alr.AlertDialogFooter>
          <Alr.AlertDialogClose className="w-20" render={<Button variant="ghost" />}>
            Go back
          </Alr.AlertDialogClose>
        </Alr.AlertDialogFooter>
      </Alr.AlertDialogContent>
    </Alr.AlertDialog>
  );
};

const AddForm: React.FC<Types> = ({ open, onOpenChange, url, budget }) => {
  const [canClose, setCanClose] = React.useState<boolean>(true);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const { mutate } = useSWRConfig();

  const handleCanClose = (flag: boolean) => {
    setCanClose(flag);
  };

  const onClose = (open: boolean) => {
    if (open) {
      onOpenChange(open);
      return;
    }

    mutate(url);
    mutate((key) => typeof key === "string" && key.includes("budget/usage"), undefined);
    mutate((key) => typeof key === "string" && key.includes("budget/weekly-usage"), undefined);

    if (canClose) {
      onOpenChange(false);
    } else {
      setAlertOpen(!alertOpen);
    }
  };

  return (
    <>
      <Dlg.Dialog open={open} onOpenChange={onClose}>
        <Dlg.DialogPopup className="mx-3 flex h-[95vh] w-4/5 flex-col overflow-hidden sm:max-w-full">
          <Dlg.DialogHeader className="flex-shrink-0">
            <Dlg.DialogTitle>Add transactions</Dlg.DialogTitle>
          </Dlg.DialogHeader>
          <Dlg.DialogPanel className="min-h-0 flex-1">
            <TransactionsTable budget={budget} handleCanClose={handleCanClose} mode="bulk" />
          </Dlg.DialogPanel>
        </Dlg.DialogPopup>
      </Dlg.Dialog>
      <UnsavedTransactionsAlert open={alertOpen} setOpen={setAlertOpen} />
    </>
  );
};

export default AddForm;
