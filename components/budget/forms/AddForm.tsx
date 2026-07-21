import { zodResolver } from '@hookform/resolvers/zod';
import { Repeat } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSWRConfig } from 'swr';
import * as z from 'zod';

import { Category, CategoryType } from '@/components/categories/types';
import { Currency } from '@/components/currencies/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem, ToggleGroupSeparator } from '@/components/ui/toggle-group';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@/components/users/types';
import { useCreateBudget, usePendingBudget } from '@/hooks/budget';
import { useCategories } from '@/hooks/categories';
import { useCurrencies } from '@/hooks/currencies';
import { useUsers } from '@/hooks/users';
import { cn } from '@/lib/utils';
import { getFormattedDate } from '@/utils/dateUtils';

interface Types {
  monthUrl: string;
  weekUrl: string;
  date?: Date;
  customTrigger?: React.ReactElement;
}

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters',
  }),
  amount: z.coerce.number().min(0, {
    message: 'Should be positive number',
  }),
  currency: z.string().uuid({ message: 'Please, select currency' }),
  user: z.string().uuid({ message: 'Please, select user' }),
  category: z.string().uuid({ message: 'Please, select category' }),
  repeatType: z.enum(['', 'weekly', 'monthly']),
  numberOfRepetitions: z.coerce.number().int().positive().optional(),
  budgetDate: z.date(),
  description: z.string().optional(),
});

