import type { FC } from "react";

import { addMonths } from "date-fns";
import { Calendar, MoreVertical, Pencil, Repeat, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

import type {
  GroupedByCategoryBudget,
  MonthGroupedBudgetItem,
  RecurrentTypes,
} from "@/components/budget/types";
import type { UserResponse } from "@/hooks/users";

import { useStore } from "@/app/store";
import { ConfirmDeleteForm, EditForm } from "@/components/budget/forms";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import * as Mnu from "@/components/ui/menu";
import { Spinner } from "@/components/ui/spinner";
import { useBudgetMonth } from "@/hooks/budget";
import { useUsers } from "@/hooks/users";
import { cn } from "@/lib/utils";
import {
  getEndOfMonth,
  getFormattedDate,
  getStartOfMonth,
  LONG_YEAR_SHORT_MONTH_FORMAT,
  parseDate,
} from "@/utils/dateUtils";
import { formatMoney } from "@/utils/numberUtils";

type RecurrentBudget = {
  uuid: string;
  title: string;
  user: string;
  categoryName: string;
  recurrent: RecurrentTypes;
  plannedAmount: number;
  dates: string[];
  budgetDate: string;
  occurrences: number;
};

type SessionUser = {
  username?: string;
};

type Types = {
  user: string;
};

const getBudgetDateLabel = (date: string): string => {
  return getFormattedDate(parseDate(date), "MMM dd");
};

const getBudgetDatesLabel = (dates: string[]): string => {
  if (dates.length === 0) {
    return "";
  }

  const parsedDates = dates.map((date) => parseDate(date));
  const firstMonth = getFormattedDate(parsedDates[0], "MMM");
  const hasSingleMonth = parsedDates.every((date) => getFormattedDate(date, "MMM") === firstMonth);

  if (!hasSingleMonth) {
    return dates.map(getBudgetDateLabel).join(", ");
  }

  const dayLabels = parsedDates.map((date) => getFormattedDate(date, "dd"));

  return `${firstMonth} ${dayLabels.join(", ")}`;
};

const getBudgetCountLabel = (count: number): string => {
  return `${count} ${count === 1 ? "budget" : "budgets"}`;
};

const getIncludedBudgetCountLabel = (includedCount: number, totalCount: number): string => {
  if (includedCount === totalCount) {
    return getBudgetCountLabel(totalCount);
  }

  return `${includedCount} of ${getBudgetCountLabel(totalCount)}`;
};

const getBudgetPlannedAmount = (budget: MonthGroupedBudgetItem, currency: string): number => {
  return budget.plannedInCurrencies[currency] ?? 0;
};

const getRecurrentBudgets = (
  budget: GroupedByCategoryBudget[],
  currency: string,
): RecurrentBudget[] => {
  const recurrentBudgets = new Map<string, RecurrentBudget>();

  for (const category of budget) {
    for (const item of category.budgets ?? []) {
      const recurrentItems = (item.items ?? []).filter((budgetItem) => budgetItem.recurrent);
      if (recurrentItems.length === 0) {
        continue;
      }

      const [{ recurrent }] = recurrentItems;
      const sortedRecurrentItems = recurrentItems.toSorted((a, b) =>
        a.budgetDate.localeCompare(b.budgetDate),
      );
      const [representativeBudget] = sortedRecurrentItems;
      const budgetKey = `${item.title}-${recurrent}-${representativeBudget.user}`;
      const existingBudget = recurrentBudgets.get(budgetKey);
      const dates = sortedRecurrentItems.map((budgetItem) => budgetItem.budgetDate);
      const plannedAmount = getBudgetPlannedAmount(item, currency);
      const isActualOnlyBudget = item.isAnotherCategory || item.isAnotherMonth;

      if (!existingBudget) {
        recurrentBudgets.set(budgetKey, {
          uuid: representativeBudget.uuid,
          title: item.title,
          user: representativeBudget.user,
          categoryName: isActualOnlyBudget ? "" : category.categoryName,
          recurrent,
          plannedAmount: isActualOnlyBudget ? 0 : plannedAmount,
          dates,
          budgetDate: representativeBudget.budgetDate,
          occurrences: dates.length,
        });
        continue;
      }

      const mergedDates = [...new Set([...existingBudget.dates, ...dates])].toSorted();

      recurrentBudgets.set(budgetKey, {
        ...existingBudget,
        categoryName: isActualOnlyBudget ? existingBudget.categoryName : category.categoryName,
        plannedAmount: existingBudget.plannedAmount + (isActualOnlyBudget ? 0 : plannedAmount),
        dates: mergedDates,
        occurrences: mergedDates.length,
      });
    }
  }

  return [...recurrentBudgets.values()];
};

const RecurrentBudgetCard: FC<{
  budget: RecurrentBudget;
  currencySign: string;
  isIncluded: boolean;
  onIncludedChange: (isIncluded: boolean) => void;
  budgetUser?: UserResponse;
  showUser: boolean;
}> = ({ budget, currencySign, isIncluded, onIncludedChange, budgetUser, showUser }) => {
  const [isEditDialogOpened, setIsEditDialogOpened] = useState(false);
  const [isConfirmDeleteDialogOpened, setIsConfirmDeleteDialogOpened] = useState(false);

  return (
    <div className={cn("rounded-xl border bg-white p-4 shadow-sm", !isIncluded && "opacity-60")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-lg font-semibold text-slate-900">{budget.title}</div>
            {showUser && budgetUser && (
              <Badge variant="outline" className="bg-violet-50 text-violet-700">
                {budgetUser.username}
              </Badge>
            )}
          </div>
          <div className="text-muted-foreground text-sm">{budget.categoryName}</div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={budget.recurrent === "monthly" ? "default" : "secondary"}>
            {budget.recurrent}
          </Badge>
          <Mnu.Menu>
            <Mnu.MenuTrigger
              className={buttonVariants({ variant: "ghost", size: "icon-xs" })}
              aria-label="Budget actions"
            >
              <MoreVertical className="h-4 w-4" />
            </Mnu.MenuTrigger>
            <Mnu.MenuPopup align="end">
              <Mnu.MenuGroup>
                <Mnu.MenuGroupLabel>Actions</Mnu.MenuGroupLabel>
                <Mnu.MenuItem onClick={() => setIsEditDialogOpened(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </Mnu.MenuItem>
                <Mnu.MenuItem
                  variant="destructive"
                  onClick={() => setIsConfirmDeleteDialogOpened(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </Mnu.MenuItem>
              </Mnu.MenuGroup>
            </Mnu.MenuPopup>
          </Mnu.Menu>
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          <span>{getBudgetDatesLabel(budget.dates)}</span>
          {budget.occurrences > 1 && (
            <Badge variant="outline" className="bg-white text-slate-600">
              {`x${budget.occurrences}`}
            </Badge>
          )}
        </div>
        <div className="text-right">
          <div className="text-muted-foreground text-xs">Planned</div>
          <div className="text-xl font-bold text-slate-900">
            {formatMoney(budget.plannedAmount)} {currencySign}
          </div>
        </div>
      </div>
      <label className="text-muted-foreground mt-3 flex cursor-pointer items-center gap-2 text-sm">
        <Checkbox checked={isIncluded} onClick={() => onIncludedChange(!isIncluded)} />
        <span>Include in total</span>
      </label>
      {isEditDialogOpened && (
        <EditForm uuid={budget.uuid} open={isEditDialogOpened} setOpen={setIsEditDialogOpened} />
      )}
      {isConfirmDeleteDialogOpened && (
        <ConfirmDeleteForm
          uuid={budget.uuid}
          open={isConfirmDeleteDialogOpened}
          setOpen={setIsConfirmDeleteDialogOpened}
          recurrent={budget.recurrent}
          budgetDate={budget.budgetDate}
        />
      )}
    </div>
  );
};

const Container: FC<Types> = ({ user }) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [excludedBudgetIds, setExcludedBudgetIds] = useState<Set<string>>(() => new Set());
  const currency = useStore((state) => state.currency);
  const { data: session } = useSession();
  const authUsername = (session?.user as SessionUser | undefined)?.username;
  const { data: users = [] } = useUsers();
  const startDate = getStartOfMonth(selectedMonth);
  const endDate = getEndOfMonth(selectedMonth);
  const { data: budget = [], isLoading } = useBudgetMonth(startDate, endDate, user);

  const {
    monthlyBudgets,
    weeklyBudgets,
    monthlyIncludedCount,
    weeklyIncludedCount,
    monthlyTotal,
    weeklyTotal,
  } = useMemo(() => {
    const recurrentBudgets = getRecurrentBudgets(budget, currency.code);
    const monthlyBudgets = recurrentBudgets
      .filter((item) => item.recurrent === "monthly")
      .toSorted((a, b) => a.budgetDate.localeCompare(b.budgetDate));
    const weeklyBudgets = recurrentBudgets
      .filter((item) => item.recurrent === "weekly")
      .toSorted((a, b) => a.budgetDate.localeCompare(b.budgetDate));

    const includedMonthlyBudgets = monthlyBudgets.filter(
      (item) => !excludedBudgetIds.has(item.uuid),
    );
    const includedWeeklyBudgets = weeklyBudgets.filter((item) => !excludedBudgetIds.has(item.uuid));

    return {
      monthlyBudgets,
      weeklyBudgets,
      monthlyIncludedCount: includedMonthlyBudgets.length,
      weeklyIncludedCount: includedWeeklyBudgets.length,
      monthlyTotal: includedMonthlyBudgets.reduce((acc, item) => acc + item.plannedAmount, 0),
      weeklyTotal: includedWeeklyBudgets.reduce((acc, item) => acc + item.plannedAmount, 0),
    };
  }, [budget, currency.code, excludedBudgetIds]);

  const handleBudgetIncludedChange = (uuid: string, isIncluded: boolean) => {
    setExcludedBudgetIds((current) => {
      const next = new Set(current);

      if (isIncluded) {
        next.delete(uuid);
      } else {
        next.add(uuid);
      }

      return next;
    });
  };

  const getBudgetUser = (budgetUser: string) => users.find((item) => item.uuid === budgetUser);

  const shouldShowBudgetUser = (budgetUser?: UserResponse) => {
    return budgetUser !== undefined && budgetUser.username !== authUsername;
  };

  const currentMonth = new Date();
  const nextMonth = addMonths(currentMonth, 1);
  const isCurrentMonth = startDate === getStartOfMonth(currentMonth);
  const isNextMonth = startDate === getStartOfMonth(nextMonth);
  const monthTitle = getFormattedDate(selectedMonth, LONG_YEAR_SHORT_MONTH_FORMAT);

  let budgetList = (
    <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_480px]">
      <div className="flex min-h-0 flex-col gap-3">
        <h2 className="flex-shrink-0 text-lg font-semibold text-slate-900">Monthly recurrent</h2>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
          {monthlyBudgets.length === 0 ? (
            <div className="rounded-xl border bg-white p-5 text-slate-500">
              No monthly recurrent budgets active in {monthTitle}.
            </div>
          ) : (
            monthlyBudgets.map((budget) => {
              const budgetUser = getBudgetUser(budget.user);

              return (
                <RecurrentBudgetCard
                  key={`${budget.uuid}-${budget.dates.join("-")}`}
                  budget={budget}
                  currencySign={currency.sign}
                  isIncluded={!excludedBudgetIds.has(budget.uuid)}
                  onIncludedChange={(isIncluded) =>
                    handleBudgetIncludedChange(budget.uuid, isIncluded)
                  }
                  budgetUser={budgetUser}
                  showUser={shouldShowBudgetUser(budgetUser)}
                />
              );
            })
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-col gap-3">
        <h2 className="flex-shrink-0 text-lg font-semibold text-slate-900">Weekly recurrent</h2>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
          {weeklyBudgets.length === 0 ? (
            <div className="rounded-xl border bg-white p-5 text-slate-500">
              No weekly recurrent budgets active in {monthTitle}.
            </div>
          ) : (
            weeklyBudgets.map((budget) => {
              const budgetUser = getBudgetUser(budget.user);

              return (
                <RecurrentBudgetCard
                  key={`${budget.uuid}-${budget.dates.join("-")}`}
                  budget={budget}
                  currencySign={currency.sign}
                  isIncluded={!excludedBudgetIds.has(budget.uuid)}
                  onIncludedChange={(isIncluded) =>
                    handleBudgetIncludedChange(budget.uuid, isIncluded)
                  }
                  budgetUser={budgetUser}
                  showUser={shouldShowBudgetUser(budgetUser)}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  if (monthlyBudgets.length === 0 && weeklyBudgets.length === 0) {
    budgetList = (
      <div className="flex h-full items-center justify-center rounded-xl border bg-white p-8 text-center">
        <div>
          <Calendar className="mx-auto mb-4 h-14 w-14 text-slate-300" />
          <div className="text-xl font-semibold text-slate-700">No recurrent budgets</div>
          <p className="text-muted-foreground mt-2">
            There are no recurring budgets active in {monthTitle}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full max-h-full w-full flex-col gap-5 overflow-hidden">
      <div className="rounded-xl bg-white p-3 shadow-sm shadow-zinc-300">
        <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-2xl font-bold text-slate-900">
              <Repeat className="h-6 w-6 text-blue-500" />
              Recurrent budgets
            </div>
          </div>
          <div className="flex rounded-md bg-blue-500 p-px lg:justify-self-center">
            <Button
              className="w-40 p-px disabled:opacity-100"
              disabled={isCurrentMonth}
              variant="empty"
              onClick={() => setSelectedMonth(currentMonth)}
            >
              <span
                className={cn(
                  "flex h-full w-full items-center justify-center rounded-sm text-white",
                  isCurrentMonth && "bg-white text-blue-500",
                )}
              >
                Current month
              </span>
            </Button>
            <Button
              className="w-40 p-px disabled:opacity-100"
              disabled={isNextMonth}
              variant="empty"
              onClick={() => setSelectedMonth(nextMonth)}
            >
              <span
                className={cn(
                  "flex h-full w-full items-center justify-center rounded-sm text-white",
                  isNextMonth && "bg-white text-blue-500",
                )}
              >
                Next month
              </span>
            </Button>
          </div>
          <div />
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-r-cyan-400 border-b-cyan-400 bg-cyan-100 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-muted-foreground text-sm font-medium">
                  Monthly recurrent total
                </div>
                <div className="text-muted-foreground mt-1 text-xs">Planned in {monthTitle}</div>
              </div>
              <Badge variant="outline" className="bg-white text-slate-600">
                {getIncludedBudgetCountLabel(monthlyIncludedCount, monthlyBudgets.length)}
              </Badge>
            </div>
            <div className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              {formatMoney(monthlyTotal)} {currency.sign}
            </div>
          </div>

          <div className="rounded-xl border border-r-orange-400 border-b-orange-400 bg-orange-100 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-muted-foreground text-sm font-medium">
                  Weekly recurrent total
                </div>
                <div className="text-muted-foreground mt-1 text-xs">Planned in {monthTitle}</div>
              </div>
              <Badge variant="outline" className="bg-white text-amber-700">
                {getIncludedBudgetCountLabel(weeklyIncludedCount, weeklyBudgets.length)}
              </Badge>
            </div>
            <div className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              {formatMoney(weeklyTotal)} {currency.sign}
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="size-8" />
          </div>
        ) : (
          budgetList
        )}
      </div>
    </div>
  );
};

export default Container;
