import React from "react";
import * as z from "zod";

import { ConfirmTransactionsTransferForm } from "@/components/accounts/forms";
import { AccountResponse } from "@/components/accounts/types";
import { Button } from "@/components/ui/button";
import * as Dlg from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form, type FormErrors } from "@/components/ui/form";
import * as Slc from "@/components/ui/select";
import { useAccounts } from "@/hooks/accounts";

const formSchema = z.object({
  account: z.string().min(1, { error: "Please choose account" }),
});

type FormValues = z.infer<typeof formSchema>;

interface Types {
  uuid: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ReassignTransactionsForm: React.FC<Types> = ({ uuid, open = false, setOpen }) => {
  const [isConfirmTransferOpen, setIsConfirmTransferOpen] = React.useState<boolean>(false);
  const [values, setValues] = React.useState<FormValues>({ account: "" });
  const [errors, setErrors] = React.useState<FormErrors>({});

  const { data: accounts = [] } = useAccounts();

  const filteredAccounts = accounts.filter((item: AccountResponse) => item.uuid !== uuid);

  const handleTransfer = () => {
    const result = formSchema.safeParse(values);

    if (!result.success) {
      setErrors(z.flattenError(result.error).fieldErrors);

      return;
    }

    setErrors({});
    setIsConfirmTransferOpen(true);
  };

  return (
    <Dlg.Dialog onOpenChange={setOpen} open={open}>
      <Dlg.DialogPopup>
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Manage account</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <Form errors={errors} className="contents">
          <Dlg.DialogPanel>
            <div className="flex flex-col space-y-3">
              <div className="flex w-full">
                <Field name="account">
                  <FieldLabel>Re-assign transactions from this account to</FieldLabel>
                  <Slc.Select
                    onValueChange={(account) => setValues({ account })}
                    value={values.account || ""}
                    disabled={filteredAccounts.length === 0}
                    items={filteredAccounts.map((item) => ({
                      label: item.title,
                      value: item.uuid,
                    }))}
                  >
                    <Slc.SelectTrigger className="relative w-full">
                      <Slc.SelectValue
                        placeholder={
                          filteredAccounts.length > 0
                            ? "Choose account"
                            : "You do not have applicable accounts"
                        }
                      />
                    </Slc.SelectTrigger>
                    <Slc.SelectPopup>
                      <Slc.SelectGroup>
                        {filteredAccounts.map((account) => (
                          <Slc.SelectItem key={account.uuid} value={account.uuid}>
                            {account.title}
                          </Slc.SelectItem>
                        ))}
                      </Slc.SelectGroup>
                    </Slc.SelectPopup>
                  </Slc.Select>
                  <FieldError />
                </Field>
              </div>
            </div>
          </Dlg.DialogPanel>
          <Dlg.DialogFooter>
            <Button disabled={!values.account} onClick={handleTransfer}>
              Transfer
            </Button>
            {isConfirmTransferOpen && (
              <ConfirmTransactionsTransferForm
                open={isConfirmTransferOpen}
                setOpen={setIsConfirmTransferOpen}
                sourceAccount={uuid}
                destAccount={values.account}
              />
            )}
          </Dlg.DialogFooter>
        </Form>
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default ReassignTransactionsForm;
