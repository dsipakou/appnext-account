import { describe, expect, it } from "vitest";

import type { AvailableRate } from "@/components/rates/types";

import { getCurrencyAvailability, getPreselectedCurrency } from "./currencySelection";

const baseCurrency = {
  uuid: "base",
  code: "PLN",
  sign: "zl",
  verbalName: "Zloty",
  isBase: true,
  isDefault: false,
  comments: "",
  createdAt: "",
  modifiedAt: "",
};

const budgetCurrency = {
  uuid: "budget",
  code: "EUR",
  sign: "EUR",
  verbalName: "Euro",
  isBase: false,
  isDefault: false,
  comments: "",
  createdAt: "",
  modifiedAt: "",
};

const rates: AvailableRate[] = [{ currencyCode: "EUR", rate: 4.3, rateDate: "2026-09-15" }];

describe("getPreselectedCurrency", () => {
  it("waits for currencies, budgets, and rates before falling back to the base currency", () => {
    expect(
      getPreselectedCurrency({
        value: "",
        rowCurrency: "",
        isSaved: false,
        isLoading: true,
        baseCurrency,
        budgetCurrency,
        defaultCurrency: undefined,
        availableRates: [],
      }),
    ).toBeUndefined();
  });

  it("prefers the budget currency over the base currency after rates are loaded", () => {
    expect(
      getPreselectedCurrency({
        value: "",
        rowCurrency: "",
        isSaved: false,
        isLoading: false,
        baseCurrency,
        budgetCurrency,
        defaultCurrency: undefined,
        availableRates: rates,
      }),
    ).toBe("budget");
  });
});

describe("getCurrencyAvailability", () => {
  it("keeps the base currency active even when rates are still missing", () => {
    const { activeCurrencies, unavailableCurrencies } = getCurrencyAvailability(
      [baseCurrency, budgetCurrency],
      rates,
      "2026-09-15",
    );

    expect(activeCurrencies.map((currency) => currency.uuid)).toContain("base");
    expect(unavailableCurrencies.map((currency) => currency.uuid)).not.toContain("base");
  });
});
