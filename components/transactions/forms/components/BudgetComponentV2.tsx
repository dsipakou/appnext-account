import { Plus } from 'lucide-react';
import React from 'react';
import { useSWRConfig } from 'swr';
import * as z from 'zod';

import { Account } from '@/components/accounts/types';
import { WeekBudgetItem } from '@/components/budget/types';
import { Category, CategoryType } from '@/components/categories/types';
import { Currency } from '@/components/currencies/types';
import { RowData } from '@/components/transactions/components/transactionTable';
import { Button } from '@/components/ui/button';
import * as Dlg from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Form, type FormErrors } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import * as Slc from '@/components/ui/select';
import { toastManager } from '@/components/ui/toast';
import { useBudgetWeek, useCreateBudget } from '@/hooks/budget';
import { useCategories } from '@/hooks/categories';
import { useCurrencies } from '@/hooks/currencies';
import { cn } from '@/lib/utils';
import { getEndOfWeek, getFormattedDate, getStartOfWeek } from '@/utils/dateUtils';

type Props = {
  user: string;
  value: string;
  accounts: Account[];
  budgets: WeekBudgetItem[];
  handleChange: (id: number, key: string, value: string | boolean) => void;
  handleKeyDown: (e: React.KeyboardEvent, id: number) => void;
  row: RowData;
  isInvalid: boolean;
};

