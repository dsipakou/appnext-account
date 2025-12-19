import React from 'react';
import { Clock2 } from 'lucide-react';
// UI
import * as Slc from '@/components/ui/select';
// Hooks
import { useBudgetWeek } from '@/hooks/budget';
import { useCurrencies } from '@/hooks/currencies';
import { useAvailableRates } from '@/hooks/rates';
// Types
import { WeekBudgetItem } from '@/components/budget/types';
import { Currency } from '@/components/currencies/types';
import { AvailableRate } from '@/components/rates/types';
import { RowData } from '@/components/transactions/components/transactionTable';
// Utils
import { cn } from '@/lib/utils';
import { getEndOfWeek, getFormattedDate, getStartOfWeek } from '@/utils/dateUtils';

type Props = {
  user: string;
  value: string;
  row: RowData;
  isInvalid: boolean;
  isSaved: boolean;
  handleChange: (id: number, key: string, value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent, id: number) => void;
};

export default function CurrencyComponent({
  user,
  value,
  row,
  isInvalid,
  isSaved,
  handleChange,
  handleKeyDown,
}: Props) {
  const [selectedDate, setSelectedDate] = React.useState<Date>(row.date || new Date());
  const [budgetUuid, setBudgetUuid] = React.useState<string>('');
  const [weekStart, setWeekStart] = React.useState<string>(getStartOfWeek(row.date || new Date()));
  const [weekEnd, setWeekEnd] = React.useState<string>(getEndOfWeek(row.date || new Date()));

  const { data: budgets = [], isLoading: isBudgetsLoading } = useBudgetWeek(weekStart, weekEnd);
  const { data: currencies = [], isLoading: isCurrenciesLoading } = useCurrencies();
  const { data: availableRates = [], isLoading: isRatesLoading } = useAvailableRates(getFormattedDate(selectedDate));

  const baseCurrency = currencies.find((item: Currency) => item.isBase);

  const selectedBudget = budgets.find((item: WeekBudgetItem) => item.uuid === budgetUuid);
  const budgetCurrency = selectedBudget
    ? currencies.find((item: Currency) => item.uuid === selectedBudget.currency)
    : null;
  const isBudgetCurrencyAvailable = budgetCurrency
    ? availableRates.find((item: AvailableRate) => item.currencyCode === budgetCurrency.code)
    : false;
  const activeCurrencies = currencies.filter((item: Currency) => {
    const rate = availableRates.find((rate: AvailableRate) => rate.currencyCode === item.code);
    return rate && (item.isBase || rate.rateDate === getFormattedDate(row.date));
  });
  const outdatedCurrencies = currencies.filter((item: Currency) => {
    const rate = availableRates.find((rate: AvailableRate) => rate.currencyCode === item.code);
    return rate && !(item.isBase || rate.rateDate === getFormattedDate(row.date));
  });
  const unavailableCurrencies = currencies.filter((item: Currency) => {
    const rate = availableRates.find((rate: AvailableRate) => rate.currencyCode === item.code);
    return !rate;
  });

  const defaultCurrency = currencies.find((item: Currency) => item.isDefault);
  const isDefaultCurrencyAvailable = availableRates.find(
    (item: AvailableRate) => item.currencyCode === defaultCurrency?.code
  );

  const preselectedValue = () => {
    if (value) {
      return value;
    }
    if (isSaved) {
      return row.currency;
    }
    // If new user didnt't add any currency yet
    if (!baseCurrency) {
      return;
    }
    if (isBudgetCurrencyAvailable) {
      return budgetCurrency!.uuid;
    }
    if (isDefaultCurrencyAvailable) {
      return defaultCurrency!.uuid;
    }
    return baseCurrency.uuid;
  };

  React.useEffect(() => {
    setSelectedDate(row.date);
    setWeekStart(getStartOfWeek(row.date));
    setWeekEnd(getEndOfWeek(row.date));
  }, [row.date]);

  React.useEffect(() => {
    if (row.budget) {
      setBudgetUuid(row.budget);
    }
  }, [row.budget]);

  React.useEffect(() => {
    handleChange(row.id, 'currency', preselectedValue() as string);
  }, [isBudgetCurrencyAvailable, isDefaultCurrencyAvailable]);

  console.log(row);

  return (
    <Slc.Select
      value={value as string}
      onValueChange={(value) => handleChange(row.id, 'currency', value)}
      onOpenChange={(open) => {
        if (!open) {
          (document.activeElement as HTMLElement)?.blur();
        }
      }}
      disabled={isRatesLoading || isCurrenciesLoading || isBudgetsLoading}
    >
      <Slc.SelectTrigger
        className={cn(
          'w-24 h-8 px-2 text-sm border-0 bg-white text-left',
          'focus:ring-0 focus:outline-none focus:border-primary focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-blue-700',
          isInvalid && 'outline outline-red-400'
        )}
        onKeyDown={(e) => handleKeyDown(e, row.id)}
      >
        <Slc.SelectValue />
      </Slc.SelectTrigger>
      <Slc.SelectContent>
        {!!activeCurrencies.length && (
          <>
            <Slc.SelectGroup>
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
            <Slc.SelectLabel className="flex justify-start">Outdated</Slc.SelectLabel>
            {outdatedCurrencies.map((item: Currency) => (
              <Slc.SelectItem className="italic pr-0" key={item.uuid} value={item.uuid}>
                <div className="flex gap-2 items-center">
                  {item.code}
                  <Clock2 className="w-4 h-4" />
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
      </Slc.SelectContent>
    </Slc.Select>
  );
}
