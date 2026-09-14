import type { Dispatch, ReactElement, SetStateAction, SubmitEvent } from "react";

import type { Category } from "@/components/categories/types";
import type { Currency } from "@/components/currencies/types";
import type { FormErrors } from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import * as Dlg from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import * as Slc from "@/components/ui/select";

export type CreateBudgetFormValues = {
  title: string;
  amount: number | string;
  currency: string;
  category: string;
  user: string;
  budgetDate: string;
};

type Props = {
  values: CreateBudgetFormValues;
  errors: FormErrors;
  parentCategories: Category[];
  currencies: Currency[];
  isCreating: boolean;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => Promise<void>;
  setValues: Dispatch<SetStateAction<CreateBudgetFormValues>>;
};

export function CreateBudgetForm({
  values,
  errors,
  parentCategories,
  currencies,
  isCreating,
  onSubmit,
  setValues,
}: Props): ReactElement {
  return (
    <Form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      errors={errors}
      className="contents"
    >
      <Dlg.DialogPanel>
        <div className="grid gap-2">
          <Field name="title">
            <FieldLabel>Title</FieldLabel>
            <Input
              id="title"
              value={values.title}
              onChange={(e) => setValues((current) => ({ ...current, title: e.target.value }))}
              placeholder="Budget title"
              disabled={isCreating}
            />
            <FieldError />
          </Field>
        </div>
        <div className="grid gap-2">
          <Field>
            <FieldLabel htmlFor="amount">Amount</FieldLabel>
            <Input
              id="amount"
              type="number"
              value={values.amount}
              onChange={(e) => setValues((current) => ({ ...current, amount: e.target.value }))}
              placeholder="0"
              disabled={isCreating}
            />
            <FieldError />
          </Field>
        </div>
        <div className="grid gap-2">
          <Field>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <Slc.Select
              value={values.category}
              onValueChange={(category) =>
                setValues((current) => ({ ...current, category: category ?? "" }))
              }
              disabled={isCreating}
              items={parentCategories.map((item: Category) => ({
                label: `${item.icon} ${item.name}`,
                value: item.uuid,
              }))}
            >
              <Slc.SelectTrigger>
                <Slc.SelectValue placeholder="Select category" />
              </Slc.SelectTrigger>
              <Slc.SelectPopup>
                <Slc.SelectGroup>
                  {parentCategories.map((item: Category) => (
                    <Slc.SelectItem key={item.uuid} value={item.uuid}>
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.name}
                    </Slc.SelectItem>
                  ))}
                </Slc.SelectGroup>
              </Slc.SelectPopup>
            </Slc.Select>
            <FieldError />
          </Field>
        </div>
        <div className="grid gap-2">
          <Field>
            <FieldLabel htmlFor="currency">Currency</FieldLabel>
            <Slc.Select
              value={values.currency}
              onValueChange={(currency) =>
                setValues((current) => ({ ...current, currency: currency ?? "" }))
              }
              disabled={isCreating}
              items={currencies.map((item: Currency) => ({
                label: `${item.code} (${item.sign})`,
                value: item.uuid,
              }))}
            >
              <Slc.SelectTrigger>
                <Slc.SelectValue placeholder="Select currency" />
              </Slc.SelectTrigger>
              <Slc.SelectPopup>
                <Slc.SelectGroup>
                  {currencies.map((item: Currency) => (
                    <Slc.SelectItem key={item.uuid} value={item.uuid}>
                      {item.code} ({item.sign})
                    </Slc.SelectItem>
                  ))}
                </Slc.SelectGroup>
              </Slc.SelectPopup>
            </Slc.Select>
            <FieldError />
          </Field>
        </div>
      </Dlg.DialogPanel>
      <Dlg.DialogFooter>
        <Dlg.DialogClose render={<Button variant="ghost" />}>Cancel</Dlg.DialogClose>
        <Button type="submit" disabled={isCreating}>
          {isCreating ? "Creating..." : "Create Budget"}
        </Button>
      </Dlg.DialogFooter>
    </Form>
  );
}