const formSchema = z.object({
  title: z.string().min(2, {
    error: 'Title must be at least 2 characters',
  }),
  amount: z.coerce.number().min(0, {
    error: 'Should be positive number',
  }),
  currency: z.uuid({ error: 'Please, select currency' }),
  category: z.uuid({ error: 'Please, select category' }),
  user: z.uuid(),
  budgetDate: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BudgetComponent({ user, value, accounts, handleChange, handleKeyDown, row, isInvalid }: Props) {
  const [weekStart, setWeekStart] = React.useState<string>(getStartOfWeek(row.date || new Date()));
  const [weekEnd, setWeekEnd] = React.useState<string>(getEndOfWeek(row.date || new Date()));
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [values, setValues] = React.useState<FormValues>({
    title: '',
    amount: 0,
    currency: '',
    category: '',
    user: '',
    budgetDate: getFormattedDate(row.date || new Date()),
  });

  const { data: budgets = [] } = useBudgetWeek(weekStart, weekEnd);
  const { data: categories = [] } = useCategories();
  const { data: currencies = [] } = useCurrencies();
  const { trigger: createBudget, isMutating: isCreating } = useCreateBudget();
  const { mutate } = useSWRConfig();

  const accountUser = React.useMemo(
    () => accounts.find((account) => account.uuid === row.account)?.user,
    [accounts, row.account],
  );

  const filteredBudgets = budgets.filter((item: WeekBudgetItem) => item.user === accountUser);
  const completedBudgets = filteredBudgets.filter((item: WeekBudgetItem) => item.isCompleted);
  const incompletedBudgets = filteredBudgets.filter((item: WeekBudgetItem) => !item.isCompleted);

  const parentCategories = categories.filter(
    (category: Category) => category.parent === null && category.type === CategoryType.Expense,
  );

  const defaultCurrency = currencies.find((item: Currency) => item.isDefault)?.uuid || '';

  React.useEffect(() => {
    setWeekStart(getStartOfWeek(row.date));
    setWeekEnd(getEndOfWeek(row.date));
  }, [row.date]);

  React.useEffect(() => {
    if (defaultCurrency && !values.currency) {
      setValues((current) => ({ ...current, currency: defaultCurrency }));
    }
  }, [defaultCurrency]);

  React.useEffect(() => {
    if (!accountUser) return;
    setValues((current) => ({ ...current, user: accountUser }));
  }, [accountUser]);

  const onChange = (value: string) => {
    if (value === '__create_new__') {
      setIsCreateDialogOpen(true);
      return;
    }

    const budget = filteredBudgets.find((item: WeekBudgetItem) => item.uuid === value);
    handleChange(row.id, 'budget', value);
    handleChange(row.id, 'budgetName', budget?.title || '');
    handleChange(row.id, 'isCompleted', budget?.isCompleted || false);
    handleChange(row.id, 'category', budget?.category || '');
    handleChange(row.id, 'categoryName', '');
    handleChange(row.id, 'categoryParentName', '');
  };

  const handleCreateBudget = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = formSchema.safeParse(values);
    if (!result.success) {
      setErrors(z.flattenError(result.error).fieldErrors);

      return;
    }

    setErrors({});

    try {
      const response = await createBudget(result.data);

      // Revalidate budget data
      await mutate((key) => typeof key === 'string' && key.includes('budget/weekly-usage'));

      // Set the newly created budget as selected
      if (result && response.uuid) {
        handleChange(row.id, 'budget', response.uuid);
        handleChange(row.id, 'budgetName', values.title);
        handleChange(row.id, 'category', values.category);
      }

      // Reset form
      setIsCreateDialogOpen(false);

      toastManager.add({
        id: 'transaction-budget-create',
        title: 'Budget created successfully!',
        type: 'success',
      });
    } catch (error) {
      toastManager.add({
        id: 'transaction-budget-create-error',
        title: 'Failed to create budget',
        description: 'Please try again',
        type: 'error',
      });
    }
  };

  return (
    <>
      <Slc.Select
        value={value}
        onValueChange={(value) => onChange(value)}
        onOpenChange={(open) => {
          if (!open) {
            (document.activeElement as HTMLElement)?.blur();
          }
        }}
        disabled={!accountUser}
        items={filteredBudgets.map((item) => ({ label: item.title, value: item.uuid }))}
      >
        <Slc.SelectTrigger
          className={cn(
            'h-8 w-full border-0 bg-white px-2 text-left text-sm focus:border-primary focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-blue-700',
            isInvalid && 'border-2 border-red-400',
          )}
          onKeyDown={(e) => handleKeyDown(e, row.id)}
        >
          <Slc.SelectValue placeholder={!accountUser ? 'Select account first' : ''} />
        </Slc.SelectTrigger>
        <Slc.SelectContent>
          {accountUser && (
            <>
              <Slc.SelectItem value="__create_new__" className="font-semibold text-blue-600">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Create new budget</span>
                </div>
              </Slc.SelectItem>
              {!!filteredBudgets.length && <Slc.SelectSeparator />}
            </>
          )}
          {!filteredBudgets.length && (
            <Slc.SelectItem value="empty" disabled>
              No budgets
            </Slc.SelectItem>
          )}
          {!!filteredBudgets.length && !!incompletedBudgets.length && (
            <>
              <Slc.SelectGroup>
                {incompletedBudgets.map((item: WeekBudgetItem) => (
                  <Slc.SelectItem key={item.uuid} value={item.uuid}>
                    {item.title}
                  </Slc.SelectItem>
                ))}
              </Slc.SelectGroup>
              <Slc.SelectSeparator />
            </>
          )}
          {!!filteredBudgets.length && !!completedBudgets.length && (
            <Slc.SelectGroup>
              <Slc.SelectGroupLabel>Completed budgets</Slc.SelectGroupLabel>
              {completedBudgets.map((item: WeekBudgetItem) => (
                <Slc.SelectItem className="font-light" key={item.uuid} value={item.uuid}>
                  {item.title}
                </Slc.SelectItem>
              ))}
            </Slc.SelectGroup>
          )}
        </Slc.SelectContent>
      </Slc.Select>

      <Dlg.Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <Dlg.DialogPopup className="sm:max-w-125">
          <Dlg.DialogHeader>
            <Dlg.DialogTitle>Create New Budget</Dlg.DialogTitle>
          </Dlg.DialogHeader>
          <Form onSubmit={handleCreateBudget} errors={errors} className="contents">
            <Dlg.DialogPanel>
              <div className="grid gap-2">
                <Field name="title">
                  <FieldLabel>Title</FieldLabel>
                  <Input
                    id="title"
                    value={values.title}
                    onChange={(e) => setValues((current) => ({ ...current, title: e.target.value }))}
                    placeholder="Budget title"
                    disabled={isCreating}
                  />
                  <FieldError />
                </Field>
              </div>
              <div className="grid gap-2">
                <Field>
                  <FieldLabel htmlFor="amount">Amount</FieldLabel>
                  <Input
                    id="amount"
                    type="number"
                    value={values.amount}
                    onChange={(e) => setValues((current) => ({ ...current, amount: e.target.value }))}
                    placeholder="0"
                    disabled={isCreating}
                  />
                  <FieldError />
                </Field>
              </div>
              <div className="grid gap-2">
                <Field>
                  <FieldLabel htmlFor="category">Category</FieldLabel>
                  <Slc.Select
                    value={values.category}
                    onValueChange={(category) => setValues((current) => ({ ...current, category }))}
                    disabled={isCreating}
                    items={parentCategories.map((item: Category) => ({
                      label: `${item.icon} ${item.name}`,
                      value: item.uuid,
                    }))}
                  >
                    <Slc.SelectTrigger>
                      <Slc.SelectValue placeholder="Select category" />
                    </Slc.SelectTrigger>
                    <Slc.SelectPopup>
                      <Slc.SelectGroup>
                        {parentCategories.map((item: Category) => (
                          <Slc.SelectItem key={item.uuid} value={item.uuid}>
                            {item.icon && <span className="mr-2">{item.icon}</span>}
                            {item.name}
                          </Slc.SelectItem>
                        ))}
                      </Slc.SelectGroup>
                    </Slc.SelectPopup>
                  </Slc.Select>
                  <FieldError />
                </Field>
              </div>
              <div className="grid gap-2">
                <Field>
                  <FieldLabel htmlFor="currency">Currency</FieldLabel>
                  <Slc.Select
                    value={values.currency}
                    onValueChange={(currency) => setValues((current) => ({ ...current, currency }))}
                    disabled={isCreating}
                    items={currencies.map((item: Currency) => ({
                      label: `${item.code} (${item.sign})`,
                      value: item.uuid,
                    }))}
                  >
                    <Slc.SelectTrigger>
                      <Slc.SelectValue placeholder="Select currency" />
                    </Slc.SelectTrigger>
                    <Slc.SelectPopup>
                      <Slc.SelectGroup>
                        {currencies.map((item: Currency) => (
                          <Slc.SelectItem key={item.uuid} value={item.uuid}>
                            {item.code} ({item.sign})
                          </Slc.SelectItem>
                        ))}
                      </Slc.SelectGroup>
                    </Slc.SelectPopup>
                  </Slc.Select>
                  <FieldError />
                </Field>
              </div>
            </Dlg.DialogPanel>
            <Dlg.DialogFooter>
              <Dlg.DialogClose render={<Button variant="ghost" />}>Cancel</Dlg.DialogClose>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Budget'}
              </Button>
            </Dlg.DialogFooter>
          </Form>
        </Dlg.DialogPopup>
      </Dlg.Dialog>
    </>
  );
}
