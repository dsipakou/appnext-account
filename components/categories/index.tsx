import React from 'react'
import Toolbar from '@/components/common/layout/Toolbar'
import { Category } from './types'
import { useCategories } from '@/hooks/categories'
import AddForm from './forms/AddForm'
import { Button } from '@/components/ui/button'
import Income from './components/Income'
import Outcome from './components/Outcome'

const Index = () => {
  const { data: categories = [] } = useCategories()
  const [activeType, setActiveType] = React.useState<'income' | 'outcome'>('outcome')

  const parentCategories: Category[] = categories?.filter((item: Category) => item.parent === null && item.type !== 'INC') || []

  const categoriesByParent = (uuid: string): Category[] => {
    return categories?.filter((item: Category) => item.parent === uuid) || []
  }

  const noCategories = (
    <div className="flex justify-center items-center flex-1">
      <span className="text-2xl">No categories added</span>
    </div>
  )

  return (
    <>
      <Toolbar title={'Categories'}>
        <div className="flex border bg-blue-500 rounded-md">
          <Button
            className="w-[180px] disabled:opacity-100 p-1"
            disabled={activeType === 'outcome'}
            variant="none"
            onClick={() => setActiveType('outcome')}
          >
            <span className={`text-xl ${activeType === 'outcome' ? 'flex justify-center items-center text-xl rounded-md text-blue-500 bg-white w-full h-full' : 'text-white'}`}>
              Outcome
            </span>
          </Button>
          <Button
            className="w-[180px] disabled:opacity-100 p-1"
            disabled={activeType === 'income'}
            variant="none"
            onClick={() => setActiveType('income')}
          >
            <span className={`text-xl ${activeType === 'income' ? 'flex justify-center items-center text-xl rounded-md text-blue-500 bg-white w-full h-full' : 'text-white'}`}>
              Income
            </span>
          </Button>
        </div>
        <AddForm />
      </Toolbar>
      {
        (categories.length === 0) && noCategories
      }
      { activeType === 'income'
        ? (
        <Income />
          )
        : (
        <Outcome parentCategories={parentCategories} categoriesByParent={categoriesByParent} />
          )
      }
    </>
  )
}

export default Index
