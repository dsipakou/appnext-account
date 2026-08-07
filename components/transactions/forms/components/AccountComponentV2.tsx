import React from 'react';

// Types
import { Account } from '@/components/accounts/types';
import { WeekBudgetItem } from '@/components/budget/types';
import { RowData } from '@/components/transactions/components/transactionTable';
// UI
import * as Slc from '@/components/ui/select';
// Hooks
import { useBudgetWeek } from '@/hooks/budget';
// Utils
import { cn } from '@/lib/utils';
import { getEndOfWeek, getStartOfWeek } from '@/utils/dateUtils';

type Props = {
  user: string;
  value: string;
  accounts: Account[];
  budgets: WeekBudgetItem[];
  handleChange: (id: number, key: string, value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent, id: number) => void;
  row: RowData;
  isInvalid: boolean;
};

export default function AccountComponent({
  user,
  value,
  accounts,
  handleChange,
  handleKeyDown,
  row,
  isInvalid,
}: Props) {
  const [weekStart, setWeekStart] = React.useState<string>(getStartOfWeek(row.date || new Date()));
  const [weekEnd, setWeekEnd] = React.useState<string>(getEndOfWeek(row.date || new Date()));

  const { data: budgets = [] } = useBudgetWeek(weekStart, weekEnd);

  const yourAccounts = accounts.filter((item: Account) => item.user === user);
  const otherAccounts = accounts.filter((item: Account) => item.user !== user);
  const defaultAccount = yourAccounts.find((item: Account) => item.isMain);

  React.useEffect(() => {
    setWeekStart(getStartOfWeek(row.date));
    setWeekEnd(getEndOfWeek(row.date));
  }, [row.date]);

  React.useEffect(() => {
    if (!defaultAccount) return;
    // If no account passed (i.e. while duplicating) select default
    if (!value) {
      handleChange(row.id, 'account', defaultAccount?.uuid || '');
    }
  }, [defaultAccount]);

  const isAccountAndBudgetMatch = (newValue: string) => {
    if (!row.budget) {
      return true;
    }
    const accountUser = accounts.find((item: Account) => item.uuid === newValue)?.user;
    return budgets.some((item: WeekBudgetItem) => item.user === accountUser);
  };

  const changeValue = (value: string) => {
    if (!isAccountAndBudgetMatch(value)) {
      handleChange(row.id, 'budget', null);
    }
    handleChange(row.id, 'account', value);
  };

  return (
    <Slc.Select
      value={value}
      onValueChange={(value) => changeValue(value)}
      onOpenChange={(open) => {
        if (!open) {
          (document.activeElement as HTMLElement)?.blur();
        }
      }}
      items={accounts.map((item: Account) => ({ label: item.title, value: item.uuid }))}
    >
      <Slc.SelectTrigger
        className={cn(
          'focus:border-primary h-8 w-full border-0 bg-white px-2 text-left text-sm focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-blue-700 focus-visible:outline-none',
          isInvalid && 'outline outline-red-400',
        )}
        onKeyDown={(e) => handleKeyDown(e, row.id)}
      >
        <Slc.SelectValue />
      </Slc.SelectTrigger>
      <Slc.SelectPopup>
        {!yourAccounts.length && (
          <Slc.SelectItem value="empty" disabled>
            No accounts
          </Slc.SelectItem>
        )}
        {!!yourAccounts.length && (
          <>
            <Slc.SelectGroup>
              <Slc.SelectGroupLabel>Your Accounts</Slc.SelectGroupLabel>
              {yourAccounts.map((item: Account) => (
                <Slc.SelectItem key={item.uuid} value={item.uuid}>
                  {item.title}
                </Slc.SelectItem>
              ))}
            </Slc.SelectGroup>
            <Slc.SelectSeparator />
          </>
        )}
        {!!yourAccounts.length && !!otherAccounts.length && (
          <Slc.SelectGroup>
            <Slc.SelectGroupLabel>Other Accounts</Slc.SelectGroupLabel>
            {otherAccounts.map((item: Account) => (
              <Slc.SelectItem key={item.uuid} value={item.uuid}>
                {item.title}
              </Slc.SelectItem>
            ))}
          </Slc.SelectGroup>
        )}
      </Slc.SelectPopup>
    </Slc.Select>
  );
}
