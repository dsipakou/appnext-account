import React from 'react'
import { useCategories } from '@/hooks/categories';
import { Category } from '@/components/categories/types';
import EditForm from '@/components/categories/forms/EditForm';

interface Types {

}

const Income: React.FC<Types> = () => {
  const { data: categories = [] } = useCategories();

  const filteredCategories = categories.filter((item: Category) => item.type === 'INC')

  return (
    <div className="flex justify-center gap-3">
      {filteredCategories.map((item: Category) => (
        <div key={item.uuid} className="w-40 bg-white rounded-lg h-[100px] overflow-hidden hover:drop-shadow p-3 border cursor-pointer">
          {item.name}
        </div>
      ))}
    </div>
  )
}

export default Income
