import React from 'react';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import * as Dlg from '@/components/ui/dialog';
import * as Field from '@/components/ui/field';
import * as Form from '@/components/ui/form';
import { Input } from '@/components/ui/input';
// UI
import { toastManager } from '@/components/ui/toast';
// Hooks
import { useResetPassword } from '@/hooks/users';
// Utils
import { extractErrorMessage } from '@/utils/stringUtils';

const formSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .superRefine((values, ctx) => {
    if (values.newPassword !== values.confirmPassword) {
      ctx.addIssue({
        message: 'Passwords do not match',
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

const ChangePasswordForm: React.FC = () => {
  const [values, setValues] = React.useState<FormValues>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = React.useState<Form.FormErrors>({});

  const { trigger: resetPassword, isMutating: isReseting } = useResetPassword();

  const handleCommit = async (payload: FormValues) => {
    try {
      await resetPassword({
        oldPassword: payload.currentPassword,
        newPassword: payload.newPassword,
      });
      toastManager.add({
        id: 'user-password-update',
        title: 'Password updated!',
        type: 'success',
      });
    } catch (error) {
      const message = extractErrorMessage(error);
      toastManager.add({
        id: 'user-password-update-error',
        title: 'Something went wrong',
        description: JSON.stringify(message),
        type: 'error',
      });
    }
  };

  const cleanFormErrors = () => {
    setErrors({});
    setValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = formSchema.safeParse(values);

    if (!result.success) {
      setErrors(z.flattenError(result.error).fieldErrors);
      return;
    }

    setErrors({});
    await handleCommit(result.data);
  };

  return (
    <Dlg.Dialog onOpenChange={cleanFormErrors}>
      <Dlg.DialogTrigger className="mx-2" render={<Button />}>
        Change Password
      </Dlg.DialogTrigger>
      <Dlg.DialogPopup>
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Change your current password</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <Form.Form errors={errors} onSubmit={handleSubmit} className="contents">
          <Dlg.DialogPanel>
            <div className="flex w-full">
              <Field.Field name="currentPassword">
                <Field.FieldLabel>Your current password</Field.FieldLabel>
                <Input
                  className="w-full"
                  disabled={isReseting}
                  type="password"
                  id="verbalName"
                  value={values.currentPassword}
                  onChange={(event) => setValues((current) => ({ ...current, currentPassword: event.target.value }))}
                />
                <Field.FieldError />
              </Field.Field>
            </div>
            <div className="flex w-full pt-7">
              <Field.Field name="newPassword">
                <Field.FieldLabel>New password</Field.FieldLabel>
                <Input
                  className="w-full"
                  disabled={isReseting}
                  type="password"
                  id="verbalName"
                  value={values.newPassword}
                  onChange={(event) => setValues((current) => ({ ...current, newPassword: event.target.value }))}
                />
                <Field.FieldError />
              </Field.Field>
            </div>
            <div className="flex w-full">
              <Field.Field name="confirmPassword">
                <Field.FieldLabel>Repeat new password</Field.FieldLabel>
                <Input
                  className="w-full"
                  disabled={isReseting}
                  type="password"
                  id="verbalName"
                  value={values.confirmPassword}
                  onChange={(event) => setValues((current) => ({ ...current, confirmPassword: event.target.value }))}
                />
                <Field.FieldError />
              </Field.Field>
            </div>
          </Dlg.DialogPanel>
          <Dlg.DialogFooter>
            <Dlg.DialogClose render={<Button variant="ghost" />}>Cancel</Dlg.DialogClose>
            <Button type="submit">Reset password</Button>
          </Dlg.DialogFooter>
        </Form.Form>
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default ChangePasswordForm;
