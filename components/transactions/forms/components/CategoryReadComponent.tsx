import React from 'react'
import { GridRenderCellParams } from '@mui/x-data-grid'
import { Category } from '@/components/categories/types'
import { useCategories } from '@/hooks/categories'

interface Types extends GridRenderCellParams<Category> {}

const CategoryReadComponent: React.FC<Types> = (params) => {
  const { data: categories = [] } = useCategories()

  const getTrimmedCategoryName = (uuid: string): string => {
    const categoryName = categories.find((item: Category) => item.uuid === uuid)?.name || ''
    if (categoryName.length > 7) {
      return categoryName.substring(0, 7) + '...'
    }
    return categoryName
  }
  if (!params.value) {
    return
  }
  return (
    <div className="flex px-2 w-full overflow-x-hidden items-center gap-2">
      <span className="text-sm font-semibold py-1 rounded-md text-black pl-2">
        {getTrimmedCategoryName(params.value.parent)}
      </span>
      /
      <span className="text-sm overflow-x-hidden">{params.value.name || ''}</span>
    </div>
  )
}

export default CategoryReadComponent
