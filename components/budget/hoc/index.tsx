import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import * as React from "react";
import { useEffect, useState } from "react";
import { mutate } from "swr";

import type {
  CompactWeekItem,
  GroupedByCategoryBudget,
  PlannedMap,
  SpentMap,
  WeekBudgetItem,
} from "@/components/budget/types";
import type { UserResponse } from "@/hooks/users";

import { useStore } from "@/app/store";
import { GeneralSummaryCard } from "@/components/budget/components";
import MonthCalendar from "@/components/budget/components/month/MonthCalendar";
import WeekCalendar from "@/components/budget/components/week/WeekCalendar";
import { AddForm, SavedForLaterForm, TransactionsForm } from "@/components/budget/forms";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import * as Slc from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useAccounts } from "@/hooks/accounts";
import { useBudgetMonth, useBudgetWeek } from "@/hooks/budget";
import { useCategories } from "@/hooks/categories";
import { useUsers } from "@/hooks/users";
import { cn } from "@/lib/utils";
import { getEndOfMonth, getEndOfWeek, getStartOfMonth, getStartOfWeek } from "@/utils/dateUtils";

type BudgetType = "month" | "week" | "recurrent";

const EMPTY_MONTH_BUDGET: GroupedByCategoryBudget[] = [];
const EMPTY_WEEK_BUDGET: WeekBudgetItem[] = [];

