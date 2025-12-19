// System
import * as React from 'react';
import { User as UserIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
// Components
import { useStore } from '@/app/store';
import { Progress } from '@/components/ui/progress';
import { EditForm as EditAccount, ConfirmDeleteForm, ReassignTransactionsForm } from '@/components/accounts/forms';
// UI
import * as Card from '@/components/ui/card';
// Hooks
import { useUsers } from '@/hooks/users';
import { useAccountUsage } from '@/hooks/transactions';
// Types
import { User } from '@/components/users/types';
import { AccountUsage } from '@/components/transactions/types';
import { AccountResponse } from '@/components/accounts/types';
interface Types {
  account: AccountResponse;
}

const IncomeDisplay: React.FC<{ income: number; currencySign: string; incomePercentage: number }> = ({
  income,
  currencySign,
  incomePercentage,
}) => (
  <>
    <div className="flex justify-between items-center text-sm mb-1.5">
      <span className="text-muted-foreground font-medium">Income</span>
      <span className="font-semibold text-green-600">
        {income.toFixed(2)} {currencySign}
      </span>
    </div>
    <Progress value={incomePercentage} className="h-2 w-full bg-gray-200" indicatorclassname="bg-green-600" />
  </>
);

const ExpensesDisplay: React.FC<{
  expenses: number;
  currencySign: string;
  expensesPercentage: number;
  hasIncome: boolean;
}> = ({ expenses, currencySign, expensesPercentage, hasIncome }) => (
  <>
    <div className="flex justify-between items-center text-sm mb-1.5">
      <span className="text-muted-foreground font-medium">Expenses</span>
      <span className={`font-semibold ${hasIncome ? 'text-red-600' : 'text-gray-600'}`}>
        {expenses.toFixed(2)} {currencySign}
      </span>
    </div>
    <Progress
      value={expensesPercentage}
      className="h-2 w-full bg-gray-200"
      indicatorclassname={hasIncome ? 'bg-red-600' : 'bg-gray-600'}
    />
  </>
);

const AccountCard: React.FC<Types> = ({ account }) => {
  const { data: users = [] } = useUsers();
  const {
    data: { user: authUser },
  } = useSession();
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
    <Card.Card className="hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-200">
      <Card.CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <Card.CardTitle className="flex items-center gap-2">
              <span className="truncate text-lg">{account.title}</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 rounded-full">
                <UserIcon className="h-3 w-3 text-blue-500" />
                <span className="text-xs font-medium text-blue-600 truncate max-w-[120px]">
                  {getUser(account.user)?.username}
                </span>
              </div>
            </Card.CardTitle>
          </div>
        </div>
      </Card.CardHeader>
      <Card.CardContent>
        <div className="flex flex-col h-[120px]">
          {isZeroState ? (
            <div className="flex flex-col items-center justify-center h-full gap-1">
              <div className="text-muted-foreground">No expenses for this month yet</div>
              <div className="text-sm text-muted-foreground/80">Add your first transaction to see the progress 😊</div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div>
                <div className="h-[44px]">
                  {income > 0 ? (
                    <IncomeDisplay income={income} currencySign={currencySign} incomePercentage={incomePercentage} />
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
              <div className="mt-auto">
                <div className="flex justify-between text-base">
                  {income > 0 ? (
                    <>
                      <div className="text-muted-foreground">
                        Balance: {(income - expenses).toFixed(2)} {currencySign}
                      </div>
                      <div className="flex items-center gap-4">
                        {isOverBudget ? (
                          <div className="text-red-600 font-medium">
                            Overspent: {(expenses - income).toFixed(2)} {currencySign}
                          </div>
                        ) : (
                          <div className="text-gray-600 font-medium">
                            Spent: {expenses.toFixed(2)} {currencySign}
                          </div>
                        )}
                      </div>
                    </>
                  ) : expenses > 0 ? (
                    <div className="text-gray-600 font-medium ml-auto">
                      Spent: {expenses.toFixed(2)} {currencySign}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card.CardContent>
      <Card.CardFooter className="flex justify-between items-center border-t pt-4">
        <div className="flex items-center gap-2">
          <Link
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
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
