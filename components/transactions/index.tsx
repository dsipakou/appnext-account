'use client';

import { Scroll } from 'lucide-react';
import { useSession } from 'next-auth/react';
import * as React from 'react';

import EDailyChart from '@/components/transactions/components/EDailyChart';
import { AddForm, AddIncomeForm, ExportForm } from '@/components/transactions/forms';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { useTransactions } from '@/hooks/transactions';
import { cn } from '@/lib/utils';
import { getFormattedDate } from '@/utils/dateUtils';

import IncomeComponent from './components/IncomeContainer';
import { TransactionsTable } from './components/transactionTable';
import LastAdded from './forms/LastAdded';

export type TransactionType = 'outcome' | 'income';

const Index: React.FC = () => {
  const { data: session } = useSession();
  const user = session?.user;
  if (!user) {
    return;
  }

  const [transactionDate, setTransactionDate] = React.useState<Date>(new Date());
  const [incomeYear, setIncomeYear] = React.useState<number>(new Date().getFullYear());
  const [isOpenTransactionsDialog, setIsOpenTransactionsDialog] = React.useState<boolean>(false);
  const [isOpenAddIncomeTransactions, setIsOpenAddIncomeTransactions] = React.useState<boolean>(false);
  const [activeType, setActiveType] = React.useState<TransactionType>('outcome');

  const {
    data: transactions = [],
    isLoading: isTransactionsLoading,
    url: transactionsUrl = '',
  } = useTransactions({
    sorting: 'added',
    limit: 500,
    dateFrom: getFormattedDate(transactionDate),
    dateTo: getFormattedDate(transactionDate),
  });

  const {
    data: incomeTransactions = [],
    isLoading: isIncomeTransactionsLoading,
    url: incomeTransactionsUrl = '',
  } = useTransactions({
    sorting: 'added',
    limit: 100,
    type: 'income',
    dateFrom: getFormattedDate(new Date(incomeYear, 0, 1)),
    dateTo: getFormattedDate(new Date(incomeYear, 11, 31)),
  });

  const handleCloseModal = (): void => {
    setIsOpenTransactionsDialog(false);
    setIsOpenAddIncomeTransactions(false);
  };

  return (
    <div className="flex h-full flex-col pt-2">
      <div className="flex w-full shrink-0 items-center justify-between px-6 pb-3">
        <span className="text-xl font-semibold">Transactions</span>
        <div className="flex rounded-md bg-blue-500">
          <Button
            className="w-45 p-px disabled:opacity-100"
            disabled={activeType === 'income'}
            variant="empty"
            onClick={() => setActiveType('income')}
          >
            <span
              className={cn(
                'flex h-full w-full items-center justify-center text-xl text-white',
                activeType === 'income' && 'rounded-sm bg-white text-blue-500',
              )}
            >
              Income
            </span>
          </Button>
          <Button
            className="w-45 p-px disabled:opacity-100"
            disabled={activeType === 'outcome'}
            variant="empty"
            onClick={() => setActiveType('outcome')}
          >
            <span
              className={cn(
                'flex h-full w-full items-center justify-center text-xl text-white',
                activeType === 'outcome' && 'rounded-md bg-white text-blue-500',
              )}
            >
              Outcome
            </span>
          </Button>
        </div>
        <div className="flex gap-2">
          <LastAdded />
          <ExportForm />
          <Button
            variant="outline"
            className="border-blue-500 text-blue-500 hover:text-blue-600"
            onClick={() => setIsOpenAddIncomeTransactions(true)}
          >
            Add income
          </Button>
          <Button onClick={() => setIsOpenTransactionsDialog(true)}>Add spendings</Button>
        </div>
      </div>
      {activeType === 'outcome' ? (
        <div className="grid min-h-0 flex-1 grid-cols-7 gap-2 px-6">
          <div className="col-span-5 flex min-h-0 flex-col rounded-md bg-white">
            {isTransactionsLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Spinner className="size-8" />
                </div>
              </div>
            ) : transactions.length === 0 ? (
              <Empty className="flex h-full items-center justify-center">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Scroll />
                  </EmptyMedia>
                  <EmptyTitle>No transactions for this date</EmptyTitle>
                  <EmptyDescription>You haven&apos;t added any transactions for this date.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <div className="flex gap-2">
                    <Button onClick={() => setIsOpenTransactionsDialog(true)}>+ Add transactions</Button>
                  </div>
                </EmptyContent>
              </Empty>
            ) : (
              <TransactionsTable transactions={transactions} />
            )}
          </div>
          <div className="col-span-2 flex flex-col gap-2 overflow-y-auto">
            <div className="flex flex-1 flex-col items-center justify-center rounded-md bg-white p-3">
              <span className="mt-2 text-xl font-semibold">Transaction day</span>
              <Calendar
                mode="single"
                selected={transactionDate}
                onSelect={(day) => !(day == null) && setTransactionDate(day)}
                weekStartsOn={1}
              />
            </div>
            <div className="flex flex-1 flex-col flex-nowrap items-center justify-center rounded-md bg-white p-3">
              <span className="my-2 text-xl font-semibold">Day summary</span>
              <div className="flex w-full">
                <EDailyChart transactions={transactions} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 px-6">
          <IncomeComponent
            transactions={incomeTransactions}
            transactionsUrl={transactionsUrl}
            isLoading={isIncomeTransactionsLoading}
            year={incomeYear}
            setYear={setIncomeYear}
          />
        </div>
      )}
      <AddForm open={isOpenTransactionsDialog} onOpenChange={setIsOpenTransactionsDialog} url={transactionsUrl} />
      <AddIncomeForm open={isOpenAddIncomeTransactions} url={incomeTransactionsUrl} handleClose={handleCloseModal} />
    </div>
  );
};

export default Index;
