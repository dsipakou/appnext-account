import React from 'react'
import Link from 'next/link'
import Toolbar from '@/components/common/layout/Toolbar'
import { Category } from './types';
import { useCategories } from '../../hooks/categories';
import AddForm from './forms/AddForm';

const Index = () => {
  const { data: categories = [] } = useCategories();

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
        <AddForm />
      </Toolbar>
      {
        !categories.length && noCategories
      }
      <div className="grid grid-cols-4 gap-3">
        {parentCategories().map((item: Category) => (
          <div>
            <Link href={`/categories/${item.uuid}`}>
              <div className="w-full bg-white rounded-lg h-[200px] overflow-hidden p-3">
                <span className="flex flex-nowrap text-2xl font-semibold mb-2">{item.name}</span>
                {
                  categoriesByParent(item.uuid).map((category: Category) => (
                    <span className="flex flex-nowrap text-sm" key={category.uuid}>
                      {category.name}
                    </span>
                  ))
                }
              </div>
            </Link>
          </div>
        ))
        }
      </div>
    </>
  );
};

export default Index
