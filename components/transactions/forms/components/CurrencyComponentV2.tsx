import { Clock2 } from "lucide-react";
import React from "react";

// Types
import { WeekBudgetItem } from "@/components/budget/types";
import { Currency } from "@/components/currencies/types";
import { RowData } from "@/components/transactions/components/transactionTable";
// UI
import * as Slc from "@/components/ui/select";
// Hooks
import { useBudgetWeek } from "@/hooks/budget";
import { useCurrencies } from "@/hooks/currencies";
import { useAvailableRates } from "@/hooks/rates";
// Utils
import { cn } from "@/lib/utils";
import { getEndOfWeek, getFormattedDate, getStartOfWeek } from "@/utils/dateUtils";

import { getCurrencyAvailability, getPreselectedCurrency } from "./currencySelection";

type Props = {
  user: string;
  value: string;
  row: RowData;
  isSaved: boolean;
  handleChange: (id: number, key: string, value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent, id: number) => void;
};

export default function CurrencyComponent({
  user,
  value,
  row,
  isSaved,
  handleChange,
  handleKeyDown,
}: Props) {
  const [selectedDate, setSelectedDate] = React.useState<Date>(row.date || new Date());
  const [weekStart, setWeekStart] = React.useState<string>(getStartOfWeek(row.date || new Date()));
  const [weekEnd, setWeekEnd] = React.useState<string>(getEndOfWeek(row.date || new Date()));

  const { data: budgets = [], isLoading: isBudgetsLoading } = useBudgetWeek(weekStart, weekEnd);
  const { data: currencies = [], isLoading: isCurrenciesLoading } = useCurrencies();
  const { data: availableRates = [], isLoading: isRatesLoading } = useAvailableRates(
    getFormattedDate(selectedDate),
  );

  const baseCurrency = currencies.find((item: Currency) => item.isBase);

  const selectedBudget = budgets.find((item: WeekBudgetItem) => item.uuid === row.budget);
  const budgetCurrency = selectedBudget
    ? currencies.find((item: Currency) => item.uuid === selectedBudget.currency)
    : undefined;
  const formattedDate = React.useMemo(() => getFormattedDate(row.date || new Date()), [row.date]);
  const { activeCurrencies, outdatedCurrencies, unavailableCurrencies } = React.useMemo(
    () => getCurrencyAvailability(currencies, availableRates, formattedDate),
    [availableRates, currencies, formattedDate],
  );

  const defaultCurrency = currencies.find((item: Currency) => item.isDefault);

  React.useEffect(() => {
    setSelectedDate(row.date);
    setWeekStart(getStartOfWeek(row.date));
    setWeekEnd(getEndOfWeek(row.date));
  }, [row.date]);

  React.useEffect(() => {
    const preselectedValue = getPreselectedCurrency({
      value,
      rowCurrency: row.currency,
      isSaved,
      isLoading: isRatesLoading || isCurrenciesLoading || isBudgetsLoading,
      baseCurrency,
      budgetCurrency,
      defaultCurrency,
      availableRates,
    });

    if (preselectedValue && preselectedValue !== value) {
      handleChange(row.id, "currency", preselectedValue);
    }
  }, [
    availableRates,
    baseCurrency,
    budgetCurrency,
    defaultCurrency,
    handleChange,
    isBudgetsLoading,
    isCurrenciesLoading,
    isRatesLoading,
    isSaved,
    row.currency,
    row.id,
    value,
  ]);

  return (
    <Slc.Select
      value={value as string}
      onValueChange={(value) => handleChange(row.id, "currency", value)}
      onOpenChange={(open) => {
        if (!open) {
          (document.activeElement as HTMLElement)?.blur();
        }
      }}
      disabled={isRatesLoading || isCurrenciesLoading || isBudgetsLoading}
      items={currencies.map((item: Currency) => ({ value: item.uuid, label: item.code }))}
    >
      <Slc.SelectTrigger
        className={cn(
          "bg-background h-8 w-24 min-w-20 border-0 px-2 text-left text-sm",
          "focus:border-primary focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-blue-700 focus-visible:outline-none",
        )}
        onKeyDown={(e) => handleKeyDown(e, row.id)}
      >
        <Slc.SelectValue />
      </Slc.SelectTrigger>
      <Slc.SelectPopup>
        {!!activeCurrencies.length && (
          <>
            <Slc.SelectGroup>
              <Slc.SelectGroupLabel>Active</Slc.SelectGroupLabel>
              {activeCurrencies.map((item: Currency) => (
                <Slc.SelectItem key={item.uuid} value={item.uuid}>
                  {item.code}
                </Slc.SelectItem>
              ))}
            </Slc.SelectGroup>
            <Slc.SelectSeparator />
          </>
        )}
        {!!outdatedCurrencies.length && (
          <Slc.SelectGroup>
            <Slc.SelectGroupLabel>Outdated</Slc.SelectGroupLabel>
            {outdatedCurrencies.map((item: Currency) => (
              <Slc.SelectItem className="pr-0 italic" key={item.uuid} value={item.uuid}>
                <div className="flex items-center gap-2">
                  {item.code}
                  <Clock2 className="h-3 w-3" />
                </div>
              </Slc.SelectItem>
            ))}
          </Slc.SelectGroup>
        )}
        {!!unavailableCurrencies.length && (
          <>
            <Slc.SelectSeparator />
            <Slc.SelectGroup>
              <Slc.SelectLabel className="flex justify-start">Unavailable</Slc.SelectLabel>
              {unavailableCurrencies.map((item: Currency) => (
                <Slc.SelectItem key={item.uuid} value={item.uuid} disabled>
                  {item.code}
                </Slc.SelectItem>
              ))}
            </Slc.SelectGroup>
          </>
        )}
      </Slc.SelectPopup>
    </Slc.Select>
  );
}
