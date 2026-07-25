import React from 'react';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import * as Dialog from '@/components/ui/dialog';
import * as Field from '@/components/ui/field';
import * as Form from '@/components/ui/form';
import { Input } from '@/components/ui/input';
// UI
import { useToast } from '@/components/ui/use-toast';
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
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormValues, string>>>({});

  const { toast } = useToast();
  const { trigger: resetPassword, isMutating: isReseting } = useResetPassword();

  const handleCommit = async (payload: FormValues) => {
    try {
      await resetPassword({
        oldPassword: payload.currentPassword,
        newPassword: payload.newPassword,
      });
      toast({
        title: 'Password updated!',
      });
    } catch (error) {
      const message = extractErrorMessage(error);
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: JSON.stringify(message),
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
      const { fieldErrors } = z.flattenError(result.error);
      setErrors({
        currentPassword: fieldErrors.currentPassword?.[0],
        newPassword: fieldErrors.newPassword?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      });
      return;
    }

    setErrors({});
    await handleCommit(result.data);
  };

  return (
    <Dialog.Dialog onOpenChange={cleanFormErrors}>
      <Dialog.DialogTrigger asChild className="mx-2">
        <Button>Change Password</Button>
      </Dialog.DialogTrigger>
      <Dialog.DialogContent>
        <Dialog.DialogHeader>
          <Dialog.DialogTitle>Add user to the workspace</Dialog.DialogTitle>
        </Dialog.DialogHeader>
        <Form.Form onSubmit={handleSubmit} className="space-y-4">
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
              <Field.FieldError>{errors.currentPassword}</Field.FieldError>
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
              <Field.FieldError>{errors.newPassword}</Field.FieldError>
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
              <Field.FieldError>{errors.confirmPassword}</Field.FieldError>
            </Field.Field>
          </div>
          <Button type="submit">Reset password</Button>
        </Form.Form>
      </Dialog.DialogContent>
    </Dialog.Dialog>
  );
};

export default ChangePasswordForm;
