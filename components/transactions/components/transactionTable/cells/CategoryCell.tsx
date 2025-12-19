import React from 'react';
import CategoryComponent from '@/components/transactions/forms/components/CategoryComponentV2';
import { CategoryResponse } from '@/components/categories/types';
import { RowData } from '..';

interface CategoryCellProps {
  isEditing: boolean;
  categoryParentName: string;
  categoryName: string;
  value?: string;
  cellStyle: string;
  // Edit mode props
  categories?: CategoryResponse[];
  categoryType?: 'INC' | 'EXP';
  handleChange?: (id: number, field: keyof RowData, value: any) => void;
  handleKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>, id: number) => void;
  row?: RowData;
  isInvalid?: boolean;
  user?: string | null;
  defaultOpen?: boolean;
}

export const CategoryCell: React.FC<CategoryCellProps> = ({
  isEditing,
  categoryParentName,
  categoryName,
  value,
  cellStyle,
  categories,
  categoryType,
  handleChange,
  handleKeyDown,
  row,
  isInvalid,
  user,
  defaultOpen,
}) => {
  if (isEditing && row && handleChange && handleKeyDown && categories && categoryType && value !== undefined) {
    return (
      <CategoryComponent
        user={user}
        value={value}
        categories={categories}
        categoryType={categoryType}
        handleChange={handleChange}
        handleKeyDown={handleKeyDown}
        row={row}
        isInvalid={isInvalid}
        defaultOpen={defaultOpen}
      />
    );
  }

  return (
    <div className={`px-1 py-1 flex items-center ${cellStyle}`}>
      <span className="font-medium">{categoryParentName}</span>
      <span className="mx-1">/</span>
      <span className="text-slate-500 truncate">{categoryName}</span>
    </div>
  );
};
