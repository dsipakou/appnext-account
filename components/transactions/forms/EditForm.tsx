import React from 'react';
import { useSWRConfig } from 'swr';
import * as z from 'zod';

// Types
import { AccountResponse } from '@/components/accounts/types';
import { WeekBudgetItem } from '@/components/budget/types';
import { Category, CategoryType } from '@/components/categories/types';
import { Currency } from '@/components/currencies/types';
import { AvailableRate } from '@/components/rates/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
// UI
import * as Dlg from '@/components/ui/dialog';
import * as Field from '@/components/ui/field';
import * as Frm from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import * as Slc from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toastManager } from '@/components/ui/toast';
import { useAccounts } from '@/hooks/accounts';
import { useBudgetWeek } from '@/hooks/budget';
import { useCategories } from '@/hooks/categories';
import { useCurrencies } from '@/hooks/currencies';
import { useAvailableRates } from '@/hooks/rates';
// hooks
import { useTransaction, useUpdateTransaction } from '@/hooks/transactions';
// Utils
import { getEndOfWeek, getFormattedDate, getStartOfWeek, parseDate } from '@/utils/dateUtils';

interface Types {
  uuid: string;
  open: boolean;
  url: string;
  handleClose: () => void;
}

const formSchema = z.object({
  account: z.string().uuid({ message: 'Please, select account' }),
  amount: z.coerce.number().min(0, {
    message: 'Should be positive number',
  }),
  budget: z.string().uuid({ message: 'Please, select budget' }),
  category: z.string().uuid({ message: 'Please, select category' }),
  currency: z.string().uuid({ message: 'Please, select currency' }),
  description: z.string().optional(),
  transactionDate: z.date({
    message: 'Transaction date is required',
  }),
});

type FormValues = {
  account: string;
  amount: string;
  budget: string;
  category: string;
  currency: string;
  description: string;
  transactionDate: Date;
};

