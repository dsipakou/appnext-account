import React from 'react';

import { Category } from '@/components/categories/types';
import { useCategories } from '@/hooks/categories';

import { TransactionResponse } from '../../types';

interface Types extends TransactionResponse {}

const CategoryReadComponentV2: React.FC<Types> = (transaction) => {
  console.log(transaction);
  const { data: categories = [] } = useCategories();

  const getTrimmedCategoryName = (uuid: string): string => {
    const categoryName = categories.find((item: Category) => item.uuid === uuid)?.name || '';
    if (categoryName.length > 10) {
      return categoryName.substring(0, 10) + '...';
    }
    return categoryName;
  };

  if (transaction.category == null) {
    return;
  }

  return (
    <div className="flex w-full items-center gap-1 overflow-x-hidden px-2">
      {!!transaction.category.parent && (
        <>
          <span className="rounded-md py-1 pl-2 text-sm font-semibold text-black">
            {getTrimmedCategoryName(transaction.category.parent)}
          </span>
          /
        </>
      )}
      <span className="overflow-x-hidden text-sm">{transaction.category.name || ''}</span>
    </div>
  );
};

export default CategoryReadComponentV2;
