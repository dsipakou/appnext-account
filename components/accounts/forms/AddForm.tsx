import { useSession } from 'next-auth/react';
import * as React from 'react';
import * as z from 'zod';

import { CategoryType } from '@/components/categories/types';
// Components
import { Button } from '@/components/ui/button';
// UI
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
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
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormValues, string>>>({});

  const { toast } = useToast();

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
      toast({
        title: 'Saved!',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'Please, check your fields',
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
      const { fieldErrors } = z.flattenError(result.error);

      setErrors({
        title: fieldErrors.title?.[0],
        user: fieldErrors.user?.[0],
        category: fieldErrors.category?.[0],
        isMain: fieldErrors.isMain?.[0],
        description: fieldErrors.description?.[0],
      });

      return;
    }

    setErrors({});
    await handleSave(result.data);
  };

  return (
    <Dialog onOpenChange={cleanFormErrors}>
      <DialogTrigger asChild className="mx-2">
        <Button>+ Add account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add account</DialogTitle>
        </DialogHeader>
        <Form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col space-y-3">
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
                  <FieldError>{errors.title}</FieldError>
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
                    <FieldLabel htmlFor="isMain">Active</FieldLabel>
                  </div>
                  <FieldError>{errors.isMain}</FieldError>
                </Field>
              </div>
            </div>
            <div className="flex w-full">
              <div className="flex w-1/2">
                <Field name="user">
                  <FieldLabel>User</FieldLabel>
                  <Select
                    onValueChange={(user) => setValues((current) => ({ ...current, user }))}
                    value={values.user || undefined}
                    disabled={isCreating}
                  >
                    <SelectTrigger className="relative w-full">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {users &&
                          users.map((item: User) => (
                            <SelectItem key={item.uuid} value={item.uuid}>
                              {item.username}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError>{errors.user}</FieldError>
                </Field>
              </div>
              <div className="flex w-1/2">
                <Field name="category">
                  <FieldLabel>Income category</FieldLabel>
                  <Select
                    onValueChange={(category) =>
                      setValues((current) => ({ ...current, category: category === 'none' ? '' : category }))
                    }
                    value={values.category || 'none'}
                    disabled={isCreating}
                  >
                    <SelectTrigger className="relative w-full">
                      <SelectValue placeholder="Without category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="none">
                          <em className="text-gray-400">Without category</em>
                        </SelectItem>
                        {incomeCategories.map((item) => (
                          <SelectItem key={item.uuid} value={item.uuid}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError>{errors.category}</FieldError>
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
                <FieldError>{errors.description}</FieldError>
              </Field>
            </div>
          </div>
          <Button type="submit">Save</Button>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddForm;
