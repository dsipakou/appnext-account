import React from 'react'
// UI
import * as Slc from '@/components/ui/select'
// Types
import { Category } from '@/components/categories/types'
import { RowData } from '@/components/transactions/components/TransactionTableV2'
// Utils
import { cn } from '@/lib/utils'

type Props = {
  user: string
  value: string
  categories: Category[]
  handleChange: (id: number, key: string, value: string) => void
  handleKeyDown: (e: React.KeyboardEvent, id: number) => void
  row: RowData
  isInvalid: boolean
}

export default function BudgetComponent({
  user,
  value,
  categories,
  handleChange,
  handleKeyDown,
  row,
  isInvalid,
}: Props) {

  const parents = categories.filter((item: Category) => item.parent === null && item.type === 'EXP')

  const groupedCategories = categories.reduce((grouped, category) => {
    const key = category.parent || 'null'; // use 'null' for categories without a parent
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(category);
    return grouped;
  }, {});

  const onChange = (value: string) => {
    const category = categories.find((item: Category) => item.uuid === value)
    const parent = category ? categories.find((item: Category) => item.uuid === category.parent) : ""

    handleChange(row.id, "category", value)
    handleChange(row.id, "categoryName", category ? category.name : "")
    handleChange(row.id, "categoryParentName", parent ? parent.name : "")
  }

  return (
    <Slc.Select
      value={value}
      onValueChange={(value) => onChange(value)}
      onOpenChange={(open) => {
        if (!open) {
          (document.activeElement as HTMLElement)?.blur();
        }
      }}
    >
      <Slc.SelectTrigger
        className={cn(
          "w-full h-8 px-2 text-sm border-0 focus:ring-0 focus:outline-none focus:border-primary bg-white focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-blue-700 text-left",
          isInvalid && "outline outline-red-400"
        )}
        onKeyDown={(e) => handleKeyDown(e, row.id)}
      >
        <Slc.SelectValue />
      </Slc.SelectTrigger>
      <Slc.SelectContent position="popper" sideOffset={-40} className="max-h-[480px]">
        {parents.map((parent: Category) => (
          <div key={parent.uuid}>
            <Slc.SelectGroup>
              <Slc.SelectLabel>{parent.name}</Slc.SelectLabel>
              {
                groupedCategories[parent.uuid].map((item: Category) => (
                  <Slc.SelectItem key={item.uuid} value={item.uuid}>{parent.icon} {item.name}</Slc.SelectItem>
                ))
              }
            </Slc.SelectGroup>
            <Slc.SelectSeparator />
          </div>
        ))}
      </Slc.SelectContent>
    </Slc.Select>
  )
}
