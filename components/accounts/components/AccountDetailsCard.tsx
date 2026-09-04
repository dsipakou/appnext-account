import { ArrowDownRight, ArrowUpRight, DollarSign } from "lucide-react";
import React from "react";

import { useStore } from "@/app/store";
import { ProgressBar } from "@/components/accounts/components/ProgressBar";
import { cn } from "@/lib/utils";
import { getFormattedDate } from "@/utils/dateUtils";

type AccountDetailsCardProps = {
  month: string;
  income: number;
  spendings: number;
};

const getMonthStatusLabel = (
  hasIncome: boolean,
  hasExpenses: boolean,
  netAmount: number,
): string => {
  if (!hasIncome && !hasExpenses) {
    return "No activity";
  }

  if (netAmount > 0) {
    return "Saved";
  }

  if (netAmount < 0) {
    return "Overspent";
  }

  return "Balanced";
};

const AccountDetailsCard: React.FC<AccountDetailsCardProps> = ({ month, income, spendings }) => {
  const formattedMonth = getFormattedDate(new Date(month), "yyyy MMM");
  const hasIncome = income > 0;
  const hasExpenses = spendings > 0;
  const spendingRatio = hasIncome ? (spendings / income) * 100 : Number(hasExpenses) * 100;
  const savingsRatio = hasIncome ? Math.max(100 - spendingRatio, 0) : 0;
  const netAmount = income - spendings;
  const currencySign = useStore((state) => state.currency.sign);
  const formatMoney = (value: number) => `${value.toFixed(2)} ${currencySign}`;
  const statusLabel = getMonthStatusLabel(hasIncome, hasExpenses, netAmount);

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-linear-to-br from-white via-white to-slate-50 p-6 shadow-sm ring-1 ring-slate-200/70">
      <div className="pointer-events-none absolute -top-20 -right-14 size-32 rounded-full bg-cyan-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-8 size-28 rounded-full bg-violet-200/60 blur-3xl" />

      <div className="relative mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{formattedMonth}</p>
          <div
            className={cn(
              "mt-2 text-3xl font-semibold tracking-tight",
              netAmount > 0 && "text-emerald-600",
              netAmount < 0 && "text-red-500",
              netAmount === 0 && "text-slate-950",
            )}
          >
            {formatMoney(netAmount)}
          </div>
          <p className="mt-1 text-sm text-slate-500">Net savings this month</p>
        </div>

        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium ring-1",
            netAmount > 0 && "bg-emerald-50 text-emerald-700 ring-emerald-200",
            netAmount < 0 && "bg-red-50 text-red-700 ring-red-200",
            netAmount === 0 && "bg-slate-100 text-slate-600 ring-slate-200",
          )}
        >
          {statusLabel}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-emerald-50/80 p-4 ring-1 ring-emerald-100">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-full bg-white p-2 text-emerald-600 shadow-sm">
                <ArrowUpRight className="size-4" />
              </div>
              <span className="text-sm font-medium text-emerald-700">Income</span>
            </div>
            {hasIncome ? (
              <p className="text-sm font-semibold text-slate-950">{formatMoney(income)}</p>
            ) : (
              <p className="text-sm font-medium text-slate-400">No income</p>
            )}
          </div>

          <div className="rounded-2xl bg-red-50/80 p-4 ring-1 ring-red-100">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-full bg-white p-2 text-red-600 shadow-sm">
                <ArrowDownRight className="size-4" />
              </div>
              <span className="text-sm font-medium text-red-700">Expenses</span>
            </div>
            {hasExpenses ? (
              <p className="text-sm font-semibold text-slate-950">{formatMoney(spendings)}</p>
            ) : (
              <p className="text-sm font-medium text-slate-400">No expenses</p>
            )}
          </div>
        </div>

        {(hasIncome || hasExpenses) && (
          <div className="mt-6 space-y-4">
            <ProgressBar
              value={spendings}
              maxValue={hasIncome ? income : spendings}
              colorClass={hasIncome ? "bg-red-500" : "bg-gray-500"}
              label="Spending Rate"
            />
            {hasIncome && (
              <ProgressBar
                value={Math.max(income - spendings, 0)}
                maxValue={income}
                colorClass="bg-green-500"
                label="Savings Rate"
              />
            )}
          </div>
        )}

        <div className="mt-auto pt-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-600">
            <div className="rounded-full bg-sky-50 p-2 text-sky-600 ring-1 ring-sky-100">
              <DollarSign className="size-4" />
            </div>
            <span>Monthly Stats</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-slate-100/70 p-4 ring-1 ring-slate-200/70">
              <p className="text-xs text-slate-500">Spending Ratio</p>
              {hasIncome || hasExpenses ? (
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {spendingRatio.toFixed(1)}%
                </p>
              ) : (
                <p className="mt-1 text-lg font-semibold text-slate-400">-</p>
              )}
            </div>
            <div className="rounded-2xl bg-slate-100/70 p-4 ring-1 ring-slate-200/70">
              <p className="text-xs text-slate-500">Savings Ratio</p>
              {hasIncome ? (
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {savingsRatio.toFixed(1)}%
                </p>
              ) : (
                <p className="mt-1 text-lg font-semibold text-slate-400">-</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailsCard;
