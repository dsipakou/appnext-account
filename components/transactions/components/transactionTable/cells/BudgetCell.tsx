import React from 'react';
import { useSWRConfig } from 'swr';
import { Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BudgetComponent from '@/components/transactions/forms/components/BudgetComponentV2';
import { useEditBudget } from '@/hooks/budget';
import { AccountResponse } from '@/components/accounts/types';
import { extractErrorMessage } from '@/utils/stringUtils';
import { RowData } from '..';

interface BudgetCellProps {
  isEditing: boolean;
  budgetName: string;
  value?: string;
  isCompleted: boolean;
  cellStyle: string;
  handleCompleted: () => void;
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
  isCompleted,
  cellStyle,
  handleCompleted,
  accounts,
  handleChange,
  handleKeyDown,
  row,
  isInvalid,
  user,
}) => {
  const { trigger: completeBudget, isMutating: isCompleting } = useEditBudget(value);
  const { mutate } = useSWRConfig();
  const { toast } = useToast();

  const handleClickComplete = async (): Promise<void> => {
    try {
      await completeBudget({ isCompleted: true });
      handleCompleted();

      mutate((key) => typeof key === 'string' && key.includes('budget/usage'), undefined, { revalidate: true });
      mutate((key) => typeof key === 'string' && key.includes('budget/weekly-usage'), undefined, { revalidate: true });
      mutate((key) => typeof key === 'string' && key.includes('transactions/'), undefined, { revalidate: true });
      mutate('budget/pending/', undefined, { revalidate: true });
      mutate('budget/upcomming/', undefined, { revalidate: true });
    } catch (error) {
      const message = extractErrorMessage(error);
      toast({
        variant: 'destructive',
        title: 'Cannot be completed',
        description: message,
      });
    }
  };

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
    <div className={`flex items-center ${cellStyle}`}>
      <Badge variant="outline" className={`px-2 ${cellStyle} truncate`}>
        {budgetName}
      </Badge>
      {!isCompleted && (
        <Button size="xs" disabled={isCompleting} onClick={handleClickComplete} className="ml-2">
          <Check className="mr h-4 w-3 rounded" />
        </Button>
      )}
    </div>
  );
};
