import * as React from 'react';
import { useSWRConfig } from 'swr';
import * as z from 'zod';

import { AccountResponse } from '@/components/accounts/types';
import { CategoryType } from '@/components/categories/types';
import { Button } from '@/components/ui/button';
import * as Dlg from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Form, type FormErrors } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import * as Slc from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toastManager } from '@/components/ui/toast';
import { useAccounts, useUpdateAccount } from '@/hooks/accounts';
import { useCategories } from '@/hooks/categories';
import { useUsers } from '@/hooks/users';
import { extractErrorMessage } from '@/utils/stringUtils';

interface Types {
  uuid: string;
}

const formSchema = z.object({
  title: z.string().min(2, {
    error: 'Title must be at least 2 characters',
  }),
  user: z.uuid({ error: 'Please, select user' }),
  category: z
    .union([z.uuid(), z.string().length(0)])
    .optional()
    .nullable(),
  isMain: z.boolean(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const EditForm: React.FC<Types> = ({ uuid }) => {
  const { mutate } = useSWRConfig();
  const [values, setValues] = React.useState<FormValues>({
    title: '',
    user: '',
    category: '',
    isMain: false,
    description: '',
  });
  const [errors, setErrors] = React.useState<FormErrors>({});

  const { data: accounts = [] } = useAccounts();
  const { trigger: updateAccount, isMutating: isUpdating } = useUpdateAccount(uuid);

  const { data: users = [] } = useUsers();

  const { data: categories = [] } = useCategories();
  const incomeCategories = React.useMemo(
    () => categories.filter((item) => item.type === CategoryType.Income),
    [categories],
  );

  React.useEffect(() => {
    if (accounts.length === 0) return;

    const _account = accounts.find((_item: AccountResponse) => _item.uuid === uuid)!;

    setValues({
      title: _account.title,
      user: _account.user,
      isMain: _account.isMain,
      category: _account.category ?? '',
      description: _account.description ?? '',
    });
  }, [accounts, uuid]);

  const cleanFormErrors = (open: boolean) => {
    if (!open) {
      setErrors({});
    }
  };

  const handleSave = async (payload: FormValues) => {
    // TODO: optimistic update
    try {
      await updateAccount(payload);
      mutate('accounts/');
      toastManager.add({
        id: 'account-update',
        title: 'Saved!',
        type: 'success',
      });
    } catch (error) {
      const message = extractErrorMessage(error);
      toastManager.add({
        id: 'account-update-error',
        title: 'Something went wrong',
        description: message,
        type: 'error',
      });
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
      <Dlg.DialogTrigger className="mx-2" render={<Button variant="ghost" />}>
        Edit
      </Dlg.DialogTrigger>
      <Dlg.DialogPopup>
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Edit account</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <Form errors={errors} onSubmit={handleSubmit} className="contents">
          <Dlg.DialogPanel>
            <div className="flex w-full">
              <div className="flex w-2/3">
                <Field name="title">
                  <FieldLabel>Account title</FieldLabel>
                  <Input
                    className="w-full"
                    disabled={isUpdating}
                    id="title"
                    value={values.title}
                    onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
                  />
                  <FieldError />
                </Field>
              </div>
              <div className="flex w-1/3 items-center">
                <Field name="isMain">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isMain"
                      checked={values.isMain}
                      onCheckedChange={(checked) => setValues((current) => ({ ...current, isMain: checked }))}
                      disabled={isUpdating}
                    />
                    <FieldLabel htmlFor="isMain">Active</FieldLabel>
                  </div>
                  <FieldError />
                </Field>
              </div>
            </div>
            <div className="flex w-full">
              <div className="flex w-1/2">
                <Field name="user">
                  <FieldLabel>User</FieldLabel>
                  <Slc.Select
                    onValueChange={(user) => setValues((current) => ({ ...current, user }))}
                    value={values.user || ''}
                    disabled={isUpdating}
                    items={users.map((u) => ({ value: u.uuid, label: u.username }))}
                  >
                    <Slc.SelectTrigger className="relative w-full">
                      <Slc.SelectValue placeholder="Select user" />
                    </Slc.SelectTrigger>
                    <Slc.SelectPopup>
                      <Slc.SelectGroup>
                        {users.length > 0 &&
                          users.map((item) => (
                            <Slc.SelectItem key={item.uuid} value={item.uuid}>
                              {item.username}
                            </Slc.SelectItem>
                          ))}
                      </Slc.SelectGroup>
                    </Slc.SelectPopup>
                  </Slc.Select>
                  <FieldError />
                </Field>
              </div>
              <div className="flex w-1/2">
                <Field name="category">
                  <FieldLabel>Income category</FieldLabel>
                  <Slc.Select
                    onValueChange={(category) =>
                      setValues((current) => ({ ...current, category: category === 'none' ? '' : category }))
                    }
                    value={values.category || 'none'}
                    disabled={isUpdating}
                    items={incomeCategories.map((item) => ({ label: item.name, value: item.uuid }))}
                  >
                    <Slc.SelectTrigger className="relative w-full">
                      <Slc.SelectValue placeholder="Select category" />
                    </Slc.SelectTrigger>
                    <Slc.SelectPopup>
                      <Slc.SelectGroup>
                        <Slc.SelectItem value="none">
                          <em>No income for this category</em>
                        </Slc.SelectItem>
                        {incomeCategories.map((item) => (
                          <Slc.SelectItem key={item.uuid} value={item.uuid}>
                            {item.name}
                          </Slc.SelectItem>
                        ))}
                      </Slc.SelectGroup>
                    </Slc.SelectPopup>
                  </Slc.Select>
                  <FieldError />
                </Field>
              </div>
            </div>
            <div className="flex pt-6">
              <Field name="description">
                <Textarea
                  placeholder="Add description if you want"
                  className="resize-none"
                  disabled={isUpdating}
                  value={values.description ?? ''}
                  onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
                />
                <FieldError />
              </Field>
            </div>
          </Dlg.DialogPanel>
          <Dlg.DialogFooter>
            <Button disabled={isUpdating} type="submit">
              Save
            </Button>
          </Dlg.DialogFooter>
        </Form>
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default EditForm;
