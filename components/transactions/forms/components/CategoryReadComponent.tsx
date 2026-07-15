import { GridRenderCellParams } from '@mui/x-data-grid';
import React from 'react';

import { Category } from '@/components/categories/types';
import { useCategories } from '@/hooks/categories';

interface Types extends GridRenderCellParams<Category> {}

const CategoryReadComponent: React.FC<Types> = (params) => {
  const { data: categories = [] } = useCategories();

  const getTrimmedCategoryName = (uuid: string): string => {
    const categoryName = categories.find((item: Category) => item.uuid === uuid)?.name || '';
    if (categoryName.length > 10) {
      return categoryName.substring(0, 10) + '...';
    }
    return categoryName;
  };

  if (params.value == null) {
    return;
  }

  return (
    <div className="flex w-full items-center gap-1 overflow-x-hidden px-2">
      {!!params.value.parent && (
        <>
          <span className="rounded-md py-1 pl-2 text-sm font-semibold text-black">
            {getTrimmedCategoryName(params.value.parent)}
          </span>
          /
        </>
      )}
      <span className="overflow-x-hidden text-sm">{params.value.name || ''}</span>
    </div>
  );
};

export default CategoryReadComponent;
