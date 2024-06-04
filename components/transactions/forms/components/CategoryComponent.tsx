import React from 'react'
import {
  GridRenderEditCellParams,
  useGridApiContext
} from '@mui/x-data-grid'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Category,
  CategoryType
} from '@/components/categories/types'

interface CategoryComponentTypes extends GridRenderEditCellParams {
  parentList: Category[]
}

const CategoryComponent: React.FC<CategoryComponentTypes> = (params) => {
  const { id, field, value, row, categories } = params
  const apiRef = useGridApiContext()
  const budgetCategory = row.budget?.category

  const parents = categories.filter(
    (category: Category) => (
      category.parent === null && category.type === CategoryType.Expense
    )
  )

  const getPlannedCategory = (uuid: string): Category | undefined => {
    return parents.find((category: Category) => (
      category.uuid === uuid
    ))
  }

  const getChildren = (uuid: string): Category[] => {
    return categories.filter(
      (item: Category) => item.parent === uuid
    ) || []
  }

  const handleChange = (item: Category) => {
    apiRef.current.setEditCellValue({ id, field, value: item })
  }

  return (
    <div className="flex w-full h-full bg-slate-100 select-none items-center">
      {!parents.length
        ? (
          <span className="italic text-red-500">No categories found</span>
        )
        : (
          <Select
            onValueChange={handleChange}
            value={value}
          >
            <SelectTrigger className="relative text-xs border bg-white rounded-lg h-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {
                budgetCategory && (getPlannedCategory(budgetCategory) != null) && (
                  <SelectGroup>
                    <SelectLabel>Planned for</SelectLabel>
                    {
                      getChildren(getPlannedCategory(budgetCategory).uuid).map((subitem: Category) => (
                        <SelectItem key={subitem.uuid} value={subitem}>{getPlannedCategory(budgetCategory).name} / {subitem.name}</SelectItem>
                      ))
                    }
                  </SelectGroup>
                )
              }
              <SelectGroup>
                <SelectLabel>Categories</SelectLabel>
                {parents.map((item: Category) => {
                  return getChildren(item.uuid).map((subitem: Category) => (
                    <SelectItem key={subitem.uuid} value={subitem}>
                      <div className="flex gap-1 items-center">
                        {item.icon && (<span className="mr-1">{item.icon}</span>)}
                        <span className="font-semibold">{item.name}</span>
                        <span>/</span>
                        <span>{subitem.name}</span>
                      </div>
                    </SelectItem>
                  ))
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
    </div>
  )
}

export default CategoryComponent
