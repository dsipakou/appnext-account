import React from 'react';
import { useSWRConfig } from 'swr';
import * as z from 'zod';

import { AccountResponse } from '@/components/accounts/types';
import { Category, CategoryType } from '@/components/categories/types';
import { Currency } from '@/components/currencies/types';
import { AvailableRate } from '@/components/rates/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import * as Dlg from '@/components/ui/dialog';
import * as Field from '@/components/ui/field';
import * as Frm from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import * as Slc from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAccounts } from '@/hooks/accounts';
import { useCategories } from '@/hooks/categories';
import { useCurrencies } from '@/hooks/currencies';
import { useAvailableRates } from '@/hooks/rates';
import { useTransaction, useUpdateTransaction } from '@/hooks/transactions';
import { getFormattedDate, parseDate } from '@/utils/dateUtils';

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
  category: string;
  currency: string;
  description: string;
  transactionDate: Date;
};

const EditIncomeForm: React.FC<Types> = ({ uuid, open, url, handleClose }) => {
  const [selectedDate, setSelectedDate] = React.useState<string>(getFormattedDate(new Date()));
  const [month, setMonth] = React.useState<Date>(new Date());
  const [values, setValues] = React.useState<FormValues>({
    account: '',
    amount: '',
    category: '',
    currency: '',
    description: '',
    transactionDate: new Date(),
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormValues, string>>>({});
  const { mutate } = useSWRConfig();

  const { toast } = useToast();

  const { data: transaction, isLoading: isTransactionLoading } = useTransaction(uuid);
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const { data: currencies = [] } = useCurrencies();
  const { trigger: updateTransaction, isMutating: isUpdating } = useUpdateTransaction(uuid);

  const { data: availableRates = [], isLoading: isRatesLoading } = useAvailableRates(selectedDate);

  const incomeCategories = categories.filter(
    (category: Category) => category.parent === null && category.type === CategoryType.Income,
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
    });

    setSelectedDate(transaction.transactionDate);

    setMonth(parseDate(transaction.transactionDate));
  }, [accounts.length, transaction]);

  React.useEffect(() => {
    setSelectedDate(getFormattedDate(values.transactionDate));
  }, [values.transactionDate]);

  const handleSave = async (payload: z.infer<typeof formSchema>): void => {
    try {
      await updateTransaction({
        ...payload,
        transactionDate: getFormattedDate(payload.transactionDate),
      });
      // TODO: wrong url - outcome instead of outcome
      mutate(url);
      toast({
        title: 'Transaction updated',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Cannot update transaction',
        description: 'Something went wrong, please try again later.',
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
        category: '',
        currency: '',
        description: '',
        transactionDate: nextDate,
      });
      setSelectedDate(getFormattedDate(nextDate));
      setMonth(nextDate);
    }
    handleClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = formSchema.safeParse(values);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      setErrors({
        account: fieldErrors.account?.[0],
        amount: fieldErrors.amount?.[0],
        category: fieldErrors.category?.[0],
        currency: fieldErrors.currency?.[0],
        description: fieldErrors.description?.[0],
        transactionDate: fieldErrors.transactionDate?.[0],
      });
      return;
    }

    setErrors({});
    await handleSave(result.data);
  };

  return (
    <Dlg.Dialog open={open} onOpenChange={cleanFormErrors}>
      <Dlg.DialogPopup className="min-w-150">
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Update income details</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <Frm.Form onSubmit={handleSubmit} className="space-y-8">
          <Dlg.DialogPanel>
            <div className="flex w-full">
              <div className="flex sm:w-2/3">
                <Field.Field name="amount">
                  <Field.FieldLabel>Amount</Field.FieldLabel>
                  <Input
                    disabled={isUpdating || isTransactionLoading || isRatesLoading}
                    id="amount"
                    autoFocus
                    value={values.amount}
                    onChange={(event) => setValues((current) => ({ ...current, amount: event.target.value }))}
                  />
                  <Field.FieldError>{errors.amount}</Field.FieldError>
                </Field.Field>
              </div>
              <div className="flex sm:w-1/3">
                <Field.Field name="currency">
                  <Field.FieldLabel>Currency</Field.FieldLabel>
                  <Slc.Select
                    disabled={isUpdating || isTransactionLoading || isRatesLoading}
                    onValueChange={(currency) => setValues((current) => ({ ...current, currency }))}
                    value={values.currency || undefined}
                    items={currencies.map((item: Currency) => ({ label: item.code, value: item.uuid }))}
                  >
                    <Slc.SelectTrigger className="relative w-full">
                      <Slc.SelectValue placeholder="Select currency" />
                    </Slc.SelectTrigger>
                    <Slc.SelectContent>
                      <Slc.SelectGroup>
                        <Slc.SelectGroupLabel>Currencies</Slc.SelectGroupLabel>
                        {currencies.map((item: Currency) => {
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
                    </Slc.SelectContent>
                  </Slc.Select>
                  <Field.FieldError>{errors.currency}</Field.FieldError>
                </Field.Field>
              </div>
            </div>
            <div className="flex w-full">
              <div className="flex w-2/5 flex-col gap-4">
                <Field.Field name="category">
                  <Field.FieldLabel>Category</Field.FieldLabel>
                  <Slc.Select
                    disabled={isUpdating || isTransactionLoading || isRatesLoading}
                    onValueChange={(category) => setValues((current) => ({ ...current, category }))}
                    value={values.category || undefined}
                    items={incomeCategories.map((item: Category) => ({ label: item.name, value: item.uuid }))}
                  >
                    <Slc.SelectTrigger className="relative w-[180px]">
                      <Slc.SelectValue placeholder="Select category" />
                    </Slc.SelectTrigger>
                    <Slc.SelectPopup>
                      <Slc.SelectGroup>
                        <Slc.SelectGroupLabel>Categories</Slc.SelectGroupLabel>
                        {incomeCategories.map((item: Category) => (
                          <Slc.SelectItem key={item.uuid} value={item.uuid}>
                            <div className="flex gap-1">
                              {item.icon && <span>{item.icon}</span>}
                              <span>{item.name}</span>
                            </div>
                          </Slc.SelectItem>
                        ))}
                      </Slc.SelectGroup>
                    </Slc.SelectPopup>
                  </Slc.Select>
                  <Field.FieldError>{errors.category}</Field.FieldError>
                </Field.Field>
                <Field.Field name="account">
                  <Field.FieldLabel>Account</Field.FieldLabel>
                  <Slc.Select
                    disabled={isUpdating || isTransactionLoading || isRatesLoading}
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
                  <Field.FieldError>{errors.account}</Field.FieldError>
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
                    disabled={(date) =>
                      isUpdating || isTransactionLoading || isRatesLoading || date < new Date('1900-01-01')
                    }
                    month={month}
                    onMonthChange={setMonth}
                    weekStartsOn={1}
                    initialFocus
                  />
                  <Field.FieldError>{errors.transactionDate}</Field.FieldError>
                </Field.Field>
              </div>
            </div>
            <div className="flex w-full">
              <Field.Field name="description">
                <Textarea
                  disabled={isUpdating || isTransactionLoading || isRatesLoading}
                  placeholder="Any notes for the transaction"
                  className="resize-none"
                  value={values.description}
                  onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
                />
                <Field.FieldError>{errors.description}</Field.FieldError>
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

export default EditIncomeForm;
