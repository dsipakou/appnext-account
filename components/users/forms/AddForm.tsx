import React from "react";
import * as z from "zod";

import type { FormErrors } from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import * as Dlg from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toastManager } from "@/components/ui/toast";
import { useCreateInvite } from "@/hooks/users";
import { extractErrorMessage } from "@/utils/stringUtils";

const formSchema = z.object({
  email: z.string().email(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  disabled?: boolean;
  disabledReason?: string;
};

const AddForm: React.FC<Props> = ({ disabled = false, disabledReason }) => {
  const [values, setValues] = React.useState<FormValues>({ email: "" });
  const [errors, setErrors] = React.useState<FormErrors>({});

  const { trigger: createInvite, isMutating: isCreating } = useCreateInvite();

  const cleanFormErrors = (open: boolean) => {
    if (!open) {
      setErrors({});
      setValues({ email: "" });
    }
  };

  const handleSave = async (payload: FormValues) => {
    try {
      await createInvite(payload);
      toastManager.add({
        id: "user-invite-create",
        title: "Saved!",
        type: "success",
      });
    } catch (error) {
      const message = extractErrorMessage(error);
      if (JSON.stringify(message).includes("unique set")) {
        toastManager.add({
          id: "user-invite-duplicate",
          title: "You have already sent invite for this user",
          type: "error",
        });
      } else {
        toastManager.add({
          id: "user-invite-create-error",
          title: "Something went wrong",
          description: JSON.stringify(message),
          type: "error",
        });
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = formSchema.safeParse(values);

    if (!result.success) {
      setErrors(z.flattenError(result.error).fieldErrors);
      return;
    }

    setErrors({});
    await handleSave(result.data);
  };

  return (
    <Dlg.Dialog onOpenChange={cleanFormErrors}>
      <Dlg.DialogTrigger className="mx-2" disabled={disabled} render={<Button />}>
        + Add member
      </Dlg.DialogTrigger>
      {disabled && disabledReason && (
        <span className="text-muted-foreground text-sm">{disabledReason}</span>
      )}
      <Dlg.DialogPopup>
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Add user to the workspace</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <Form errors={errors} onSubmit={(event) => void handleSubmit(event)} className="contents">
          <Dlg.DialogPanel>
            <div className="flex w-full">
              <Field name="email">
                <FieldLabel>Email</FieldLabel>
                <Input
                  className="w-full"
                  disabled={isCreating}
                  placeholder="user@example.com"
                  id="verbalName"
                  value={values.email}
                  onChange={(event) => setValues({ email: event.target.value })}
                />
                <FieldError />
              </Field>
            </div>
          </Dlg.DialogPanel>
          <Dlg.DialogFooter>
            <Dlg.DialogClose render={<Button variant="ghost" />}>Cancel</Dlg.DialogClose>
            <Button type="submit" disabled={isCreating}>
              Send invite
            </Button>
          </Dlg.DialogFooter>
        </Form>
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default AddForm;
