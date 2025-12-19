import React from 'react';
import { Badge } from '@/components/ui/badge';
import BudgetComponent from '@/components/transactions/forms/components/BudgetComponentV2';
import { AccountResponse } from '@/components/accounts/types';
import { RowData } from '..';

interface BudgetCellProps {
  isEditing: boolean;
  budgetName: string;
  value?: string;
  cellStyle: string;
  // Edit mode props
  accounts?: AccountResponse[];
  handleChange?: (id: number, field: keyof RowData, value: any) => void;
  handleKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>, id: number) => void;
  row?: RowData;
  isInvalid?: boolean;
  user?: string | null;
}

export const BudgetCell: React.FC<BudgetCellProps> = ({
  isEditing,
  budgetName,
  value,
  cellStyle,
  accounts,
  handleChange,
  handleKeyDown,
  row,
  isInvalid,
  user,
}) => {
  if (isEditing && row && handleChange && handleKeyDown && accounts && value !== undefined) {
    return (
      <BudgetComponent
        user={user}
        value={value}
        accounts={accounts}
        handleChange={handleChange}
        handleKeyDown={handleKeyDown}
        row={row}
        isInvalid={isInvalid}
      />
    );
  }

  return (
    <Badge variant="outline" className={`px-2 ${cellStyle} truncate`}>
      {budgetName}
    </Badge>
  );
};
