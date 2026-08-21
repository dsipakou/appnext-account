export type RecurrentTypes = "monthly" | "weekly";

export type CurrencyMap = {
  [key: string]: number;
};

export type PlannedMap = {
  planned: number;
  plannedInCurrencies: CurrencyMap;
};

export type SpentMap = {
  spentInBaseCurrency: number;
  spentInCurrencies: CurrencyMap;
  spentInOriginalCurrency: number;
};

export type GroupedByCategoryBudget = {
  uuid: string;
  categoryName: string;
  budgets: MonthGroupedBudgetItem[];
} & PlannedMap &
  SpentMap;

export type MonthGroupedBudgetItem = {
  uuid: string;
  title: string;
  items: MonthBudgetItem[];
  planned: number;
  spent: number;
  isAnotherCategory: boolean;
  isAnotherMonth: boolean;
  spentInCurrencies: CurrencyMap;
  spentInCurrenciesOverall: CurrencyMap;
  plannedInCurrencies: CurrencyMap;
};

export type MonthBudgetItem = {
  uuid: string;
  title: string;
  category: string;
  user: string;
  transactions: TransactionItem[];
  budgetDate: string;
  currency: string;
  description: string;
  recurrent: RecurrentTypes;
  numberOfRepetitions?: number | null;
  isCompleted: boolean;
  createdAt: string;
  modifiedAt: string;
} & PlannedMap &
  SpentMap;

export type WeekBudgetItem = {
  uuid: string;
  title: string;
  user: string;
  category: string;
  currency: string;
  transactions: TransactionItem[];
  recurrent: RecurrentTypes;
  numberOfRepetitions?: number | null;
  description: string;
  isCompleted: boolean;
  budgetDate: string;
  createdAt: string;
  modifiedAt: string;
} & PlannedMap &
  SpentMap;

export type WeekBudgetResponse = {
  data: WeekBudgetItem[];
  isLoading: boolean;
};

export type CompactWeekItem = {
  uuid: string;
  title: string;
  user: string;
  amount: number;
  category: string;
  currency: string;
  planned: number;
  spent: number;
  recurrent: RecurrentTypes;
  numberOfRepetitions?: number | null;
  isCompleted: boolean;
  budgetDate: string;
};

export type TransactionItem = {
  uuid: string;
  currency: string;
  currencyCode: string;
  transactionDate: string;
} & SpentMap;

export type BudgetItem = {
  title: string;
  amount: string;
  currency: string;
  user: string;
  category: string;
  recurrent: RecurrentTypes;
  numberOfRepetitions?: number | null;
  budgetDate: string;
  description: string;
  isCompleted: boolean;
};

export type MonthSummedUsage = {
  month: string;
  amount: number;
};
