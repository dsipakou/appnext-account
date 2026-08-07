import { Repeat } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useSWRConfig } from 'swr';
import * as z from 'zod';

import { CategoryType } from '@/components/categories/types';
import { Currency } from '@/components/currencies/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { MaskedInput } from '@/components/ui/currency-input';
import * as Dlg from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Form, type FormErrors } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import * as Slc from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toastManager } from '@/components/ui/toast';
import { ToggleGroup, ToggleGroupItem, ToggleGroupSeparator } from '@/components/ui/toggle-group';
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
  const [errors, setErrors] = useState<FormErrors>({});
  const titleInputRef = useRef<HTMLInputElement>(null);

  const { data: session } = useSession();
  const authUser = session!.user;

  const { data: users = [] } = useUsers();

  const { data: currencies = [] } = useCurrencies();

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
      toastManager.add({
        id: 'budget-create',
        title: 'Saved!',
        description: 'Your budget has been created successfully.',
        type: 'success',
      });
    } catch {
      toastManager.add({
        id: 'budget-create-error',
        title: 'Something went wrong',
        description: 'Please, check your fields for errors and try again.',
        type: 'error',
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

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = formSchema.safeParse(values);

    if (!result.success) {
      setErrors(z.flattenError(result.error).fieldErrors);

      return;
    }

    setErrors({});
    await handleSave(result.data);
  };

  const defaultTrigger = <Button className="mx-2">+ Add budget</Button>;

  return (
    <Dlg.Dialog onOpenChange={clean} open={open} modal={false}>
      <Dlg.DialogTrigger render={customTrigger || defaultTrigger} />
      <Dlg.DialogPopup className="min-w-4xl">
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Add budget</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <Form errors={errors} onSubmit={handleSubmit} className="contents">
          <Dlg.DialogPanel>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-8 flex flex-col gap-2">
                <div className="grid gap-2">
                  <div className="flex flex-col gap-2">
                    <Field name="title">
                      <FieldLabel className="pl-1">Budget title</FieldLabel>
                      <Input
                        ref={titleInputRef}
                        placeholder="Title"
                        disabled={isCreating}
                        id="title"
                        value={values.title}
                        onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
                      />
                      <FieldError />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-2">
                      <Field name="amount">
                        <FieldLabel className="pl-1">Amount</FieldLabel>
                        <div className="flex gap-2">
                          <div>
                            <MaskedInput
                              mask={Number}
                              unmask="typed"
                              value={values.amount}
                              onAccept={(value) => setValues((current) => ({ ...current, amount: Number(value) || 0 }))}
                              onFocus={(e) =>
                                requestAnimationFrame(() => {
                                  e.target.select();
                                })
                              }
                              id="amount"
                              disabled={isCreating}
                              scale={2}
                              thousandsSeparator=" "
                              radix="."
                              normalizeZeros
                              autofix
                              padFractionalZeros={false}
                              mapToRadix={[',', 'ю', 'б']}
                            />
                          </div>
                          <span className="flex items-center text-sm">{values.currency && getCurrencySign()}</span>
                        </div>
                        <FieldError />
                      </Field>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Field name="currency">
                        <FieldLabel className="pl-1">Currency</FieldLabel>
                        <Slc.Select
                          disabled={isCreating}
                          onValueChange={(currency) => setValues((current) => ({ ...current, currency }))}
                          value={values.currency || ''}
                          items={currencies.map((item: Currency) => ({ label: item.code, value: item.uuid }))}
                        >
                          <Slc.SelectTrigger className="relative w-full" id="currency">
                            <Slc.SelectValue placeholder="Select a currency" />
                          </Slc.SelectTrigger>
                          <Slc.SelectPopup>
                            <Slc.SelectGroup>
                              <Slc.SelectGroupLabel>Currencies</Slc.SelectGroupLabel>
                              {currencies.map((item: Currency) => (
                                <Slc.SelectItem key={item.uuid} value={item.uuid}>
                                  {item.code}
                                </Slc.SelectItem>
                              ))}
                            </Slc.SelectGroup>
                          </Slc.SelectPopup>
                        </Slc.Select>
                        <FieldError />
                      </Field>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Field name="category">
                      <FieldLabel className="pl-1">Category</FieldLabel>
                      <Slc.Select
                        disabled={isCreating}
                        onValueChange={(category) => setValues((current) => ({ ...current, category }))}
                        value={values.category || ''}
                        items={parentList.map((item) => ({ label: item.icon + '  ' + item.name, value: item.uuid }))}
                      >
                        <Slc.SelectTrigger className="relative w-full" id="category">
                          <Slc.SelectValue placeholder="Select category" />
                        </Slc.SelectTrigger>
                        <Slc.SelectPopup>
                          <Slc.SelectGroup>
                            <Slc.SelectGroupLabel>Categories</Slc.SelectGroupLabel>
                            {parentList.map((item) => (
                              <Slc.SelectItem key={item.uuid} value={item.uuid} className="flex items-center">
                                <span className="mr-2">{item.icon}</span>
                                <span>{item.name}</span>
                              </Slc.SelectItem>
                            ))}
                          </Slc.SelectGroup>
                        </Slc.SelectPopup>
                      </Slc.Select>
                      <FieldError />
                    </Field>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Field name="user">
                      <FieldLabel className="pl-1">User</FieldLabel>
                      <Slc.Select
                        disabled={isCreating}
                        onValueChange={(user) => setValues((current) => ({ ...current, user }))}
                        value={values.user || ''}
                        items={users.map((item) => ({ label: item.username, value: item.uuid }))}
                      >
                        <Slc.SelectTrigger className="relative w-full" id="user">
                          <Slc.SelectValue placeholder="Select user" />
                        </Slc.SelectTrigger>
                        <Slc.SelectPopup>
                          <Slc.SelectGroup>
                            <Slc.SelectGroupLabel>Budget owner</Slc.SelectGroupLabel>
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
                  <div className="flex flex-col gap-2">
                    <Field name="repeatType">
                      <FieldLabel className="pl-1">Repeat</FieldLabel>
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
                      <FieldError />
                    </Field>
                  </div>
                  <div>
                    {(values.repeatType === 'weekly' || values.repeatType === 'monthly') && (
                      <Field name="numberOfRepetitions">
                        <FieldLabel className="text-muted-foreground text-sm">
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
                        <FieldError />
                      </Field>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Field name="description">
                    <FieldLabel className="pl-1">Descripion (optional)</FieldLabel>
                    <Textarea
                      id="description"
                      disabled={isCreating}
                      placeholder="Add description if you want"
                      className="h-full resize-none"
                      value={values.description ?? ''}
                      onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
                    />
                    <FieldError />
                  </Field>
                </div>
              </div>
              <div className="col-span-4 h-full items-center justify-center">
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
                      <FieldError />
                    </Field>
                    <div className="flex flex-col items-start gap-2">
                      <Field name="isSomeday">
                        <FieldLabel>Save for later</FieldLabel>
                        <div className="mt-1 flex items-center gap-2">
                          <Switch id="isSomeday" checked={isSomeDay} onCheckedChange={setIsSomeDay} />
                        </div>
                      </Field>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Dlg.DialogPanel>
          <Dlg.DialogFooter>
            <Dlg.DialogClose render={<Button variant="ghost" />}>Cancel</Dlg.DialogClose>
            <Button type="submit">Submit</Button>
          </Dlg.DialogFooter>
        </Form>
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default AddForm;
