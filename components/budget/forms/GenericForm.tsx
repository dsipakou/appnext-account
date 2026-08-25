import { Repeat } from "lucide-react";
import React, { useMemo, useRef } from "react";

import type { FormValues } from "@/components/budget/types";

import { CategoryType } from "@/components/categories/types";
import { Currency } from "@/components/currencies/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { AmountInput } from "@/components/ui/currency-input";
import * as Dlg from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form, type FormErrors } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as Slc from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem, ToggleGroupSeparator } from "@/components/ui/toggle-group";
import { User } from "@/components/users/types";
import { useCategories } from "@/hooks/categories";
import { useCurrencies } from "@/hooks/currencies";
import { useUsers } from "@/hooks/users";
import { cn } from "@/lib/utils";

interface GenericFormProps {
  values: FormValues;
  setValues: React.Dispatch<React.SetStateAction<FormValues>>;
  errors: FormErrors;
  isLoading: boolean;
  isSomeDay: boolean;
  setIsSomeDay: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void;
}

const GenericForm: React.FC<GenericFormProps> = ({
  values,
  setValues,
  errors,
  isLoading,
  isSomeDay,
  setIsSomeDay,
  onSubmit,
}) => {
  const titleInputRef = useRef<HTMLInputElement>(null);

  const { data: users = [], isLoading: isUsersLoading } = useUsers();
  const { data: categories = [] } = useCategories();
  const { data: currencies = [] } = useCurrencies();

  const parentList = useMemo(
    () =>
      categories.filter(
        (category) => category.parent === null && category.type === CategoryType.Expense,
      ),
    [categories],
  );

  const getCurrencySign = (): string => {
    return currencies.find((item: Currency) => item.uuid === values.currency)?.sign || "";
  };

  return (
    <Form errors={errors} onSubmit={onSubmit} className="contents">
      <Dlg.DialogPanel>
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-7 flex flex-col gap-2">
            <div className="grid gap-2">
              <div className="flex flex-col gap-2">
                <Field name="title">
                  <FieldLabel className="pl-1">Budget title</FieldLabel>
                  <Input
                    ref={titleInputRef}
                    placeholder="Title"
                    disabled={isLoading}
                    id="title"
                    value={values.title}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                  />
                  <FieldError />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-2">
                  <Field name="amount">
                    <FieldLabel className="pl-1">Amount</FieldLabel>

                    <div className="flex gap-2">
                      <div>
                        <AmountInput
                          value={values.amount}
                          onAccept={(value) =>
                            setValues((current) => ({
                              ...current,
                              amount: Number(value) || 0,
                            }))
                          }
                          onFocus={(event) =>
                            requestAnimationFrame(() => {
                              event.target.select();
                            })
                          }
                          id="amount"
                          disabled={isLoading}
                        />
                      </div>

                      <span className="flex items-center text-sm">
                        {values.currency && getCurrencySign()}
                      </span>
                    </div>

                    <FieldError />
                  </Field>
                </div>

                <div className="flex flex-col gap-2">
                  <Field name="currency">
                    <FieldLabel className="pl-1">Currency</FieldLabel>

                    <Slc.Select
                      disabled={isLoading}
                      onValueChange={(currency) =>
                        setValues((current) => ({
                          ...current,
                          currency,
                        }))
                      }
                      value={values.currency || ""}
                      items={currencies.map((item: Currency) => ({
                        label: item.code,
                        value: item.uuid,
                      }))}
                    >
                      <Slc.SelectTrigger className="relative w-full" id="currency">
                        <Slc.SelectValue placeholder="Select a currency" />
                      </Slc.SelectTrigger>

                      <Slc.SelectPopup>
                        <Slc.SelectGroup>
                          <Slc.SelectGroupLabel>Currencies</Slc.SelectGroupLabel>

                          {currencies.map((item: Currency) => (
                            <Slc.SelectItem key={item.uuid} value={item.uuid}>
                              {item.code}
                            </Slc.SelectItem>
                          ))}
                        </Slc.SelectGroup>
                      </Slc.SelectPopup>
                    </Slc.Select>

                    <FieldError />
                  </Field>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Field name="category">
                  <FieldLabel className="pl-1">Category</FieldLabel>

                  <Slc.Select
                    disabled={isLoading}
                    onValueChange={(category) =>
                      setValues((current) => ({
                        ...current,
                        category,
                      }))
                    }
                    value={values.category || ""}
                    items={parentList.map((item) => ({
                      label: item.icon + "  " + item.name,
                      value: item.uuid,
                    }))}
                  >
                    <Slc.SelectTrigger className="relative w-full" id="category">
                      <Slc.SelectValue placeholder="Select category" />
                    </Slc.SelectTrigger>

                    <Slc.SelectPopup>
                      <Slc.SelectGroup>
                        <Slc.SelectGroupLabel>Categories</Slc.SelectGroupLabel>

                        {parentList.map((item) => (
                          <Slc.SelectItem
                            key={item.uuid}
                            value={item.uuid}
                            className="flex items-center"
                          >
                            <span className="mr-2">{item.icon}</span>
                            <span>{item.name}</span>
                          </Slc.SelectItem>
                        ))}
                      </Slc.SelectGroup>
                    </Slc.SelectPopup>
                  </Slc.Select>

                  <FieldError />
                </Field>
              </div>

              <div className="flex flex-col gap-2">
                <Field disabled={isUsersLoading} name="user">
                  <FieldLabel className="pl-1">User</FieldLabel>

                  <Slc.Select
                    disabled={isLoading}
                    onValueChange={(user) =>
                      setValues((current) => ({
                        ...current,
                        user,
                      }))
                    }
                    value={values.user || ""}
                    items={users.map((item: User) => ({
                      label: item.username,
                      value: item.uuid,
                    }))}
                  >
                    <Slc.SelectTrigger className="relative w-full" id="user">
                      <Slc.SelectValue placeholder="Select user" />
                    </Slc.SelectTrigger>

                    <Slc.SelectPopup>
                      <Slc.SelectGroup>
                        <Slc.SelectGroupLabel>Budget owner</Slc.SelectGroupLabel>

                        {users.map((item: User) => (
                          <Slc.SelectItem key={item.uuid} value={item.uuid}>
                            {item.username}
                          </Slc.SelectItem>
                        ))}
                      </Slc.SelectGroup>
                    </Slc.SelectPopup>
                  </Slc.Select>

                  <FieldError />
                </Field>
              </div>

              <div className="flex flex-col gap-2">
                <Field name="repeatType">
                  <FieldLabel className="pl-1">Repeat</FieldLabel>

                  <ToggleGroup
                    id="repeat"
                    className="w-full"
                    value={values.repeatType ? [values.repeatType] : ["__none__"]}
                    onValueChange={(selectedValues) => {
                      const repeatType = selectedValues[0] ?? "__none__";

                      setValues((current) => ({
                        ...current,
                        repeatType:
                          repeatType === "__none__" ? "" : (repeatType as FormValues["repeatType"]),
                      }));
                    }}
                    variant="outline"
                  >
                    <ToggleGroupItem className="w-1/3" value="__none__">
                      <span className="px-2">One-time budget</span>
                    </ToggleGroupItem>

                    <ToggleGroupSeparator />

                    <ToggleGroupItem className="w-1/3" value="weekly">
                      <div className="mx-2 flex items-center gap-3">
                        <Repeat className="h-4 w-4" />
                        <span>Weekly</span>
                      </div>
                    </ToggleGroupItem>

                    <ToggleGroupSeparator />

                    <ToggleGroupItem className="w-1/3" value="monthly">
                      <div className="mx-2 flex items-center gap-3">
                        <Repeat className="h-4 w-4" />
                        <span>Monthly</span>
                      </div>
                    </ToggleGroupItem>
                  </ToggleGroup>

                  <FieldError />
                </Field>
              </div>

              <div>
                {(values.repeatType === "weekly" || values.repeatType === "monthly") && (
                  <Field name="numberOfRepetitions">
                    <FieldLabel className="text-muted-foreground text-sm">
                      Number of repetitions (leave empty for infinite)
                    </FieldLabel>

                    <Input
                      type="number"
                      min="1"
                      placeholder="Infinite"
                      disabled={isLoading}
                      value={values.numberOfRepetitions ?? ""}
                      onChange={(event) => {
                        const repetitions = event.target.value;

                        setValues((current) => ({
                          ...current,
                          numberOfRepetitions:
                            repetitions === "" ? undefined : parseInt(repetitions, 10),
                        }));
                      }}
                    />

                    <FieldError />
                  </Field>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Field name="description">
                <FieldLabel className="pl-1">Description (optional)</FieldLabel>

                <Textarea
                  id="description"
                  disabled={isLoading}
                  placeholder="Add description if you want"
                  className="h-full resize-none"
                  value={values.description ?? ""}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />

                <FieldError />
              </Field>
            </div>
          </div>

          <div className="col-span-5 h-full items-center justify-center">
            <div className="items-top flex h-full justify-center gap-2">
              <div className="h-full">
                <Separator orientation="vertical" className="h-full" />
              </div>

              <div>
                <Field name="budgetDate" className="flex justify-center">
                  <Calendar
                    mode="single"
                    className={cn("justify-center", isSomeDay && "blur-xs")}
                    selected={isSomeDay ? undefined : values.budgetDate}
                    onSelect={(budgetDate) =>
                      budgetDate &&
                      setValues((current) => ({
                        ...current,
                        budgetDate,
                      }))
                    }
                    disabled={(calendarDate) =>
                      isLoading || calendarDate < new Date("1900-01-01") || isSomeDay
                    }
                    weekStartsOn={1}
                  />

                  <FieldError />
                </Field>

                <div className="mt-5 flex items-start gap-2">
                  <Field name="isSomeday">
                    <div className="flex items-center gap-2">
                      <Switch id="isSomeday" checked={isSomeDay} onCheckedChange={setIsSomeDay} />

                      <Label htmlFor="isSomeday">Save without date</Label>
                    </div>
                  </Field>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Dlg.DialogPanel>

      <Dlg.DialogFooter>
        <Dlg.DialogClose render={<Button variant="ghost" />}>Cancel</Dlg.DialogClose>

        <Button type="submit" disabled={isLoading}>
          Submit
        </Button>
      </Dlg.DialogFooter>
    </Form>
  );
};

export default React.memo(GenericForm);
