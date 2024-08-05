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
import { AutoComplete } from '@/components/ui/autocomplete'

interface CategoryComponentTypes extends GridRenderEditCellParams {
  parentList: Category[]
}

const FRAMEWORKS = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
  {
    value: "wordpress",
    label: "WordPress",
  },
  {
    value: "express.js",
    label: "Express.js",
  },
  {
    value: "nest.js",
    label: "Nest.js",
  },
]

const CategoryComponentV2: React.FC<CategoryComponentTypes> = (params) => {
  const { id, field, row, categories } = params
  const apiRef = useGridApiContext()
  const budgetCategory = row.budget?.category
  const [isLoading, setLoading] = React.useState(false)
  const [isDisabled, setDisbled] = React.useState(false)
  const [value, setValue] = React.useState<Option>()

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

  const getCategoriesList = () => {
    let arr = []
    parents.map((item: Category) => {
      const children = getChildren(item.uuid).map((childItem: Category) => {
        return {
          label: `${item.icon} ${item.name} / ${childItem.name}`,
          value: childItem.uuid,
        }
      })
      arr = [...arr, ...children]
    })
    return arr
  }

  const handleChange = (item: Category) => {
    apiRef.current.setEditCellValue({ id, field, value: item })
  }

  return (
    <AutoComplete
      options={getCategoriesList()}
      emptyMessage="No resulsts."
      placeholder="Choose category"
      isLoading={isLoading}
      onValueChange={setValue}
      value={value}
      disabled={isDisabled}
    />
  )
}

export default CategoryComponentV2
