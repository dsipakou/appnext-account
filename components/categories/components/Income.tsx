import React from 'react';

import { Category } from '@/components/categories/types';
import { useCategories } from '@/hooks/categories';

interface Types {}

const Income: React.FC<Types> = () => {
  const { data: categories = [] } = useCategories();

  const filteredCategories = categories.filter((item: Category) => item.type === 'INC');

  return (
    <div className="flex justify-center gap-3">
      {filteredCategories.map((item: Category) => (
        <div
          key={item.uuid}
          className="h-[100px] w-40 cursor-pointer overflow-hidden rounded-lg border bg-white p-3 hover:drop-shadow"
        >
          {item.name}
        </div>
      ))}
    </div>
  );
};

export default Income;
