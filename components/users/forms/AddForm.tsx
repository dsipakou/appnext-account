import React from 'react';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import * as Dlg from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useCreateInvite } from '@/hooks/users';
import { extractErrorMessage } from '@/utils/stringUtils';

const formSchema = z.object({
  email: z.string().email(),
});

type FormValues = z.infer<typeof formSchema>;

const AddForm: React.FC = () => {
  const [values, setValues] = React.useState<FormValues>({ email: '' });
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormValues, string>>>({});

  const { toast } = useToast();
  const { trigger: createInvite, isMutating: isCreating } = useCreateInvite();

  const cleanFormErrors = (open: boolean) => {
    if (!open) {
      setErrors({});
      setValues({ email: '' });
    }
  };

  const handleSave = async (payload: FormValues) => {
    try {
      await createInvite(payload);
      toast({
        title: 'Saved!',
      });
    } catch (error) {
      const message = extractErrorMessage(error);
      if (JSON.stringify(message).includes('unique set')) {
        toast({
          variant: 'destructive',
          title: 'You have already sent invite for this user',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Something went wrong',
          description: JSON.stringify(message),
        });
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = formSchema.safeParse(values);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      setErrors({ email: fieldErrors.email?.[0] });
      return;
    }

    setErrors({});
    await handleSave(result.data);
  };

  return (
    <Dlg.Dialog onOpenChange={cleanFormErrors}>
      <Dlg.DialogTrigger className="mx-2" render={<Button />}>
        + Add member
      </Dlg.DialogTrigger>
      <Dlg.DialogPopup>
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Add user to the workspace</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <Form onSubmit={handleSubmit} className="contents">
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
                <FieldError>{errors.email}</FieldError>
              </Field>
            </div>
          </Dlg.DialogPanel>
          <Dlg.DialogFooter>
            <Dlg.DialogClose render={<Button variant="ghost" />}>Cancel</Dlg.DialogClose>
            <Button type="submit">Send invite</Button>
          </Dlg.DialogFooter>
        </Form>
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default AddForm;
