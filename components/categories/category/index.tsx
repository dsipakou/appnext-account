import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { CornerUpLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCategories } from '@/hooks/categories'
import Toolbar from '@/components/common/layout/Toolbar'
import {
  AddForm,
  ConfirmDeleteForm,
  EditForm,
  ReassignTransactionsForm
} from '@/components/categories/forms'
import { Category } from '../types'

const Category = () => {
  const [parentCategory, setParentCategory] = React.useState<Category>()
  const [childrenCategories, setChildrenCategories] = React.useState<Category[]>([])

  const { data: categories } = useCategories()

  const router = useRouter()
  const { uuid: parentUuid } = router.query

  React.useEffect(() => {
    if (!categories) return

    const parentCategory = categories.find((item: Category) => item.uuid === parentUuid)
    const childrenCategories = categories.filter((item: Category) => item.parent === parentCategory?.uuid)

    setParentCategory(parentCategory)
    setChildrenCategories(childrenCategories)
  }, [categories, parentUuid])

  const parentCategoryCard = (category: Category) => {
    return (
      <div className="border rounded-md shadow-md bg-white">
        <div className="grid grid-cols-12">
          <div className="col-span-2">
          </div>
          <div className="flex justify-center col-span-8 self-center">
            <span className="text-2xl">{category.name}</span>
          </div>
          <div className="col-span-2">
            <div className="flex flex-col items-end text-white">
              <EditForm uuid={category.uuid} />
              <ConfirmDeleteForm uuid={category.uuid} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const categoryCard = (category: Category) => {
    return (
      <div className="flex bg-white rounded-md outline-slate-200 outline">
        <div className="grid grid-cols-12">
          <div className="col-span-2">
          </div>
          <div className="col-span-8 self-center">
            <div className="text-lg">
              {category.name}
            </div>
          </div>
          <div className="col-span-2">
            <div className="flex flex-col items-end">
              <EditForm uuid={category.uuid} />
              <ConfirmDeleteForm uuid={category.uuid} />
              <ReassignTransactionsForm uuid={category.uuid} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toolbar>
        <Button asChild variant="link">
          <Link href="/categories">
            <CornerUpLeft className="mr-2" /> Back
          </Link>
        </Button>
        <AddForm parent={parentCategory} />
      </Toolbar>
      <div className="grid grid-cols-3 gap-4 justify-center">
        <div className="col-span-3">
          {(parentCategory != null) && parentCategoryCard(parentCategory)}
        </div>
        {(childrenCategories.length === 0) && (
        <div className="col-span-3">
          <span className="flex w-full text-md from-indigo-400 justify-center">Please, add at least one sub-category</span>
        </div>
        )}
        {childrenCategories.map((item: Category) => <div key={item.uuid}>{categoryCard(item)}</div>)}
      </div>
    </>
  )
}

export default Category
