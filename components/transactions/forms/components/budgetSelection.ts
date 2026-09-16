export const isSelectedBudgetUnavailable = (
  accountUser: string | undefined,
  selectedBudget: string,
  isLoading: boolean,
  budgets: Array<{ uuid: string }>,
): boolean =>
  Boolean(accountUser && selectedBudget && !isLoading) &&
  !budgets.some((budget) => budget.uuid === selectedBudget);
