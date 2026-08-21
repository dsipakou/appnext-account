import type { FC } from "react";

import { useEffect, useState } from "react";
import { useSWRConfig } from "swr";

import { Button } from "@/components/ui/button";
import * as Dlg from "@/components/ui/dialog";
import { toastManager } from "@/components/ui/toast";
import { useAccounts, useDeleteAccount } from "@/hooks/accounts";
import { extractErrorMessage } from "@/utils/stringUtils";

import type { AccountResponse } from "../types";

type Types = {
  uuid: string;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const ConfirmDeleteForm: FC<Types> = ({ uuid, open = false, setOpen }) => {
  const [account, setAccount] = useState<AccountResponse>();

  const { data: accounts } = useAccounts();
  const { trigger: deleteAccount, isMutating: isDeleting } = useDeleteAccount(uuid);

  const { mutate } = useSWRConfig();
  useEffect(() => {
    if (!accounts) {
      return;
    }

    const _account = accounts.find((item: AccountResponse) => item.uuid === uuid);
    if (_account != null) {
      setAccount(_account);
    }
  }, [accounts, uuid]);

  const handleDelete = async () => {
    if (account == null) {
      return;
    }

    try {
      await deleteAccount();
      mutate("accounts/");
      setOpen(false);
      toastManager.add({
        id: "account-delete",
        title: "Deleted successfully",
        type: "success",
      });
    } catch (error) {
      const message = extractErrorMessage(error);
      if (message.error?.includes("transaction")) {
        toastManager.add({
          id: "account-delete-has-transactions",
          title: "This account contains transactions",
          description: "You need to choose different account to re-assign transactions",
          type: "error",
        });
      } else {
        toastManager.add({
          id: "account-delete-error",
          title: "Something went wrong",
          type: "error",
        });
      }
    }
  };

  return (
    <Dlg.Dialog open={open} onOpenChange={setOpen}>
      <Dlg.DialogPopup>
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Please, confirm deletion</Dlg.DialogTitle>
          <Dlg.DialogDescription>
            You are about to delete {account?.title} account
          </Dlg.DialogDescription>
        </Dlg.DialogHeader>
        <Dlg.DialogFooter>
          <Button disabled={isDeleting} variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={isDeleting} variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </Dlg.DialogFooter>
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default ConfirmDeleteForm;
