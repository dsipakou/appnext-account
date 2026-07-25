import { Repeat } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useSWRConfig } from 'swr';
import * as z from 'zod';

import { Category, CategoryType } from '@/components/categories/types';
import { Currency } from '@/components/currencies/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { MaskedInput } from '@/components/ui/currency-input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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
import { useCreateBudget } from '@/hooks/budget';
import { useCategories } from '@/hooks/categories';
import { useCurrencies } from '@/hooks/currencies';
import { useUsers } from '@/hooks/users';
import { cn } from '@/lib/utils';
import { getFormattedDate } from '@/utils/dateUtils';

interface Types {
  date?: Date;
  customTrigger?: React.ReactElement;
}

const formSchema = z.object({
  title: z.string().min(2, {
    error: 'Title must be at least 2 characters',
  }),
  amount: z.coerce.number().min(0, {
    error: 'Should be positive number',
  }),
  currency: z.uuid({ error: 'Please, select currency' }),
  user: z.uuid({ error: 'Please, select user' }),
  category: z.uuid({ error: 'Please, select category' }),
  repeatType: z.enum(['', 'weekly', 'monthly']),
  numberOfRepetitions: z.coerce.number().int().positive().optional(),
  budgetDate: z.date(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddForm: FC<Types> = ({ date, customTrigger }) => {
  const { mutate } = useSWRConfig();
  const [isSomeDay, setIsSomeDay] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [values, setValues] = useState<FormValues>({
    title: '',
    amount: 0,
    currency: '',
    user: '',
    category: '',
    repeatType: '',
    numberOfRepetitions: undefined,
    budgetDate: date || new Date(),
    description: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const titleInputRef = useRef<HTMLInputElement>(null);

  const { data: session } = useSession();
  const authUser = session!.user;

  const { toast } = useToast();

  const { data: users } = useUsers();

  const { data: currencies } = useCurrencies();

  const { data: categories = [] } = useCategories();

  const { trigger: createBudget, isMutating: isCreating } = useCreateBudget();

  const parentList = useMemo(
    () => categories.filter((category) => category.parent === null && category.type === CategoryType.Expense),
    [categories],
  );

  useEffect(() => {
    if (open) {
      setValues((current) => ({ ...current, budgetDate: date || new Date() }));
      // Cannot focus immediately, need to wait for the dialog animation to finish
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [date, open]);

  useEffect(() => {
    const defaultCurrency = getDefaultCurrency();

    if (defaultCurrency) {
      setValues((current) => (current.currency ? current : { ...current, currency: defaultCurrency }));
    }
  }, [currencies]);

  useEffect(() => {
    const defaultUser = getDefaultUser();

    if (defaultUser) {
      setValues((current) => (current.user ? current : { ...current, user: defaultUser }));
    }
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
    return currencies.find((item: Currency) => item.uuid === values.currency)?.sign || '';
  };

  const getFormDefaults = (): FormValues => ({
    title: '',
    amount: 0,
    currency: getDefaultCurrency(),
    user: getDefaultUser(),
    category: '',
    repeatType: '',
    numberOfRepetitions: undefined,
    budgetDate: date || new Date(),
    description: '',
  });

  const handleSave = async (payload: FormValues) => {
    try {
      const budgetData = {
        ...payload,
        recurrent: payload.repeatType,
        budgetDate: isSomeDay ? null : getFormattedDate(payload.budgetDate),
        numberOfRepetitions: payload.numberOfRepetitions ?? null,
      };

      await createBudget(budgetData);
      mutate((key) => typeof key === 'string' && key.includes('budget/usage'), undefined);
      mutate((key) => typeof key === 'string' && key.includes('budget/weekly-usage'), undefined);
      mutate('budget/pending/');
      clean(false);
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

  const clean = (open: boolean) => {
    if (!open) {
      setErrors({});
      setValues(getFormDefaults());
      setIsSomeDay(false);
    }
    setOpen(open);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = formSchema.safeParse(values);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);

      setErrors({
        title: fieldErrors.title?.[0],
        amount: fieldErrors.amount?.[0],
        currency: fieldErrors.currency?.[0],
        user: fieldErrors.user?.[0],
        category: fieldErrors.category?.[0],
        repeatType: fieldErrors.repeatType?.[0],
        numberOfRepetitions: fieldErrors.numberOfRepetitions?.[0],
        budgetDate: fieldErrors.budgetDate?.[0],
        description: fieldErrors.description?.[0],
      });

      return;
    }

    setErrors({});
    await handleSave(result.data);
  };

  const defaultTrigger = <Button className="mx-2">+ Add budget</Button>;

  return (
    <Dialog onOpenChange={clean} open={open} modal={false}>
      <DialogTrigger asChild>{customTrigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="min-w-200">
        <DialogHeader>
          <DialogTitle>Add budget</DialogTitle>
        </DialogHeader>
        <Form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-7 flex flex-col gap-2">
                <div className="grid gap-2">
                  <div className="flex flex-col gap-2">
                    <Field name="title">
                      <FieldLabel htmlFor="title" className="pl-1">
                        Budget title
                      </FieldLabel>
                      <Input
                        ref={titleInputRef}
                        placeholder="Title"
                        disabled={isCreating}
                        id="title"
                        value={values.title}
                        onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
                      />
                      <FieldError>{errors.title}</FieldError>
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-2">
                      <Field name="amount">
                        <FieldLabel htmlFor="amount" className="pl-1">
                          Amount
                        </FieldLabel>
                        <div className="flex gap-2">
                          <div>
                            <MaskedInput
                              mask={Number}
                              unmask="typed"
                              value={values.amount}
                              onAccept={(value) => setValues((current) => ({ ...current, amount: Number(value) || 0 }))}
                              id="amount"
                              disabled={isCreating}
                              scale={2}
                              signed={false}
                              thousandsSeparator=","
                              radix="."
                              normalizeZeros
                              padFractionalZeros={false}
                              mapToRadix={[',']}
                            />
                          </div>
                          <span className="flex items-center text-sm">{values.currency && getCurrencySign()}</span>
                        </div>
                        <FieldError>{errors.amount}</FieldError>
                      </Field>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Field name="currency">
                        <FieldLabel htmlFor="currency" className="pl-1">
                          Currency
                        </FieldLabel>
                        <Select
                          disabled={isCreating}
                          onValueChange={(currency) => setValues((current) => ({ ...current, currency }))}
                          value={values.currency || undefined}
                        >
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
                        <FieldError>{errors.currency}</FieldError>
                      </Field>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Field name="category">
                      <FieldLabel htmlFor="category" className="pl-1">
                        Category
                      </FieldLabel>
                      <Select
                        disabled={isCreating}
                        onValueChange={(category) => setValues((current) => ({ ...current, category }))}
                        value={values.category || undefined}
                      >
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
                      <FieldError>{errors.category}</FieldError>
                    </Field>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Field name="user">
                      <FieldLabel htmlFor="user" className="pl-1">
                        User
                      </FieldLabel>
                      <Select
                        disabled={isCreating}
                        onValueChange={(user) => setValues((current) => ({ ...current, user }))}
                        value={values.user || undefined}
                      >
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
                      <FieldError>{errors.user}</FieldError>
                    </Field>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Field name="repeatType">
                      <FieldLabel htmlFor="repeat" className="pl-1">
                        Repeat
                      </FieldLabel>
                      <ToggleGroup
                        id="repeat"
                        className="w-full"
                        value={values.repeatType ? [values.repeatType] : ['__none__']}
                        onValueChange={(selectedValues) => {
                          const repeatType = selectedValues[0] ?? '__none__';

                          setValues((current) => ({
                            ...current,
                            repeatType: repeatType === '__none__' ? '' : (repeatType as FormValues['repeatType']),
                          }));
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
                      <FieldError>{errors.repeatType}</FieldError>
                    </Field>
                  </div>
                  <div>
                    {(values.repeatType === 'weekly' || values.repeatType === 'monthly') && (
                      <Field name="numberOfRepetitions">
                        <FieldLabel className="text-sm text-muted-foreground">
                          Number of repetitions (leave empty for infinite)
                        </FieldLabel>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Infinite"
                          disabled={isCreating}
                          value={values.numberOfRepetitions ?? ''}
                          onChange={(event) => {
                            const repetitions = event.target.value;

                            setValues((current) => ({
                              ...current,
                              numberOfRepetitions: repetitions === '' ? undefined : parseInt(repetitions, 10),
                            }));
                          }}
                        />
                        <FieldError>{errors.numberOfRepetitions}</FieldError>
                      </Field>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Field name="description">
                    <FieldLabel htmlFor="description" className="pl-1">
                      Descripion (optional)
                    </FieldLabel>
                    <Textarea
                      id="description"
                      disabled={isCreating}
                      placeholder="Add description if you want"
                      className="h-full resize-none"
                      value={values.description ?? ''}
                      onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
                    />
                    <FieldError>{errors.description}</FieldError>
                  </Field>
                </div>
              </div>
              <div className="col-span-5 h-full items-center justify-center">
                <div className="items-top flex h-full justify-center gap-2">
                  <div className="h-full">
                    <Separator orientation="vertical" className="h-full" />
                  </div>
                  <div>
                    <Field name="budgetDate" className="flex justify-center">
                      <Calendar
                        mode="single"
                        className={cn('justify-center', isSomeDay && 'blur-xs')}
                        selected={isSomeDay ? undefined : values.budgetDate}
                        onSelect={(budgetDate) => budgetDate && setValues((current) => ({ ...current, budgetDate }))}
                        disabled={(calendarDate) => isCreating || calendarDate < new Date('1900-01-01') || isSomeDay}
                        weekStartsOn={1}
                      />
                      <FieldError>{errors.budgetDate}</FieldError>
                    </Field>
                    <div className="flex flex-col items-start gap-2">
                      <Field name="isSomeday">
                        <FieldLabel htmlFor="isSomeday">Save for later</FieldLabel>
                        <div className="mt-1 flex items-center gap-2">
                          <Switch id="isSomeday" checked={isSomeDay} onCheckedChange={setIsSomeDay} />
                        </div>
                      </Field>
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
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddForm;
