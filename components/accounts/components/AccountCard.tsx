// System
import { User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { cn } from '@/lib/utils';

// Components
import { useStore } from '@/app/store';
import { ConfirmDeleteForm, EditForm as EditAccount, ReassignTransactionsForm } from '@/components/accounts/forms';
import { AccountResponse } from '@/components/accounts/types';
import { AccountUsage } from '@/components/transactions/types';
// UI
import * as Card from '@/components/ui/card';
import * as Prg from '@/components/ui/progress';
// Types
import { User } from '@/components/users/types';
import { useAccountUsage } from '@/hooks/transactions';
// Hooks
import { useUsers } from '@/hooks/users';
interface Types {
  account: AccountResponse;
}

const ExpensesDisplay: React.FC<{
  expenses: number;
  currencySign: string;
  expensesPercentage: number;
  hasIncome: boolean;
}> = ({ expenses, currencySign, expensesPercentage, hasIncome }) => (
  <>
    <div className="mb-1.5 flex items-center justify-between text-sm">
      <span className="text-muted-foreground font-medium">Expenses</span>
      <span className={`font-semibold ${hasIncome ? 'text-black' : 'text-gray-600'}`}>
        {expenses.toFixed(2)} {currencySign}
      </span>
    </div>
    <Prg.Progress value={expensesPercentage} className="h-2 w-full bg-gray-200">
      <Prg.ProgressIndicator className={hasIncome ? 'bg-blue-600' : 'bg-gray-600'} />
    </Prg.Progress>
  </>
);

const AccountCard: React.FC<Types> = ({ account }) => {
  const { data: users = [] } = useUsers();

  // By default income and spent are 0
  const { data: usage = { income: 0, spent: 0 } as AccountUsage } = useAccountUsage(account.uuid);
  const income = usage.income;
  const expenses = usage.spent;

  const currencySign = useStore((state) => state.currency.sign);

  const max = Math.max(income, expenses, 1);
  const incomePercentage = (income / max) * 100;
  const expensesPercentage = (expenses / max) * 100;
  const isOverBudget = expenses > income;
  const isZeroState = income === 0 && expenses === 0;

  const getUser = (uuid: string): User | undefined => {
    return users.find((item: User) => item.uuid === uuid);
  };

  return (
    <Card.Card className="transition-all duration-200 hover:shadow-lg hover:shadow-gray-200/50">
      <Card.CardHeader className="pb-4">
        <Card.CardTitle>
          <div className="flex w-full items-center justify-between gap-2">
            <span className="truncate text-lg">{account.title}</span>
            <div className="flex flex-row items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span className="max-w-30 truncate text-sm font-medium">{getUser(account.user)?.username}</span>
            </div>
          </div>
        </Card.CardTitle>
      </Card.CardHeader>
      <Card.CardContent>
        <div className="flex h-30 flex-col">
          {isZeroState ? (
            <div className="flex h-full flex-col items-center justify-center gap-1">
              <div className="text-muted-foreground">No expenses for this month yet</div>
              <div className="text-muted-foreground/80 text-sm">Add your first transaction to see the progress 😊</div>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div>
                <div className="h-11">
                  {income > 0 ? (
                    <div className="flex flex-row items-end gap-1">
                      <span className={cn('text-2xl', income - expenses >= 0 ? 'text-green-600' : 'text-red-600')}>
                        {income - expenses} {currencySign}
                      </span>
                      <span className="text-muted-foreground texlt-md ml-2"> Income {income.toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">No income for this month yet</div>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <div className="space-y-2">
                  {expenses > 0 ? (
                    <ExpensesDisplay
                      expenses={expenses}
                      currencySign={currencySign}
                      expensesPercentage={expensesPercentage}
                      hasIncome={income > 0}
                    />
                  ) : (
                    <div className="text-muted-foreground">No expenses for this month yet</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card.CardContent>
      <Card.CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2">
          <Link
            className="flex items-center gap-1 text-sm text-blue-600 transition-colors hover:text-blue-800"
            href={`/accounts/${account.uuid}`}
          >
            View Details
            <span className="text-xs">{'>'}</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ReassignTransactionsForm uuid={account.uuid} />
          <EditAccount uuid={account.uuid} />
          <ConfirmDeleteForm uuid={account.uuid} />
        </div>
      </Card.CardFooter>
    </Card.Card>
  );
};

export default AccountCard;
