import React from 'react'
import { Category } from '@/components/categories/types'
import { useCategories } from '@/hooks/categories'
import { TransactionResponse } from '../../types'

interface Types extends TransactionResponse { }

const CategoryReadComponentV2: React.FC<Types> = (transaction) => {
  console.log(transaction)
  const { data: categories = [] } = useCategories()

  const getTrimmedCategoryName = (uuid: string): string => {
    const categoryName = categories.find((item: Category) => item.uuid === uuid)?.name || ''
    if (categoryName.length > 10) {
      return categoryName.substring(0, 10) + '...'
    }
    return categoryName
  }

  if (transaction.category == null) {
    return
  }

  return (
    <div className="flex px-2 w-full overflow-x-hidden items-center gap-1">
      {!!transaction.category.parent && (
        <>
          <span className="text-sm font-semibold py-1 rounded-md text-black pl-2">
            {getTrimmedCategoryName(transaction.category.parent)}
          </span>
          /
        </>
      )}
      <span className="text-sm overflow-x-hidden">{transaction.category.name || ''}</span>
    </div>
  )
}

export default CategoryReadComponentV2
