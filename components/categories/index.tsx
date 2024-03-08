import React from 'react'
import Link from 'next/link'
import Toolbar from '@/components/common/layout/Toolbar'
import { Category } from './types';
import { useCategories } from '@/hooks/categories';
import AddForm from './forms/AddForm';
import { Button } from '@/components/ui/button'
import Income from './components/Income'

const Index = () => {
  const { data: categories = [] } = useCategories();
  const [activeType, setActiveType] = React.useState<"income" | "outcome">("outcome")

  const parentCategories = (): Category[] => {
    return categories?.filter((item: Category) => item.parent === null && item.type !== 'INC') || []
  }

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
        !categories.length && noCategories
      }
      { activeType === 'income' ? (
        <Income />
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {parentCategories().map((item: Category) => (
            <div>
              <Link href={`/categories/${item.uuid}`}>
                <div className={`w-full bg-white rounded-lg h-[200px] overflow-hidden hover:drop-shadow p-3 ${!categoriesByParent(item.uuid).length && 'border-2 border-red-400'}`}>
                  <span className="flex flex-nowrap text-2xl font-semibold">{item.name}</span>
                  { !!categoriesByParent(item.uuid).length
                    ? (
                      <>
                        <span className="text-xs pl-3">{categoriesByParent(item.uuid).length} categories</span>
                        { categoriesByParent(item.uuid).map((category: Category) => (
                          <span className="flex flex-nowrap text-sm" key={category.uuid}>
                            - {category.name}
                          </span>
                        ))}
                      </>
                    )
                    : 
                    <div className="flex h-full w-full p-5 justify-center text-slate-300">
                      <span className="text-center">Need to add at least one subcategory</span>
                    </div>
                  }
                </div>
              </Link>
            </div>
          ))
          }
        </div>
      )}
    </>
  );
};

export default Index
