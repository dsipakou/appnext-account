import * as React from 'react';
import { useEffect, useState } from 'react';
import { useStore } from '@/app/store'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { mutate } from 'swr';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useUsers } from '@/hooks/users';
import { useBudgetMonth, useBudgetWeek, useGetDuplicates } from '@/hooks/budget';
import { User } from '@/components/users/types';
import { getStartOfMonth, getEndOfMonth, getStartOfWeek, getEndOfWeek, getFormattedDate } from '@/utils/dateUtils';
import { GeneralSummaryCard } from '@/components/budget/components';
import WeekCalendar from '@/components/budget/components/week/WeekCalendar';
import MonthCalendar from '@/components/budget/components/month/MonthCalendar';
import { PlannedMap, SpentMap, CompactWeekItem } from '@/components/budget/types';
import { AddForm, DuplicateForm, SavedForLaterForm, TransactionsForm } from '@/components/budget/forms';

type BudgetType = 'month' | 'week';

function withBudgetTemplate<T>(Component: React.ComponentType<T>) {
  return (hocProps: Omit<T, 'activeType'>) => {
    const activeType = hocProps.activeType || 'month';
    const router = useRouter();
    const {
      data: { user: userConfig },
    } = useSession();
    const [user, setUser] = useState<string>('all');
    const [startOfMonth, setStartOfMonth] = useState<string>('');
    const [startOfWeek, setStartOfWeek] = useState<string>('');
    const [endOfMonth, setEndOfMonth] = useState<string>('');
    const [endOfWeek, setEndOfWeek] = useState<string>('');
    const [plannedSum, setPlannedSum] = useState<number>(0);
    const [spentSum, setSpentSum] = useState<number>(0);
    const [isOpenTransactionsForm, setIsOpenTransactionsForm] = useState<boolean>(false);
    const [activeBudgetUuid, setActiveBudgetUuid] = useState<string>('');
    const startDate = activeType === 'month' ? startOfMonth : startOfWeek;
    const endDate = activeType === 'month' ? endOfMonth : endOfWeek;

    const weekDate = useStore((state) => state.weekDate)
    const monthDate = useStore((state) => state.monthDate)
    const setWeekDate = useStore((state) => state.setWeekDate)
    const setMonthDate = useStore((state) => state.setMonthDate)

    const { data: users } = useUsers();

    const { data: budgetMonth = [], url: monthUrl } = useBudgetMonth(startOfMonth, endOfMonth, user);
    const {
      data: budgetWeek = [],
      url: weekUrl,
      isLoading: isWeekBudgetLoading,
    } = useBudgetWeek(startOfWeek, endOfWeek, user);
    const { data: duplicateList = [], url: duplicateListUrl } = useGetDuplicates(
      activeType,
      activeType === 'month' ? getFormattedDate(monthDate) : getFormattedDate(weekDate)
    );

    const handleClickTransactions = (uuid: string): void => {
      setActiveBudgetUuid(uuid);
      setIsOpenTransactionsForm(true);
    };

    useEffect(() => {
      setStartOfMonth(getStartOfMonth(monthDate));
      setEndOfMonth(getEndOfMonth(monthDate));
    }, [monthDate]);

    useEffect(() => {
      setStartOfWeek(getStartOfWeek(weekDate));
      setEndOfWeek(getEndOfWeek(weekDate));
    }, [weekDate]);

    useEffect(() => {
      let _planned = 0;
      let _spent = 0;
      if (activeType === 'month') {
        if (!budgetMonth) return;

        _planned = budgetMonth.reduce((acc: number, { plannedInCurrencies }: PlannedMap) => {
          return acc + plannedInCurrencies[userConfig?.currency];
        }, 0);
        _spent = budgetMonth.reduce((acc: number, { spentInCurrencies }: SpentMap) => {
          return acc + (spentInCurrencies[userConfig?.currency] || 0);
        }, 0);
      } else {
        if (!budgetWeek) return;

        _planned = budgetWeek.reduce((acc: number, { plannedInCurrencies }: PlannedMap) => {
          return acc + plannedInCurrencies[userConfig?.currency];
        }, 0);
        _spent = budgetWeek.reduce((acc: number, { spentInCurrencies }: SpentMap) => {
          return acc + (spentInCurrencies[userConfig?.currency] || 0);
        }, 0);
      }
      setPlannedSum(_planned);
      setSpentSum(_spent);
    }, [budgetMonth, budgetWeek]);

    const handleTypeButtonClick = (type: BudgetType) => {
      router.push(`/budget/${type}`);
    };

    const changeUser = (userId: string): void => {
      setUser(userId);
    };

    const handleCloseModal = () => {
      setIsOpenTransactionsForm(false);
      setActiveBudgetUuid('');
    };

    const mutateBudget = (updatedBudget?: CompactWeekItem): void => {
      if (updatedBudget) {
        mutate(
          weekUrl,
          async (budgets: CompactWeekItem[]) => {
            return budgets.map((item: CompactWeekItem) => {
              if (item.uuid === updatedBudget.uuid) {
                return {
                  ...item,
                  isCompleted: updatedBudget.isCompleted,
                  budgetDate: updatedBudget.budgetDate,
                };
              }
              return item;
            });
          },
          { revalidate: false }
        );
      } else {
        mutate(weekUrl);
      }
      mutate(monthUrl);
    };

    const toolbar = (
      <div className="flex justify-between items-center py-3 h-20">
        <span className="text-xl font-bold">Budget</span>
        <div className="flex border bg-blue-500 rounded-md">
          <Button
            className="w-[180px] disabled:opacity-100 p-1"
            disabled={activeType === 'month'}
            variant="none"
            onClick={() => handleTypeButtonClick('month')}
          >
            <span
              className={`text-xl ${activeType === 'month' ? 'flex justify-center items-center text-xl rounded-md text-blue-500 bg-white w-full h-full' : 'text-white'}`}
            >
              Monthly
            </span>
          </Button>
          <Button
            className="w-[180px] disabled:opacity-100 p-1"
            disabled={activeType === 'week'}
            variant="none"
            onClick={() => handleTypeButtonClick('week')}
          >
            <span
              className={`text-xl ${activeType === 'week' ? 'flex justify-center items-center text-xl rounded-md text-blue-500 bg-white w-full h-full' : 'text-white'}`}
            >
              Weekly
            </span>
          </Button>
        </div>
        <div className="flex items-center">
          <SavedForLaterForm weekUrl={weekUrl} monthUrl={monthUrl} />
          <DuplicateForm budgetList={duplicateList} urlToMutate={duplicateListUrl} mutateBudget={mutateBudget} />
          <AddForm monthUrl={monthUrl} weekUrl={weekUrl} />
        </div>
      </div>
    );

    const header = (
      <div className="flex justify-between items-center gap-3 h-auto">
        <div className="w-1/3">
          <GeneralSummaryCard planned={plannedSum} spent={spentSum} title={activeType} />
        </div>
        <div className="w-1/3 px-7">
          <Select onValueChange={changeUser} defaultValue="all" disabled={!users}>
            <SelectTrigger className="relative w-full border-2 hover:text-black text-muted-foreground font-normal">
              <SelectValue placeholder="User" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Users</SelectLabel>
                <SelectItem value="all">All users</SelectItem>
                <DropdownMenuSeparator />
                {users &&
                  users.map((item: User) => (
                    <SelectItem value={item.uuid} key={item.uuid}>
                      {item.username}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="w-1/3 h-auto">
          {activeType === 'month' ? (
            <MonthCalendar date={monthDate} setMonthDate={setMonthDate} />
          ) : (
            <WeekCalendar date={weekDate} setWeekDate={setWeekDate} />
          )}
        </div>
      </div>
    );

    const emptyState = (
      <div className="flex w-full h-full pt-20 justify-center items-center">
        <span className="text-2xl">No plans for this {activeType === 'month' ? 'month' : 'week'}</span>
      </div>
    );

    const loadingState = (
      <div className="flex w-full h-full pt-20 justify-center items-center">
        <span className="text-2xl">Loading budget...</span>
      </div>
    );

    return (
      <>
        {toolbar}
        <div className="flex flex-col h-full max-h-full">
          <div className="w-full p-1 rounded shadow-sm shadow-zinc-300 bg-white">{header}</div>
          <div className="@container-[size] flex w-full mt-5 h-full max-h-full">
            {(activeType === 'month' && budgetMonth.length === 0) ||
            (activeType === 'week' && budgetWeek.length === 0) ? (
              isWeekBudgetLoading ? (
                loadingState
              ) : (
                emptyState
              )
            ) : (
              <Component
                startDate={startDate}
                endDate={endDate}
                clickShowTransactions={handleClickTransactions}
                mutateBudget={mutateBudget}
                user={user}
                weekUrl={weekUrl}
                monthUrl={monthUrl}
                duplicateListUrl={duplicateListUrl}
              />
            )}
          </div>
        </div>
        {activeBudgetUuid && (
          <>
            <TransactionsForm open={isOpenTransactionsForm} handleClose={handleCloseModal} uuid={activeBudgetUuid} />
          </>
        )}
      </>
    );
  };
}

export default withBudgetTemplate;
