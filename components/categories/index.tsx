import React from 'react';

import Toolbar from '@/components/common/layout/Toolbar';
import { Button } from '@/components/ui/button';
import { useCategories } from '@/hooks/categories';

import Income from './components/Income';
import Outcome from './components/Outcome';
import AddForm from './forms/AddForm';
import { Category } from './types';

const Index = () => {
  const { data: categories = [] } = useCategories();
  const [activeType, setActiveType] = React.useState<'income' | 'outcome'>('outcome');

  const parentCategories: Category[] =
    categories?.filter((item: Category) => item.parent === null && item.type !== 'INC') || [];

  const categoriesByParent = (uuid: string): Category[] => {
    return categories?.filter((item: Category) => item.parent === uuid) || [];
  };

  const noCategories = (
    <div className="flex flex-1 items-center justify-center">
      <span className="text-2xl">No categories added</span>
    </div>
  );

  return (
    <>
      <Toolbar title={'Categories'}>
        <div className="flex rounded-md border bg-blue-500">
          <Button
            className="w-45 p-1 disabled:opacity-100"
            disabled={activeType === 'outcome'}
            onClick={() => setActiveType('outcome')}
          >
            <span
              className={`text-xl ${activeType === 'outcome' ? 'flex h-full w-full items-center justify-center rounded-md bg-white text-xl text-blue-500' : 'text-white'}`}
            >
              Outcome
            </span>
          </Button>
          <Button
            className="w-45 p-1 disabled:opacity-100"
            disabled={activeType === 'income'}
            onClick={() => setActiveType('income')}
          >
            <span
              className={`text-xl ${activeType === 'income' ? 'flex h-full w-full items-center justify-center rounded-md bg-white text-xl text-blue-500' : 'text-white'}`}
            >
              Income
            </span>
          </Button>
        </div>
        <AddForm />
      </Toolbar>
      {categories.length === 0 && noCategories}
      {activeType === 'income' ? (
        <Income />
      ) : (
        <Outcome parentCategories={parentCategories} categoriesByParent={categoriesByParent} />
      )}
    </>
  );
};

export default Index;