const AddForm: FC<Types> = ({ monthUrl, weekUrl, date, customTrigger }) => {
  const { mutate } = useSWRConfig();
  const [parentList, setParentList] = useState<Category[]>([]);
  const [isSomeDay, setIsSomeDay] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const { url: pendingUrl } = usePendingBudget();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      amount: 0,
      currency: '',
      user: '',
      category: '',
      repeatType: '',
      numberOfRepetitions: undefined,
      budgetDate: date || new Date(),
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.setValue('budgetDate', date || new Date());
      // Cannot focus immediately, need to wait for the dialog animation to finish
      setTimeout(() => {
        form.setFocus('title');
      }, 100);
    }
  }, [open]);

  const { toast } = useToast();

  const {
    data: { user: authUser },
  } = useSession();

  const { data: users } = useUsers();

  const { data: currencies } = useCurrencies();

  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();

  const { trigger: createBudget, isMutating: isCreating } = useCreateBudget();

  useEffect(() => {
    if (isCategoriesLoading) return;

    const parents = categories.filter(
      (category: Category) => category.parent === null && category.type === CategoryType.Expense,
    );
    setParentList(parents);
  }, [isCategoriesLoading]);

  useEffect(() => {
    form.setValue('currency', getDefaultCurrency());
  }, [currencies]);

  useEffect(() => {
    form.setValue('user', getDefaultUser());
  }, [authUser, users]);

  const getDefaultCurrency = (): string => {
    if (!currencies) {
      return '';
    }

    const _currency = currencies.find((item: Currency) => item.isDefault);
    if (_currency) {
      return _currency.uuid;
    }

    return '';
  };

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

  const getCurrencySign = (): string => {
    return currencies.find((item: Currency) => item.uuid === form.getValues().currency)?.sign;
  };

  const handleSave = async (payload: z.infer<typeof formSchema>) => {
    try {
      const budgetData: any = {
        ...payload,
        recurrent: payload.repeatType,
        budgetDate: isSomeDay ? null : getFormattedDate(payload.budgetDate),
      };

      // Add numberOfRepetitions only if specified (null = infinite)
      if (payload.numberOfRepetitions !== undefined) {
        budgetData.numberOfRepetitions = payload.numberOfRepetitions;
      } else {
        budgetData.numberOfRepetitions = null; // Explicitly null for infinite
      }

      await createBudget(budgetData);
      mutate((key) => typeof key === 'string' && key.includes('budget/usage'), undefined);
      mutate((key) => typeof key === 'string' && key.includes('budget/weekly-usage'), undefined);
      mutate('budget/pending/');
      clean(false);
      toast({
        title: 'Saved!',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'Please, check your fields',
      });
    }
  };

  const clean = (open: boolean) => {
    if (!open) {
      form.clearErrors();
      form.reset();
    }
    setOpen(open);
  };

  const defaultTrigger = <Button className="mx-2">+ Add budget</Button>;

  return (
    <Dialog onOpenChange={clean} open={open}>
      <DialogTrigger asChild>{customTrigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="min-w-200">
        <DialogHeader>
          <DialogTitle>Add budget</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-2">
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-7 flex flex-col gap-2">
                  <div className="grid gap-2">
                    <div className="flex flex-col gap-2">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <Label htmlFor="title" className="pl-1">
                              Budget title
                            </Label>
                            <FormControl>
                              <Input placeholder="Title" disabled={isCreating} id="title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-2">
                        <FormField
                          control={form.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <Label htmlFor="amount" className="pl-1">
                                Amount
                              </Label>
                              <FormControl>
                                <div className="flex gap-2">
                                  <div>
                                    <Input placeholder="10" disabled={isCreating} id="amount" {...field} />
                                  </div>
                                  <span className="flex items-center text-sm">
                                    {form.watch('currency') && getCurrencySign()}
                                  </span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <Label htmlFor="currency" className="pl-1">
                                Currency
                              </Label>
                              <FormControl>
                                <Select disabled={isCreating} onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger className="relative w-full" id="currency">
                                    <SelectValue placeholder="Select a currency" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectLabel>Currencies</SelectLabel>
                                      {currencies &&
                                        currencies.map((item: Currency) => (
                                          <SelectItem key={item.uuid} value={item.uuid}>
                                            {item.code}
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
                    <div className="flex flex-col gap-2">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <Label htmlFor="category" className="pl-1">
                              Category
                            </Label>
                            <FormControl>
                              <Select disabled={isCreating} onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="relative w-full" id="category">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Categories</SelectLabel>
                                    {parentList.map((item: Category) => (
                                      <SelectItem key={item.uuid} value={item.uuid} className="flex items-center">
                                        {item.icon && <span className="mr-2 text-lg">{item.icon}</span>}
                                        <span>{item.name}</span>
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
                    <div className="flex flex-col gap-2">
                      <FormField
                        control={form.control}
                        name="user"
                        render={({ field }) => (
                          <FormItem>
                            <Label htmlFor="user" className="pl-1">
                              User
                            </Label>
                            <FormControl>
                              <Select disabled={isCreating} onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="relative w-full" id="user">
                                  <SelectValue placeholder="Select user" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Budget owner</SelectLabel>
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
                    <div className="flex flex-col gap-2">
                      <FormField
                        control={form.control}
                        name="repeatType"
                        render={({ field }) => (
                          <FormItem>
                            <Label htmlFor="repeat" className="pl-1">
                              Repeat
                            </Label>
                            <FormControl>
                              <ToggleGroup
                                id="repeat"
                                className="w-full"
                                value={field.value ? [field.value] : ['__none__']}
                                onValueChange={(values) => {
                                  const value = values[0] ?? '__none__';

                                  field.onChange(value === '__none__' ? '' : value);
                                }}
                                variant="outline"
                              >
                                <ToggleGroupItem className="w-1/3" value="__none__">
                                  <span className="px-2">One-time budget</span>
                                </ToggleGroupItem>
                                <ToggleGroupSeparator />
                                <ToggleGroupItem className="w-1/3" value="weekly">
                                  <div className="mx-2 flex items-center gap-3">
                                    <Repeat className="h-4 w-4" />
                                    <span>Weekly</span>
                                  </div>
                                </ToggleGroupItem>
                                <ToggleGroupSeparator />
                                <ToggleGroupItem className="w-1/3" value="monthly">
                                  <div className="mx-2 flex items-center gap-3">
                                    <Repeat className="h-4 w-4" />
                                    <span>Monthly</span>
                                  </div>
                                </ToggleGroupItem>
                              </ToggleGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div>
                      {(form.watch('repeatType') === 'weekly' || form.watch('repeatType') === 'monthly') && (
                        <FormField
                          control={form.control}
                          name="numberOfRepetitions"
                          render={({ field }) => (
                            <FormItem>
                              <Label className="text-sm text-muted-foreground">
                                Number of repetitions (leave empty for infinite)
                              </Label>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="Infinite"
                                  disabled={isCreating}
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value === '' ? undefined : parseInt(value, 10));
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="description" className="pl-1">
                            Descripion (optional)
                          </Label>
                          <FormControl>
                            <Textarea
                              id="description"
                              disabled={isCreating}
                              placeholder="Add description if you want"
                              className="h-full resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="col-span-5 h-full items-center justify-center">
                  <div className="items-top flex h-full justify-center gap-2">
                    <div className="h-full">
                      <Separator orientation="vertical" className="h-full" />
                    </div>
                    <div>
                      <FormField
                        control={form.control}
                        name="budgetDate"
                        render={({ field }) => (
                          <FormItem className="flex justify-center">
                            <FormControl>
                              <Calendar
                                mode="single"
                                className={(cn('justify-center'), isSomeDay && 'blur-xs')}
                                selected={isSomeDay ? null : field.value}
                                onSelect={field.onChange}
                                disabled={(date) => isCreating || date < new Date('1900-01-01') || isSomeDay}
                                weekStartsOn={1}
                                initialFocus
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex flex-col items-start gap-2">
                        <FormField
                          control={form.control}
                          name="isSomeday"
                          render={({ field }) => (
                            <FormItem>
                              <Label htmlFor="isSomeday">Save for later</Label>
                              <FormControl>
                                <div className="mt-1 flex items-center gap-2">
                                  <Switch id="isSomeday" checked={isSomeDay} onClick={() => setIsSomeDay(!isSomeDay)} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                {/* FIXME: Cancel button */}
                <Button type="submit">Submit</Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddForm;
