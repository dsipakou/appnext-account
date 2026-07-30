import { Repeat } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSWRConfig } from 'swr';
import * as z from 'zod';

import { Category, CategoryType } from '@/components/categories/types';
import { Currency } from '@/components/currencies/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { MaskedInput } from '@/components/ui/currency-input';
import * as Dlg from '@/components/ui/dialog';
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
import { useBudgetDetails, useEditBudget } from '@/hooks/budget';
import { useCategories } from '@/hooks/categories';
import { useCurrencies } from '@/hooks/currencies';
import { useUsers } from '@/hooks/users';
import { cn } from '@/lib/utils';
import { getFormattedDate, parseDate } from '@/utils/dateUtils';
import { extractErrorMessage } from '@/utils/stringUtils';

interface Types {
  open: boolean;
  setOpen: (open: boolean) => void;
  uuid: string;
}

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters',
  }),
  amount: z.coerce.number().min(0, {
    message: 'Should be positive number',
  }),
  currency: z.uuid({ error: 'Please, select currency' }),
  user: z.uuid({ error: 'Please, select user' }),
  category: z.uuid({ error: 'Please, select category' }),
  repeatType: z.enum(['', 'weekly', 'monthly']),
  numberOfRepetitions: z.coerce.number().int().positive().optional(),
  budgetDate: z.date({
    message: 'Budget date is required',
  }),
  description: z.string().or(z.null()),
});

type FormValues = z.infer<typeof formSchema>;

const EditForm: React.FC<Types> = ({ open, setOpen, uuid }) => {
  const { mutate } = useSWRConfig();
  const [isSomeDay, setIsSomeDay] = useState<boolean>(false);
  const [values, setValues] = useState<FormValues>({
    title: '',
    amount: 0,
    currency: '',
    user: '',
    category: '',
    repeatType: '',
    numberOfRepetitions: undefined,
    budgetDate: new Date(),
    description: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: users = [] } = useUsers();
  const { data: categories = [] } = useCategories();
  const { data: currencies = [] } = useCurrencies();
  const { trigger: editBudget, isMutating: isEditing } = useEditBudget(uuid);
  const { data: budgetDetails } = useBudgetDetails(uuid);

  const parentList = useMemo(
    () => categories.filter((category) => category.parent === null && category.type === CategoryType.Expense),
    [categories],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    // Cannot focus immediately, need to wait for the dialog animation to finish
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 100);
  }, [open]);

  useEffect(() => {
    if (!budgetDetails || parentList.length === 0) {
      return;
    }

    setIsSomeDay(!budgetDetails.budgetDate);

    setValues({
      category: budgetDetails.category,
      user: budgetDetails.user,
      currency: budgetDetails.currency,
      amount: budgetDetails.amount ?? 0,
      title: budgetDetails.title || '',
      repeatType: budgetDetails.recurrent || '',
      numberOfRepetitions: budgetDetails.numberOfRepetitions ?? undefined,
      budgetDate: budgetDetails.budgetDate ? parseDate(budgetDetails.budgetDate) : new Date(),
      description: budgetDetails.description || '',
    });
  }, [budgetDetails, parentList]);

  const getCurrencySign = (): string => {
    return currencies.find((item: Currency) => item.uuid === values.currency)?.sign || '';
  };

  const handleSave = async (payload: FormValues): Promise<void> => {
    const budgetData = {
      title: payload.title,
      amount: payload.amount,
      currency: payload.currency,
      user: payload.user,
      category: payload.category,
      budgetDate: isSomeDay ? null : getFormattedDate(payload.budgetDate),
      description: payload.description,
      recurrent: payload.repeatType,
      numberOfRepetitions: payload.numberOfRepetitions ?? null,
    };

    try {
      await editBudget(budgetData);
      mutate((key) => typeof key === 'string' && key.includes('budget/usage'), undefined);
      mutate((key) => typeof key === 'string' && key.includes('budget/weekly-usage'), undefined);
      mutate('budget/pending/');
      toast({
        title: 'Successfully updated!',
      });
      setOpen(false);
    } catch (error) {
      const message = extractErrorMessage(error);
      toast({
        variant: 'destructive',
        title: 'Cannot be updated',
        description: message,
      });
    }
  };

  const cleanFormErrors = (nextOpen: boolean) => {
    if (!nextOpen) {
      setErrors({});
      setValues({
        title: '',
        amount: 0,
        currency: '',
        user: '',
        category: '',
        repeatType: '',
        numberOfRepetitions: undefined,
        budgetDate: new Date(),
        description: '',
      });
      setIsSomeDay(false);
    }
    setOpen(nextOpen);
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

  return (
    <Dlg.Dialog open={open} onOpenChange={cleanFormErrors}>
      <Dlg.DialogPopup className="min-w-4xl">
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Edit budget</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <Form onSubmit={handleSubmit} className="contents">
          <Dlg.DialogPanel>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-7 flex flex-col gap-2">
                <div className="grid gap-2">
                  <div className="flex flex-col gap-2">
                    <Field name="title">
                      <FieldLabel className="pl-1">Budget title</FieldLabel>
                      <Input
                        ref={titleInputRef}
                        placeholder="Title"
                        disabled={isEditing}
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
                              id="amount"
                              disabled={isEditing}
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
                        <FieldError />
                      </Field>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Field name="currency">
                        <FieldLabel className="pl-1">Currency</FieldLabel>
                        <Select
                          disabled={isEditing}
                          onValueChange={(currency) => setValues((current) => ({ ...current, currency }))}
                          value={values.currency || undefined}
                        >
                          <SelectTrigger className="relative w-full" id="currency">
                            <SelectValue placeholder="Select a currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Currencies</SelectLabel>
                              {currencies.map((item: Currency) => (
                                <SelectItem key={item.uuid} value={item.uuid}>
                                  {item.code}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FieldError />
                      </Field>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Field name="category">
                      <FieldLabel className="pl-1">Category</FieldLabel>
                      <Select
                        disabled={isEditing}
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
                      <FieldError />
                    </Field>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Field name="user">
                      <FieldLabel className="pl-1">User</FieldLabel>
                      <Select
                        disabled={isEditing}
                        onValueChange={(user) => setValues((current) => ({ ...current, user }))}
                        value={values.user || undefined}
                      >
                        <SelectTrigger className="relative w-full" id="user">
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Budget owner</SelectLabel>
                            {users.map((item: User) => (
                              <SelectItem key={item.uuid} value={item.uuid}>
                                {item.username}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
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
                        <FieldLabel className="text-sm text-muted-foreground">
                          Number of repetitions (leave empty for infinite)
                        </FieldLabel>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Infinite"
                          disabled={isEditing}
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
                      disabled={isEditing}
                      placeholder="Add description if you want"
                      className="h-full resize-none"
                      value={values.description ?? ''}
                      onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
                    />
                    <FieldError />
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
                        disabled={(calendarDate) => isEditing || calendarDate < new Date('1900-01-01') || isSomeDay}
                        weekStartsOn={1}
                      />
                      <FieldError />
                    </Field>
                    <div className="flex flex-col items-start gap-2">
                      <Field name="isSomeday">
                        <FieldLabel>Save for later</FieldLabel>
                        <div className="mt-1 flex items-center gap-2">
                          <Switch
                            id="isSomeday"
                            checked={isSomeDay}
                            disabled={isEditing}
                            onCheckedChange={setIsSomeDay}
                          />
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

export default React.memo(EditForm);
