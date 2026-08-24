import * as React from "react";
import { useSWRConfig } from "swr";
import * as z from "zod";

import { AccountResponse } from "@/components/accounts/types";
import { CategoryType } from "@/components/categories/types";
import * as Dlg from "@/components/ui/dialog";
import { type FormErrors } from "@/components/ui/form";
import { toastManager } from "@/components/ui/toast";
import { useAccounts, useUpdateAccount } from "@/hooks/accounts";
import { useCategories } from "@/hooks/categories";
import { useUsers } from "@/hooks/users";
import { extractErrorMessage } from "@/utils/stringUtils";

import GenericForm, { GenericFormValues } from "./GenericForm";

interface Types {
  uuid: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const formSchema = z.object({
  kind: z.enum(["savings", "spending"]),
  title: z.string().min(2, {
    error: "Title must be at least 2 characters",
  }),
  user: z.uuid({
    error: "Please, select user",
  }),
  category: z.string(),
  description: z.string().optional(),
});

const EditForm: React.FC<Types> = ({ uuid, open, setOpen }) => {
  const { mutate } = useSWRConfig();

  const [isLoading, setIsLoading] = React.useState(false);
  const [values, setValues] = React.useState<GenericFormValues>({
    kind: "spending",
    title: "",
    user: "",
    category: "",
    description: "",
  });

  const [errors, setErrors] = React.useState<FormErrors>({});

  const { data: accounts = [] } = useAccounts();
  const { data: users = [] } = useUsers();
  const { data: categories = [] } = useCategories();

  const { trigger: updateAccount, isMutating: isUpdating } = useUpdateAccount(uuid);

  const incomeCategories = React.useMemo(
    () => categories.filter((item) => item.type === CategoryType.Income),
    [categories],
  );

  React.useEffect(() => {
    setIsLoading(true);
    if (!open) {
      return;
    }

    const account = accounts.find((item: AccountResponse) => item.uuid === uuid);

    if (!account) {
      return;
    }

    setValues({
      kind: account.kind,
      title: account.title,
      user: account.user,
      category: account.category ?? "",
      description: account.description ?? "",
    });
    setIsLoading(false);
  }, [accounts, uuid, open]);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = formSchema.safeParse(values);

    if (!result.success) {
      setErrors(z.flattenError(result.error).fieldErrors);
      return;
    }

    setErrors({});

    try {
      await updateAccount(result.data);

      mutate("accounts/");

      toastManager.add({
        id: "account-update",
        title: "Saved!",
        type: "success",
      });

      setOpen(false);
    } catch (error) {
      toastManager.add({
        id: "account-update-error",
        title: "Something went wrong",
        description: extractErrorMessage(error),
        type: "error",
      });
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setErrors({});
    }
  };

  return (
    <Dlg.Dialog open={open} onOpenChange={handleOpenChange}>
      <Dlg.DialogPopup>
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Edit account</Dlg.DialogTitle>
        </Dlg.DialogHeader>

        <GenericForm
          values={values}
          errors={errors}
          users={users}
          incomeCategories={incomeCategories}
          isSubmitting={isUpdating || isLoading}
          onChange={setValues}
          onSubmit={handleSubmit}
        />
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default React.memo(EditForm);
