import React from "react";

// Types
import type { Category } from "@/components/categories/types";
import type { RowData } from "@/components/transactions/components/transactionTable";

// UI
import * as Slc from "@/components/ui/select";
// Utils
import { cn } from "@/lib/utils";

type Props = {
  user: string;
  value: string;
  categories: Category[];
  categoryType: "EXP" | "INC";
  handleChange: (id: number, key: string, value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent, id: number) => void;
  row: RowData;
  isInvalid: boolean;
  defaultOpen?: boolean;
};

const renderIncomeCategory = (category: Category, index: number): React.ReactElement => (
  <Slc.SelectItem
    key={category.uuid}
    value={category.uuid}
    data-parent-id={index === 0 ? category.uuid : undefined}
  >
    {category.icon} {category.name}
  </Slc.SelectItem>
);

export default function CategoryComponent({
  value,
  categories,
  categoryType,
  handleChange,
  handleKeyDown,
  row,
  isInvalid,
  defaultOpen = false,
}: Props): React.ReactElement {
  const [open, setOpen] = React.useState<boolean>(defaultOpen);
  const parents = categories.filter(
    (item: Category) => item.parent === null && item.type === categoryType,
  );
  const selectableCategories = categories.filter((item) =>
    categoryType === "INC"
      ? item.parent === null && item.type === categoryType
      : item.parent !== null,
  );

  React.useEffect(() => {
    if (!open || !value) {
      return;
    }

    requestAnimationFrame(() => {
      const scrollUuid = categories.find((item) => item.uuid === value)?.parent ?? value;

      document.querySelector<HTMLElement>(`[data-parent-id="${scrollUuid}"]`)?.scrollIntoView({
        block: "start",
        behavior: "instant",
      });
    });
  }, [open, value, categories]);

  const onChange = (value: string) => {
    const category = categories.find((item: Category) => item.uuid === value);
    const parent = category
      ? categories.find((item: Category) => item.uuid === category.parent)
      : "";

    handleChange(row.id, "category", value);
    handleChange(row.id, "categoryName", category?.name || "");
    handleChange(row.id, "categoryParentName", parent?.name || "");
  };

  const handleOpen = () => {
    setOpen(!open);
  };

  React.useEffect(() => {
    if (!open || !value) {
      return;
    }

    requestAnimationFrame(() => {
      const scrollUuid = categories.find((item) => item.uuid === value)?.parent ?? value;

      document.querySelector<HTMLElement>(`[data-parent-id="${scrollUuid}"]`)?.scrollIntoView({
        block: "start",
        behavior: "instant",
      });
    });
  }, [open, value, categories]);

  const expenseList = (parent: Category) => (
    <React.Fragment key={parent.uuid}>
      <Slc.SelectGroupLabel>
        {parent.icon} {parent.name}
      </Slc.SelectGroupLabel>

      {categories
        .filter((item) => item.parent === parent.uuid)
        .map((child, index) => (
          <Slc.SelectItem
            key={child.uuid}
            value={child.uuid}
            data-parent-id={index === 0 ? parent.uuid : undefined}
          >
            {child.name}
          </Slc.SelectItem>
        ))}
    </React.Fragment>
  );

  return (
    <Slc.Select
      value={value}
      open={open}
      onValueChange={(value) => onChange(value)}
      onOpenChange={handleOpen}
      items={selectableCategories.map((item: Category) => ({ label: item.name, value: item.uuid }))}
    >
      <Slc.SelectTrigger
        className={cn(
          "focus:border-primary h-8 w-full border-0 bg-white px-2 text-left text-sm focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-blue-700 focus-visible:outline-none",
          isInvalid && "border-2 border-red-400",
        )}
        onKeyDown={(e) => handleKeyDown(e, row.id)}
      >
        <Slc.SelectValue>
          {(item) => {
            const selectedCategory = categories.find((category) => category.uuid === item);
            if (!selectedCategory) {
              return;
            }

            if (selectedCategory.parent === null && categoryType === "EXP") {
              return (
                <span className="text-gray-400">{selectedCategory.name} (select category)</span>
              );
            }

            const parentCategory = categories.find(
              (category) => category.uuid === selectedCategory.parent,
            );
            return (
              <span>
                {parentCategory?.icon || selectedCategory.icon} {selectedCategory.name}
              </span>
            );
          }}
        </Slc.SelectValue>
      </Slc.SelectTrigger>
      <Slc.SelectPopup className="max-h-120">
        <Slc.SelectGroup>
          {categoryType === "INC"
            ? parents.map(renderIncomeCategory)
            : parents.map((parent) => (
                <React.Fragment key={parent.uuid}>
                  {expenseList(parent)}
                  <Slc.SelectSeparator />
                </React.Fragment>
              ))}
        </Slc.SelectGroup>
      </Slc.SelectPopup>
    </Slc.Select>
  );
}