function withBudgetTemplate<T>(Component: React.ComponentType<T>) {
  return (hocProps: Omit<T, "activeType">) => {
    const activeType = hocProps.activeType || "month";
    const router = useRouter();
    const {
      data: { user: userConfig },
    } = useSession();
    const [user, setUser] = useState<string>("all");
    const [startOfMonth, setStartOfMonth] = useState<string>("");
    const [startOfWeek, setStartOfWeek] = useState<string>("");
    const [endOfMonth, setEndOfMonth] = useState<string>("");
    const [endOfWeek, setEndOfWeek] = useState<string>("");
    const [plannedSum, setPlannedSum] = useState<number>(0);
    const [spentSum, setSpentSum] = useState<number>(0);
    const [isOpenTransactionsForm, setIsOpenTransactionsForm] = useState<boolean>(false);
    const [activeBudgetUuid, setActiveBudgetUuid] = useState<string>("");
    const startDate = activeType === "month" ? startOfMonth : startOfWeek;
    const endDate = activeType === "month" ? endOfMonth : endOfWeek;
    const { data: accounts = [], isLoading: isAccountsLoading } = useAccounts();
    const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
    const hasNoAccounts = accounts.length === 0;
    const hasNoCategories = categories.length === 0;
    const hasMissingSetup = hasNoAccounts || hasNoCategories;

    const weekDate = useStore((state) => state.weekDate);
    const monthDate = useStore((state) => state.monthDate);
    const setWeekDate = useStore((state) => state.setWeekDate);
    const setMonthDate = useStore((state) => state.setMonthDate);

    const { data: users = [], isLoading: isUserLoading } = useUsers();
    const extendedUsers = React.useMemo(
      () => [{ username: "All users", uuid: "all" }, ...users],
      [users],
    );

    const {
      data: budgetMonth = EMPTY_MONTH_BUDGET,
      url: monthUrl,
      isLoading: isMonthBudgetLoading,
    } = useBudgetMonth(startOfMonth, endOfMonth, user);
    const {
      data: budgetWeek = EMPTY_WEEK_BUDGET,
      url: weekUrl,
      isLoading: isWeekBudgetLoading,
    } = useBudgetWeek(startOfWeek, endOfWeek, user);

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
      if (activeType === "month") {
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
      setActiveBudgetUuid("");
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
          { revalidate: false },
        );
      } else {
        mutate(weekUrl);
      }
      mutate(monthUrl);
    };

    const toolbar = (
      <div className="flex h-20 items-center justify-between py-3">
        <span className="text-xl font-bold">Budget</span>
        <div className="flex rounded-md bg-blue-500">
          <Button
            className="w-45 p-px disabled:opacity-100"
            disabled={activeType === "month"}
            variant="empty"
            onClick={() => handleTypeButtonClick("month")}
          >
            <span
              className={cn(
                "flex h-full w-full items-center justify-center text-xl text-white",
                activeType === "month" && "rounded-sm bg-white text-blue-500",
              )}
            >
              Monthly
            </span>
          </Button>
          <Button
            className="w-45 p-px disabled:opacity-100"
            disabled={activeType === "week"}
            variant="empty"
            onClick={() => handleTypeButtonClick("week")}
          >
            <span
              className={cn(
                "flex h-full w-full items-center justify-center text-xl text-white",
                activeType === "week" && "rounded-md bg-white text-blue-500",
              )}
            >
              Weekly
            </span>
          </Button>
          <Button
            className="w-45 p-px disabled:opacity-100"
            disabled={activeType === "recurrent"}
            variant="empty"
            onClick={() => handleTypeButtonClick("recurrent")}
          >
            <span
              className={cn(
                "flex h-full w-full items-center justify-center text-xl text-white",
                activeType === "recurrent" && "rounded-md bg-white text-blue-500",
              )}
            >
              Recurrent
            </span>
          </Button>
        </div>
        <div className="flex items-center">
          <SavedForLaterForm weekUrl={weekUrl} monthUrl={monthUrl} />
          <AddForm monthUrl={monthUrl} weekUrl={weekUrl} />
        </div>
      </div>
    );

    const header = (
      <div className="flex h-auto items-center justify-between gap-3">
        <div className="w-1/3">
          <GeneralSummaryCard planned={plannedSum} spent={spentSum} title={activeType} />
        </div>
        <div className="w-1/3 px-7">
          <Slc.Select
            onValueChange={changeUser}
            defaultValue="all"
            disabled={isUserLoading}
            items={extendedUsers.map((item: UserResponse) => ({
              label: item.username,
              value: item.uuid,
            }))}
          >
            <Slc.SelectTrigger className="text-muted-foreground relative w-full border-2 font-normal hover:text-black">
              <Slc.SelectValue placeholder="User" />
            </Slc.SelectTrigger>
            <Slc.SelectPopup>
              <Slc.SelectGroup>
                <Slc.SelectGroupLabel>Users</Slc.SelectGroupLabel>
                {extendedUsers.map((item: UserResponse) => (
                  <Slc.SelectItem value={item.uuid} key={item.uuid}>
                    {item.username}
                  </Slc.SelectItem>
                ))}
              </Slc.SelectGroup>
            </Slc.SelectPopup>
          </Slc.Select>
        </div>
        <div className="h-auto w-1/3">
          {activeType === "month" ? (
            <MonthCalendar date={monthDate} setMonthDate={setMonthDate} />
          ) : (
            <WeekCalendar date={weekDate} setWeekDate={setWeekDate} />
          )}
        </div>
      </div>
    );

    const emptyState = (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon"></EmptyMedia>
          <EmptyTitle>No plans for this {activeType}</EmptyTitle>
          <EmptyDescription>
            You haven&apos;t planned anything for this {activeType}.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <AddForm monthUrl={monthUrl} weekUrl={weekUrl} />
          </div>
        </EmptyContent>
      </Empty>
    );

    const setupEmptyState = (
      <Empty className="max-w-2xl border bg-white shadow-sm">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <span className="text-xl">$</span>
          </EmptyMedia>
          <EmptyTitle>Set up your budget workspace</EmptyTitle>
          <EmptyDescription>
            Add{" "}
            {hasNoAccounts && hasNoCategories ? "an account and a category" : "the missing item"}{" "}
            before planning this {activeType}. Budgets need somewhere money comes from and a
            category to organize it.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="grid w-full gap-3 sm:grid-cols-2">
            <div className="rounded-lg border bg-slate-50 p-4 text-left">
              <div className="font-medium">Accounts</div>
              <div className="text-muted-foreground mt-1 text-sm">
                {hasNoAccounts
                  ? "Create your first wallet, card, or cash account."
                  : "You already have accounts."}
              </div>
            </div>
            <div className="rounded-lg border bg-slate-50 p-4 text-left">
              <div className="font-medium">Categories</div>
              <div className="text-muted-foreground mt-1 text-sm">
                {hasNoCategories
                  ? "Create categories like groceries, rent, or subscriptions."
                  : "You already have categories."}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {hasNoAccounts && (
              <Link href="/accounts/" className={buttonVariants()}>
                Add account
              </Link>
            )}
            {hasNoCategories && (
              <Link
                href="/categories/"
                className={buttonVariants({ variant: hasNoAccounts ? "outline" : "default" })}
              >
                Add category
              </Link>
            )}
          </div>
        </EmptyContent>
      </Empty>
    );

    const isBudgetLoading = isWeekBudgetLoading || isMonthBudgetLoading;
    const isSetupLoading = isAccountsLoading || isCategoriesLoading;
    const hasNoBudget =
      (activeType === "month" && budgetMonth.length === 0) ||
      (activeType === "week" && budgetWeek.length === 0);
    const shouldCenterContent = isBudgetLoading || isSetupLoading || hasMissingSetup || hasNoBudget;

    let content = (
      <Component
        startDate={startDate}
        endDate={endDate}
        clickShowTransactions={handleClickTransactions}
        mutateBudget={mutateBudget}
        user={user}
      />
    );

    if (isBudgetLoading || isSetupLoading) {
      content = <Spinner className="size-8" />;
    } else if (hasMissingSetup) {
      content = setupEmptyState;
    } else if (hasNoBudget) {
      content = emptyState;
    }

    return (
      <>
        {toolbar}
        <div className="flex h-full max-h-full flex-col">
          {activeType !== "recurrent" && (
            <div className="w-full rounded bg-white p-1 shadow-sm shadow-zinc-300">{header}</div>
          )}
          <div className="@container-[size] flex h-full max-h-full w-full">
            {shouldCenterContent ? (
              <div className="flex h-full w-full items-center justify-center">{content}</div>
            ) : (
              content
            )}
          </div>
        </div>
        {activeBudgetUuid && (
          <>
            <TransactionsForm
              open={isOpenTransactionsForm}
              handleClose={handleCloseModal}
              uuid={activeBudgetUuid}
            />
          </>
        )}
      </>
    );
  };
}

export default withBudgetTemplate;
