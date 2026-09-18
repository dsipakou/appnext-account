import type { FC } from "react";

import { addMonths } from "date-fns";
import { Calendar, Repeat } from "lucide-react";
import { useMemo, useState } from "react";

import type {
  GroupedByCategoryBudget,
  MonthGroupedBudgetItem,
  RecurrentTypes,
} from "@/components/budget/types";

import { useStore } from "@/app/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useBudgetMonth } from "@/hooks/budget";
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
  categoryName: string;
  recurrent: RecurrentTypes;
  plannedAmount: number;
  dates: string[];
  occurrences: number;
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
      const budgetKey = `${item.title}-${recurrent}`;
      const existingBudget = recurrentBudgets.get(budgetKey);
      const dates = recurrentItems.map((budgetItem) => budgetItem.budgetDate);
      const plannedAmount = getBudgetPlannedAmount(item, currency);
      const isActualOnlyBudget = item.isAnotherCategory || item.isAnotherMonth;

      if (!existingBudget) {
        recurrentBudgets.set(budgetKey, {
          uuid: item.uuid,
          title: item.title,
          categoryName: isActualOnlyBudget ? "" : category.categoryName,
          recurrent,
          plannedAmount: isActualOnlyBudget ? 0 : plannedAmount,
          dates,
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
}> = ({ budget, currencySign }) => {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-slate-900">{budget.title}</div>
          <div className="text-muted-foreground text-sm">{budget.categoryName}</div>
        </div>
        <Badge variant={budget.recurrent === "monthly" ? "default" : "secondary"}>
          {budget.recurrent}
        </Badge>
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
    </div>
  );
};

const Container: FC<Types> = ({ user }) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const currency = useStore((state) => state.currency);
  const startDate = getStartOfMonth(selectedMonth);
  const endDate = getEndOfMonth(selectedMonth);
  const { data: budget = [], isLoading } = useBudgetMonth(startDate, endDate, user);

  const { monthlyBudgets, weeklyBudgets, monthlyTotal, weeklyTotal } = useMemo(() => {
    const recurrentBudgets = getRecurrentBudgets(budget, currency.code);
    const monthlyBudgets = recurrentBudgets.filter((item) => item.recurrent === "monthly");
    const weeklyBudgets = recurrentBudgets.filter((item) => item.recurrent === "weekly");

    return {
      monthlyBudgets,
      weeklyBudgets,
      monthlyTotal: monthlyBudgets.reduce((acc, item) => acc + item.plannedAmount, 0),
      weeklyTotal: weeklyBudgets.reduce((acc, item) => acc + item.plannedAmount, 0),
    };
  }, [budget, currency.code]);

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
            monthlyBudgets.map((budget) => (
              <RecurrentBudgetCard
                key={`${budget.uuid}-${budget.dates.join("-")}`}
                budget={budget}
                currencySign={currency.sign}
              />
            ))
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
            weeklyBudgets.map((budget) => (
              <RecurrentBudgetCard
                key={`${budget.uuid}-${budget.dates.join("-")}`}
                budget={budget}
                currencySign={currency.sign}
              />
            ))
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
                {getBudgetCountLabel(monthlyBudgets.length)}
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
                {getBudgetCountLabel(weeklyBudgets.length)}
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
