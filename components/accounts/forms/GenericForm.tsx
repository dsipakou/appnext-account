import * as React from "react";

import { Category } from "@/components/categories/types";
import { Button } from "@/components/ui/button";
import * as Dlg from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form, type FormErrors } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as Slc from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import * as Tgl from "@/components/ui/toggle-group";
import { User } from "@/components/users/types";
import { cn } from "@/lib/utils";

export type GenericFormValues = {
  kind: "savings" | "spending";
  title: string;
  user: string;
  category: string;
  description: string;
};

interface Props {
  values: GenericFormValues;
  errors: FormErrors;
  users: User[];
  incomeCategories: Category[];
  isSubmitting: boolean;
  onChange: React.Dispatch<React.SetStateAction<GenericFormValues>>;
  onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void;
}

const GenericForm: React.FC<Props> = ({
  values,
  errors,
  users,
  incomeCategories,
  isSubmitting,
  onChange,
  onSubmit,
}) => {
  const hasIncomeCategory = Boolean(values.category);

  return (
    <Form errors={errors} onSubmit={onSubmit} className="contents">
      <Dlg.DialogPanel>
        <div className="grid gap-4">
          <Field name="kind">
            <FieldLabel>Account type</FieldLabel>

            <Tgl.ToggleGroup
              className="w-full"
              value={[values.kind]}
              onValueChange={(selectedValues) => {
                const kind = selectedValues[0];

                if (!kind) {
                  return;
                }

                onChange((current) => ({
                  ...current,
                  kind: kind as GenericFormValues["kind"],
                }));
              }}
              disabled={isSubmitting}
              variant="outline"
            >
              <Tgl.ToggleGroupItem className="w-1/2" value="savings">
                <span className="px-2">Savings account</span>
              </Tgl.ToggleGroupItem>

              <Tgl.ToggleGroupSeparator />

              <Tgl.ToggleGroupItem className="w-1/2" value="spending">
                <span className="px-2">Spending account</span>
              </Tgl.ToggleGroupItem>
            </Tgl.ToggleGroup>

            <FieldError />
          </Field>

          <div className="flex w-full flex-row gap-2">
            <div className="flex flex-2/3 items-center gap-2">
              <Field name="title" className="w-full">
                <FieldLabel>Account title</FieldLabel>

                <Input
                  disabled={isSubmitting}
                  id="title"
                  value={values.title}
                  onChange={(event) =>
                    onChange((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />

                <FieldError />
              </Field>
            </div>

            <div className="flex flex-1/3 items-center gap-2">
              <Field name="user" className="w-full">
                <FieldLabel>User</FieldLabel>

                <Slc.Select
                  onValueChange={(user) =>
                    onChange((current) => ({
                      ...current,
                      user,
                    }))
                  }
                  value={values.user || ""}
                  disabled={isSubmitting}
                  items={users.map((item) => ({
                    label: item.username,
                    value: item.uuid,
                  }))}
                >
                  <Slc.SelectTrigger className="relative w-full">
                    <Slc.SelectValue placeholder="Select user" />
                  </Slc.SelectTrigger>

                  <Slc.SelectPopup>
                    <Slc.SelectGroup>
                      {users.map((item) => (
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
          </div>

          <Field name="category">
            <div className="flex w-full flex-row">
              <div className="flex flex-1 items-center gap-2">
                <Label>With regular income</Label>

                <Switch
                  checked={hasIncomeCategory}
                  onCheckedChange={(checked) =>
                    onChange((current) => ({
                      ...current,
                      category: checked ? (incomeCategories[0]?.uuid ?? "") : "",
                    }))
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className={cn("flex w-full flex-1", !hasIncomeCategory && "hidden")}>
                <Slc.Select
                  onValueChange={(category) =>
                    onChange((current) => ({
                      ...current,
                      category: category === "none" ? "" : category,
                    }))
                  }
                  value={values.category || incomeCategories[0]?.uuid || ""}
                  disabled={isSubmitting}
                  items={incomeCategories.map((item) => ({
                    label: item.name,
                    value: item.uuid,
                  }))}
                >
                  <Slc.SelectTrigger className="relative w-full">
                    <Slc.SelectValue />
                  </Slc.SelectTrigger>

                  <Slc.SelectPopup>
                    <Slc.SelectGroup>
                      {incomeCategories.map((item) => (
                        <Slc.SelectItem key={item.uuid} value={item.uuid}>
                          {item.name}
                        </Slc.SelectItem>
                      ))}
                    </Slc.SelectGroup>
                  </Slc.SelectPopup>
                </Slc.Select>
              </div>
            </div>

            <FieldError />
          </Field>

          <Field name="description">
            <Textarea
              placeholder="Add description if you want"
              className="resize-none"
              disabled={isSubmitting}
              value={values.description}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />

            <FieldError />
          </Field>
        </div>
      </Dlg.DialogPanel>

      <Dlg.DialogFooter>
        <Dlg.DialogClose render={<Button variant="ghost" />}>Cancel</Dlg.DialogClose>

        <Button disabled={isSubmitting} type="submit">
          Save
        </Button>
      </Dlg.DialogFooter>
    </Form>
  );
};

export default GenericForm;
