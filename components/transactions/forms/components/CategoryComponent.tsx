import React from 'react'
import {
  GridRenderEditCellParams,
  useGridApiContext
} from '@mui/x-data-grid'
import { SelectChangeEvent } from '@mui/material/Select'
import {
  FormControl,
  MenuItem,
  Select
} from '@mui/material'
import {
  Category,
  CategoryType
} from '@/components/categories/types'

interface CategoryComponentTypes extends GridRenderEditCellParams {
  parentList: Category[]
}

const CategoryComponent: React.FC<CategoryComponentTypes> = (params) => {
  const { id, field, value, categories } = params
  const apiRef = useGridApiContext()

  const parents = categories.filter(
    (category: Category) => (
      category.parent === null && category.type === CategoryType.Expense
    )
  )

  const getChildren = (uuid: string): Category[] => {
    return categories.filter(
      (item: Category) => item.parent === uuid
    ) || []
  }

  const handleChange = (event: SelectChangeEvent) => {
    apiRef.current.setEditCellValue({ id, field, value: event.target.value })
  }

  return (
    <FormControl fullWidth>
      <Select
        fullWidth
        value={value}
        onChange={handleChange}
      >
        {parents.map((item: Category) => {
          return getChildren(item.uuid).map((subitem: Category) => (
            <MenuItem key={subitem.uuid} value={subitem}>{item.name} - {subitem.name}</MenuItem>
          ))
        })}
      </Select>
    </FormControl>
  )
}

export default CategoryComponent
