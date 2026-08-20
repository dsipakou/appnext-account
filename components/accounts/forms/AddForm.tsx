import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
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
import { Label } from '@/components/ui/label';
import * as Slc from '@/components/ui/select';
import * as Tgl from '@/components/ui/toggle-group';
import { Textarea } from '@/components/ui/textarea';
import { toastManager } from '@/components/ui/toast';
import { User } from '@/components/users/types';
import { useCreateAccount } from '@/hooks/accounts';
import { useCategories } from '@/hooks/categories';
import { useUsers } from '@/hooks/users';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  title: z.string().min(2, {
    error: 'Title must be at least 2 characters',
  }),
  user: z.uuid({ error: 'Please, select user' }),
  category: z.union([z.uuid(), z.string().length(0)]),
  kind: z.union([z.literal('spending'), z.literal('savings')]),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddForm: React.FC = () => {
  const [hasIncomeCategory, setHasIncomeCategory] = React.useState<boolean>(false);
  const [values, setValues] = React.useState<FormValues>({
    title: '',
    user: '',
    category: '',
    kind: 'spending',
    description: '',
  });
  const [errors, setErrors] = React.useState<FormErrors>({});

  const { data: session } = useSession();
  const authUser = session?.user;

  const { data: users = [] } = useUsers();
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
      await createAccount({ ...payload, category: hasIncomeCategory ? payload.category : '' });
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
          <Dlg.DialogPanel className="flex w-full flex-col gap-4">
            <Field name="kind">
              <div className="flex w-full items-center justify-center space-x-2">
                <Tgl.ToggleGroup
                  id="kind"
                  value={values.kind}
                  onValueChange={(selectedValues) => {
                    return setValues((current) => ({
                      ...current,
                      kind: selectedValues[0],
                    }));
                  }}
                  type="single"
                  disabled={isCreating}
                  variant="outline"
                >
                  <Tgl.ToggleGroupItem className="w-1/2" value="savings">
                    <span className="px-2">Savings account</span>
                  </Tgl.ToggleGroupItem>
                  <Tgl.ToggleGroupSeparator />
                  <Tgl.ToggleGroupItem className="w-1/2" value="spending">
                    <div className="mx-2 flex items-center gap-3">
                      <span>Spending account</span>
                    </div>
                  </Tgl.ToggleGroupItem>
                </Tgl.ToggleGroup>
              </div>
              <FieldError />
            </Field>
            <div className="flex w-full flex-row gap-2">
              <div className="flex flex-2/3 items-center gap-2">
                <Field name="title" className="w-full">
                  <FieldLabel>Account title</FieldLabel>
                  <Input
                    disabled={isCreating}
                    id="title"
                    value={values.title}
                    onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
                  />
                  <FieldError />
                </Field>
              </div>
              <div className="flex flex-1/3 items-center gap-2">
                <Field name="user" className="w-full">
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
            </div>
            <Field name="category">
              <div className="flex w-full flex-row">
                <div className="flex flex-1 items-center gap-2">
                  <Label>With regular income</Label>
                  <Switch checked={hasIncomeCategory} onCheckedChange={setHasIncomeCategory} disabled={isCreating} />
                </div>
                <div className={cn('flex w-full flex-1', !hasIncomeCategory && 'hidden')}>
                  <Slc.Select
                    onValueChange={(category) =>
                      setValues((current) => ({ ...current, category: category === 'none' ? '' : category }))
                    }
                    value={values.category || incomeCategories[0]?.uuid}
                    disabled={isCreating}
                    items={incomeCategories.map((item) => ({
                      label: item.name,
                      value: item.uuid,
                    }))}
                  >
                    <Slc.SelectTrigger className="relative w-full">
                      <Slc.SelectValue />
                    </Slc.SelectTrigger>
                    <Slc.SelectPopup>
                      <Slc.SelectGroup>
                        {incomeCategories.map((item) => (
                          <Slc.SelectItem key={item.uuid} value={item.uuid}>
                            <span>{item.name}</span>
                          </Slc.SelectItem>
                        ))}
                      </Slc.SelectGroup>
                    </Slc.SelectPopup>
                  </Slc.Select>
                </div>
              </div>
              <FieldError />
            </Field>
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
