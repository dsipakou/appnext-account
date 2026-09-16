import { describe, expect, it } from "vitest";

import { isSelectedBudgetUnavailable } from "./budgetSelection";

describe("isSelectedBudgetUnavailable", () => {
  it("keeps a preselected budget until an account owner is known", () => {
    expect(isSelectedBudgetUnavailable(undefined, "budget-1", false, [])).toBe(false);
  });

  it("rejects a budget that does not belong to the selected account owner", () => {
    expect(isSelectedBudgetUnavailable("user-1", "budget-1", false, [])).toBe(true);
  });
});
