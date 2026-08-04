import { useSession } from 'next-auth/react';
import * as React from 'react';
import * as z from 'zod';

import { CategoryType } from '@/components/categories/types';
// Components
import { Button } from '@/components/ui/button';
// UI
import * as Dlg from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Form, type FormErrors } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import * as Slc from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toastManager } from '@/components/ui/toast';
import { User } from '@/components/users/types';
import { useCreateAccount } from '@/hooks/accounts';
import { useCategories } from '@/hooks/categories';
import { useUsers } from '@/hooks/users';

const formSchema = z.object({
  title: z.string().min(2, {
    error: 'Title must be at least 2 characters',
  }),
  user: z.uuid({ error: 'Please, select user' }),
  category: z.union([z.uuid(), z.string().length(0)]).optional(),
  isMain: z.boolean(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddForm: React.FC = () => {
  const [values, setValues] = React.useState<FormValues>({
    title: '',
    user: '',
    category: '',
    isMain: false,
    description: '',
  });
  const [errors, setErrors] = React.useState<FormErrors>({});

  const { data: session } = useSession();
  const authUser = session?.user;

  const { data: users } = useUsers();
  const { data: categories = [] } = useCategories();
  const incomeCategories = React.useMemo(
    () => categories.filter((item) => item.type === CategoryType.Income),
    [categories],
  );

  const { trigger: createAccount, isMutating: isCreating } = useCreateAccount();

  const getDefaultUser = (): string => {
    if (!authUser || !users) {
      return '';
    }

    const _user = users.find((item: User) => item.username === authUser?.username);
    if (_user != null) {
      return _user.uuid;
    }

    return '';
  };

  React.useEffect(() => {
    setValues((current) => ({ ...current, user: getDefaultUser() }));
  }, [authUser, users]);

  const handleSave = async (payload: FormValues) => {
    try {
      await createAccount(payload);
      toastManager.add({
        id: 'account-create',
        title: 'Saved!',
        type: 'success',
      });
    } catch {
      toastManager.add({
        id: 'account-create-error',
        title: 'Something went wrong',
        description: 'Please, check your fields',
        type: 'error',
      });
    }
  };

  const cleanFormErrors = (open: boolean) => {
    if (!open) {
      setErrors({});
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
      <Dlg.DialogTrigger render={<Button />}>+ Add account</Dlg.DialogTrigger>
      <Dlg.DialogPopup>
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Add account</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <Form errors={errors} onSubmit={handleSubmit} className="contents">
          <Dlg.DialogPanel>
            <div className="flex w-full">
              <div className="flex w-2/3">
                <Field name="title">
                  <FieldLabel>Account title</FieldLabel>
                  <Input
                    className="w-full"
                    disabled={isCreating}
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
                      disabled={isCreating}
                    />
                    <FieldLabel>Active</FieldLabel>
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
                    disabled={isCreating}
                    items={users.map((item) => ({ label: item.username, value: item.uuid }))}
                  >
                    <Slc.SelectTrigger className="relative w-full">
                      <Slc.SelectValue placeholder="Select user" />
                    </Slc.SelectTrigger>
                    <Slc.SelectPopup>
                      <Slc.SelectGroup>
                        {users &&
                          users.map((item: User) => (
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
                    disabled={isCreating}
                    items={incomeCategories.map((item) => ({ label: item.name, value: item.uuid }))}
                  >
                    <Slc.SelectTrigger className="relative w-full">
                      <Slc.SelectValue placeholder="Without category" />
                    </Slc.SelectTrigger>
                    <Slc.SelectPopup>
                      <Slc.SelectGroup>
                        <Slc.SelectItem value="none">
                          <em className="text-gray-400">Without category</em>
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
                  disabled={isCreating}
                  value={values.description ?? ''}
                  onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
                />
                <FieldError />
              </Field>
            </div>
          </Dlg.DialogPanel>
          <Dlg.DialogFooter>
            <Dlg.DialogClose render={<Button variant="ghost" />}>Cancel</Dlg.DialogClose>
            <Button type="submit">Save</Button>
          </Dlg.DialogFooter>
        </Form>
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default AddForm;
