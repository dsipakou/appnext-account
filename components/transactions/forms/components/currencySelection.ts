import type { Currency } from "@/components/currencies/types";
import type { AvailableRate } from "@/components/rates/types";

type PreselectedCurrencyParams = {
  value: string;
  rowCurrency: string;
  isSaved: boolean;
  isLoading: boolean;
  baseCurrency: Currency | undefined;
  budgetCurrency: Currency | undefined;
  defaultCurrency: Currency | undefined;
  availableRates: AvailableRate[];
};

const isCurrencyAvailable = (
  currency: Currency | undefined,
  availableRates: AvailableRate[],
): boolean =>
  Boolean(currency) &&
  (Boolean(currency?.isBase) ||
    availableRates.some((rate) => rate.currencyCode === currency?.code));

export const getPreselectedCurrency = ({
  value,
  rowCurrency,
  isSaved,
  isLoading,
  baseCurrency,
  budgetCurrency,
  defaultCurrency,
  availableRates,
}: PreselectedCurrencyParams): string | undefined => {
  if (value) {
    return value;
  }
  if (isSaved) {
    return rowCurrency;
  }
  if (isLoading || !baseCurrency) {
    return;
  }
  if (isCurrencyAvailable(budgetCurrency, availableRates)) {
    return budgetCurrency?.uuid;
  }
  if (isCurrencyAvailable(defaultCurrency, availableRates)) {
    return defaultCurrency?.uuid;
  }
  return baseCurrency.uuid;
};

export const getCurrencyAvailability = (
  currencies: Currency[],
  availableRates: AvailableRate[],
  formattedDate: string,
): {
  activeCurrencies: Currency[];
  outdatedCurrencies: Currency[];
  unavailableCurrencies: Currency[];
} => {
  const ratesByCode = new Map(availableRates.map((rate) => [rate.currencyCode, rate]));
  const activeCurrencies: Currency[] = [];
  const outdatedCurrencies: Currency[] = [];
  const unavailableCurrencies: Currency[] = [];

  for (const currency of currencies) {
    const rate = ratesByCode.get(currency.code);

    if (currency.isBase || rate?.rateDate === formattedDate) {
      activeCurrencies.push(currency);
    } else if (!rate) {
      unavailableCurrencies.push(currency);
    } else {
      outdatedCurrencies.push(currency);
    }
  }

  return { activeCurrencies, outdatedCurrencies, unavailableCurrencies };
};
