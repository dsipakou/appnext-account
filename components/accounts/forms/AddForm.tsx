// System
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Category, CategoryType } from '@/components/categories/types';
// Components
import { Button } from '@/components/ui/button';
// UI
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const AddForm: React.FC = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      isMain: false,
    },
  });

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
    form.setValue('user', getDefaultUser());
  }, [authUser, users]);

  const handleSave = async (payload: z.infer<typeof formSchema>) => {
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
      form.clearErrors();
    }
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
            <div className="flex flex-col space-y-3">
              <div className="flex w-full">
                <div className="flex w-2/3">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account title</FormLabel>
                        <FormControl>
                          <Input className="w-full" disabled={isCreating} id="title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex w-1/3 items-center">
                  <FormField
                    control={form.control}
                    name="isMain"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="isMain"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isCreating}
                            />
                            <Label htmlFor="isMain">Active</Label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex w-full">
                <div className="flex w-1/2">
                  <FormField
                    control={form.control}
                    name="user"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value} disabled={isCreating}>
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex w-1/2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Income category</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value} disabled={isCreating}>
                            <SelectTrigger className="relative w-full">
                              <SelectValue placeholder="Without category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="none">
                                  <em className="text-gray-400">Without category</em>
                                </SelectItem>
                                {incomeCategories.map((item: Category) => (
                                  <SelectItem key={item.uuid} value={item.uuid}>
                                    {item.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex pt-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Add description if you want"
                          className="resize-none"
                          disabled={isCreating}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button type="submit">Save</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddForm;