const EditForm: React.FC<Types> = ({ uuid, open, url, handleClose }) => {
  const { mutate } = useSWRConfig();
  const [selectedDate, setSelectedDate] = React.useState<string>(getFormattedDate(new Date()));
  const [weekStart, setWeekStart] = React.useState<string>(getStartOfWeek(new Date()));
  const [weekEnd, setWeekEnd] = React.useState<string>(getEndOfWeek(new Date()));
  const [month, setMonth] = React.useState<Date>(new Date());
  const [filteredBudgets, setFilteredBudgets] = React.useState<WeekBudgetItem[]>([]);
  const [values, setValues] = React.useState<FormValues>({
    account: '',
    amount: '',
    budget: '',
    category: '',
    currency: '',
    description: '',
    transactionDate: new Date(),
  });
  const [errors, setErrors] = React.useState<Frm.FormErrors>({});

  const { data: transaction } = useTransaction(uuid);
  const { data: accounts = [] } = useAccounts();
  const { data: budgets = [], isLoading: isBudgetLoading } = useBudgetWeek(weekStart, weekEnd);
  const { data: categories = [] } = useCategories();
  const { data: currencies = [] } = useCurrencies();
  const { trigger: updateTransaction, isMutating: isUpdating } = useUpdateTransaction(uuid);

  const { data: availableRates = [] } = useAvailableRates(selectedDate);

  const parents = categories.filter(
    (category: Category) => category.parent === null && category.type === CategoryType.Expense,
  );

  React.useEffect(() => {
    if (!transaction || accounts.length === 0) return;

    setValues({
      account: transaction.account,
      amount: String(transaction.amount),
      category: transaction.category,
      currency: transaction.currency,
      description: transaction.description || '',
      transactionDate: parseDate(transaction.transactionDate),
      budget: transaction.budget,
    });

    setSelectedDate(transaction.transactionDate);

    setMonth(parseDate(transaction.transactionDate));
  }, [accounts.length, transaction]);

  const getChildren = (uuid: string): Category[] => {
    return categories.filter((item: Category) => item.parent === uuid) || [];
  };

  React.useEffect(() => {
    if (isBudgetLoading) return;

    const _account = accounts.find((item: WeekBudgetItem) => item.uuid === values.account);

    if (_account != null) {
      setFilteredBudgets(budgets.filter((item: WeekBudgetItem) => item.user === _account.user));
    }
  }, [accounts, budgets, isBudgetLoading, values.account]);

  React.useEffect(() => {
    setWeekStart(getStartOfWeek(values.transactionDate));
    setWeekEnd(getEndOfWeek(values.transactionDate));
    setSelectedDate(getFormattedDate(values.transactionDate));
  }, [values.transactionDate]);

  const handleSave = async (payload: z.infer<typeof formSchema>): void => {
    try {
      await updateTransaction({
        ...payload,
        transactionDate: getFormattedDate(payload.transactionDate),
      });
      mutate(url);
      toastManager.add({
        id: 'transaction-update',
        title: 'Transaction updated',
        type: 'success',
      });
    } catch {
      toastManager.add({
        id: 'transaction-update-error',
        title: 'Cannot update transaction',
        type: 'error',
      });
    }
  };

  const cleanFormErrors = (open: boolean) => {
    if (!open) {
      setErrors({});
      const nextDate = new Date();
      setValues({
        account: '',
        amount: '',
        budget: '',
        category: '',
        currency: '',
        description: '',
        transactionDate: nextDate,
      });
      setSelectedDate(getFormattedDate(nextDate));
      setWeekStart(getStartOfWeek(nextDate));
      setWeekEnd(getEndOfWeek(nextDate));
      setMonth(nextDate);
      setFilteredBudgets([]);
    }
    handleClose();
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
    <Dlg.Dialog open={open} onOpenChange={cleanFormErrors}>
      <Dlg.DialogPopup className="min-w-150">
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Update transaction details</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <Frm.Form errors={errors} onSubmit={handleSubmit} className="contents">
          <Dlg.DialogPanel>
            <div className="flex w-full">
              <div className="flex sm:w-2/3">
                <Field.Field name="amount">
                  <Field.FieldLabel>Amount</Field.FieldLabel>
                  <Input
                    disabled={isUpdating}
                    id="amount"
                    autoFocus
                    value={values.amount}
                    onChange={(event) => setValues((current) => ({ ...current, amount: event.target.value }))}
                  />
                  <Field.FieldError />
                </Field.Field>
              </div>
              <div className="flex sm:w-1/3">
                <Field.Field name="currency">
                  <Field.FieldLabel>Currency</Field.FieldLabel>
                  <Slc.Select
                    disabled={isUpdating}
                    onValueChange={(currency) => setValues((current) => ({ ...current, currency }))}
                    value={values.currency || undefined}
                    items={curencies.map((item: Currency) => ({ label: item.code, value: item.uuid }))}
                  >
                    <Slc.SelectTrigger className="relative w-full">
                      <Slc.SelectValue placeholder="Select currency" />
                    </Slc.SelectTrigger>
                    <Slc.SelectPopup>
                      <Slc.SelectGroup>
                        <Slc.SelectGroupLabel>Currencies</Slc.SelectGroupLabel>
                        {currencies &&
                          currencies.map((item: Currency) => {
                            const rate = availableRates.find((rate: AvailableRate) => rate.currencyCode === item.code);
                            if (rate) {
                              if (rate.rateDate === selectedDate) {
                                return (
                                  <Slc.SelectItem key={item.uuid} value={item.uuid}>
                                    {item.code}
                                  </Slc.SelectItem>
                                );
                              }

                              return (
                                <Slc.SelectItem key={item.uuid} value={item.uuid}>
                                  {item.code} (old)
                                </Slc.SelectItem>
                              );
                            }

                            return (
                              <Slc.SelectItem key={item.uuid} value={item.uuid} disabled>
                                {item.code}
                              </Slc.SelectItem>
                            );
                          })}
                      </Slc.SelectGroup>
                    </Slc.SelectPopup>
                  </Slc.Select>
                  <Field.FieldError />
                </Field.Field>
              </div>
            </div>
            <div className="flex w-full">
              <div className="flex w-2/5 flex-col gap-4">
                <Field.Field name="category">
                  <Field.FieldLabel>Category</Field.FieldLabel>
                  <Slc.Select
                    disabled={isUpdating}
                    onValueChange={(category) => setValues((current) => ({ ...current, category }))}
                    value={values.category || undefined}
                    items={parents.map((item: Category) => ({ label: item.name, value: item.uuid }))}
                  >
                    <Slc.SelectTrigger className="relative w-[180px]">
                      <Slc.SelectValue placeholder="Select category" />
                    </Slc.SelectTrigger>
                    <Slc.SelectPopup>
                      <Slc.SelectGroup>
                        <Slc.SelectGroupLabel>Categories</Slc.SelectGroupLabel>
                        {parents.map((item: Category) =>
                          getChildren(item.uuid).map((subitem: Category) => (
                            <Slc.SelectItem key={subitem.uuid} value={subitem.uuid}>
                              <div className="flex gap-1">
                                {item.icon && <span className="mr-1">{item.icon}</span>}
                                <span>{item.name}</span>
                                <span>/</span>
                                <span>{subitem.name}</span>
                              </div>
                            </Slc.SelectItem>
                          )),
                        )}
                      </Slc.SelectGroup>
                    </Slc.SelectPopup>
                  </Slc.Select>
                  <Field.FieldError />
                </Field.Field>
                <Field.Field name="budget">
                  <Field.FieldLabel>Budget</Field.FieldLabel>
                  <Slc.Select
                    disabled={isUpdating || isBudgetLoading}
                    onValueChange={(budget) => setValues((current) => ({ ...current, budget }))}
                    value={values.budget || undefined}
                    items={filteredBudgets.map((item: WeekBudgetItem) => ({ label: item.title, value: item.uuid }))}
                  >
                    <Slc.SelectTrigger className="relative w-[180px]">
                      <Slc.SelectValue placeholder="Select budget" />
                    </Slc.SelectTrigger>
                    <Slc.SelectPopup>
                      <Slc.SelectGroup>
                        <Slc.SelectGroupLabel>Budget list</Slc.SelectGroupLabel>
                        {filteredBudgets.map((item: WeekBudgetItem) => (
                          <Slc.SelectItem key={item.uuid} value={item.uuid}>
                            {item.title}
                          </Slc.SelectItem>
                        ))}
                      </Slc.SelectGroup>
                    </Slc.SelectPopup>
                  </Slc.Select>
                  <Field.FieldError />
                </Field.Field>
                <Field.Field name="account">
                  <Field.FieldLabel>Account</Field.FieldLabel>
                  <Slc.Select
                    disabled={isUpdating}
                    onValueChange={(account) => setValues((current) => ({ ...current, account }))}
                    value={values.account || undefined}
                    items={accounts.map((item: AccountResponse) => ({ label: item.title, value: item.uuid }))}
                  >
                    <Slc.SelectTrigger className="relative w-[180px]">
                      <Slc.SelectValue placeholder="Select account" />
                    </Slc.SelectTrigger>
                    <Slc.SelectPopup>
                      <Slc.SelectGroup>
                        <Slc.SelectGroupLabel>Accounts</Slc.SelectGroupLabel>
                        {accounts.map((item: AccountResponse) => (
                          <Slc.SelectItem key={item.uuid} value={item.uuid}>
                            {item.title}
                          </Slc.SelectItem>
                        ))}
                      </Slc.SelectGroup>
                    </Slc.SelectPopup>
                  </Slc.Select>
                  <Field.FieldError />
                </Field.Field>
              </div>
              <div className="flex w-3/5 justify-end">
                <Field.Field name="transactionDate">
                  <Calendar
                    mode="single"
                    selected={values.transactionDate}
                    onSelect={(transactionDate) =>
                      transactionDate && setValues((current) => ({ ...current, transactionDate }))
                    }
                    disabled={(date) => isUpdating || date < new Date('1900-01-01')}
                    month={month}
                    onMonthChange={setMonth}
                    weekStartsOn={1}
                    initialFocus
                  />
                  <Field.FieldError />
                </Field.Field>
              </div>
            </div>
            <div className="flex w-full">
              <Field.Field name="description">
                <Textarea
                  disabled={isUpdating}
                  placeholder="Any notes for the transaction"
                  className="resize-none"
                  value={values.description}
                  onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
                />
                <Field.FieldError />
              </Field.Field>
            </div>
          </Dlg.DialogPanel>
          <Dlg.DialogFooter>
            <Dlg.DialogClose render={<Button variant="ghost" />}>Cancel</Dlg.DialogClose>
            <Button type="submit">Save</Button>
          </Dlg.DialogFooter>
        </Frm.Form>
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default EditForm;
