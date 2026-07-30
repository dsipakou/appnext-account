import { useSession } from 'next-auth/react';
import React from 'react';
import { useSWRConfig } from 'swr';
import * as z from 'zod';

import { AccountResponse } from '@/components/accounts/types';
import { Category } from '@/components/categories/types';
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
import { User } from '@/components/users/types';
import { useAccounts } from '@/hooks/accounts';
import { useCategories } from '@/hooks/categories';
import { useCurrencies } from '@/hooks/currencies';
import { useAvailableRates } from '@/hooks/rates';
import { useCreateTransaction } from '@/hooks/transactions';
import { useUsers } from '@/hooks/users';
import { getFormattedDate } from '@/utils/dateUtils';

interface Types {
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

const AddIncomeForm: React.FC<Types> = ({ open, url, handleClose }) => {
  const [user, setUser] = React.useState('');
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
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

  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const { data: currencies = [] } = useCurrencies();
  const { data: users = [] } = useUsers();
  const { trigger: createTransaction, isMutating: isCreating } = useCreateTransaction();

  const incomeCategories: Category[] = categories.filter((item: Category) => item.type === 'INC');

  const { data: availableRates = [] } = useAvailableRates(getFormattedDate(selectedDate));
  const {
    data: { user: authUser },
  } = useSession();

  React.useEffect(() => {
    setSelectedDate(values.transactionDate);
  }, [values.transactionDate]);

  React.useEffect(() => {
    if (!authUser || users.length === 0) return;

    const _user = users.find((item: User) => item.username === authUser.username)!;
    setUser(_user.uuid);
  }, [authUser, users]);

  const handleSave = async (payload: z.infer<typeof formSchema>) => {
    try {
      await createTransaction({
        ...payload,
        transactionDate: getFormattedDate(payload.transactionDate),
        user,
      });
      mutate(url);
      toast({
        title: 'Saved!',
      });
      handleClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: error,
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
      setSelectedDate(nextDate);
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
          <Dlg.DialogTitle>Save your income</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <Frm.Form onSubmit={handleSubmit} className="contents">
          <Dlg.DialogPanel>
            <div className="flex w-1/2 flex-col gap-3">
              <div className="flex sm:w-full">
                <Field.Field name="amount">
                  <Field.FieldLabel>Amount</Field.FieldLabel>
                  <Input
                    disabled={isCreating}
                    id="amount"
                    autoFocus
                    value={values.amount}
                    onChange={(event) => setValues((current) => ({ ...current, amount: event.target.value }))}
                  />
                  <Field.FieldError>{errors.amount}</Field.FieldError>
                </Field.Field>
              </div>
              <div className="flex w-full">
                <Field.Field name="category">
                  <Field.FieldLabel>Source</Field.FieldLabel>
                  <Slc.Select
                    disabled={isCreating}
                    onValueChange={(category) => setValues((current) => ({ ...current, category }))}
                    value={values.category || undefined}
                  >
                    <Slc.SelectTrigger className="relative w-full">
                      <Slc.SelectValue placeholder="Select source of income" />
                    </Slc.SelectTrigger>
                    <Slc.SelectContent>
                      <Slc.SelectGroup>
                        <Slc.SelectLabel>Source</Slc.SelectLabel>
                        {incomeCategories.map((item: Category) => (
                          <Slc.SelectItem key={item.uuid} value={item.uuid}>
                            {item.name}
                          </Slc.SelectItem>
                        ))}
                      </Slc.SelectGroup>
                    </Slc.SelectContent>
                  </Slc.Select>
                  <Field.FieldError>{errors.category}</Field.FieldError>
                </Field.Field>
              </div>
              <div>
                <Field.Field name="account">
                  <Field.FieldLabel>Account</Field.FieldLabel>
                  <Slc.Select
                    disabled={isCreating}
                    onValueChange={(account) => setValues((current) => ({ ...current, account }))}
                    value={values.account || undefined}
                  >
                    <Slc.SelectTrigger className="relative">
                      <Slc.SelectValue placeholder="Select income account" />
                    </Slc.SelectTrigger>
                    <Slc.SelectContent>
                      <Slc.SelectGroup>
                        <Slc.SelectLabel>Accounts</Slc.SelectLabel>
                        {accounts.map((item: AccountResponse) => (
                          <Slc.SelectItem key={item.uuid} value={item.uuid}>
                            {item.title}
                          </Slc.SelectItem>
                        ))}
                      </Slc.SelectGroup>
                    </Slc.SelectContent>
                  </Slc.Select>
                  <Field.FieldError>{errors.account}</Field.FieldError>
                </Field.Field>
              </div>
              <div className="flex">
                <Field.Field name="currency">
                  <Field.FieldLabel>Currency</Field.FieldLabel>
                  <Slc.Select
                    disabled={isCreating}
                    onValueChange={(currency) => setValues((current) => ({ ...current, currency }))}
                    value={values.currency || undefined}
                  >
                    <Slc.SelectTrigger className="relative w-full">
                      <Slc.SelectValue placeholder="Select currency" />
                    </Slc.SelectTrigger>
                    <Slc.SelectContent>
                      <Slc.SelectGroup>
                        <Slc.SelectLabel>Currencies</Slc.SelectLabel>
                        {currencies &&
                          currencies.map((item: Currency) => {
                            const rate = availableRates.find((rate: AvailableRate) => rate.currencyCode === item.code);
                            if (rate) {
                              if (rate.rateDate === getFormattedDate(selectedDate)) {
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
              <div className="flex w-full">
                <Field.Field name="description">
                  <Textarea
                    disabled={isCreating}
                    placeholder="Any notes for the income transaction"
                    className="resize-none"
                    value={values.description}
                    onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
                  />
                  <Field.FieldError>{errors.description}</Field.FieldError>
                </Field.Field>
              </div>
            </div>
            <div className="flex w-1/2">
              <Field.Field name="transactionDate">
                <Calendar
                  mode="single"
                  selected={values.transactionDate}
                  onSelect={(transactionDate) =>
                    transactionDate && setValues((current) => ({ ...current, transactionDate }))
                  }
                  disabled={(date) => isCreating || date < new Date('1900-01-01')}
                  month={month}
                  onMonthChange={setMonth}
                  weekStartsOn={1}
                  initialFocus
                />
                <Field.FieldError>{errors.transactionDate}</Field.FieldError>
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

export default AddIncomeForm;
