import React from 'react';
import { CreditCardIcon } from 'lucide-react';
import { AccountResponse } from '@/components/accounts/types';
import AccountComponent from '@/components/transactions/forms/components/AccountComponentV2';
import { RowData } from '..';

interface AccountCellProps {
  isEditing: boolean;
  value: string;
  accounts: AccountResponse[];
  cellStyle: string;
  // Edit mode props
  handleChange?: (id: number, field: keyof RowData, value: any) => void;
  handleKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>, id: number) => void;
  row?: RowData;
  isInvalid?: boolean;
  user?: string | null;
}

export const AccountCell: React.FC<AccountCellProps> = ({
  isEditing,
  value,
  accounts,
  cellStyle,
  handleChange,
  handleKeyDown,
  row,
  isInvalid,
  user,
}) => {
  if (isEditing && row && handleChange && handleKeyDown) {
    return (
      <AccountComponent
        value={value}
        user={user}
        accounts={accounts}
        handleChange={handleChange}
        handleKeyDown={handleKeyDown}
        row={row}
        isInvalid={isInvalid}
      />
    );
  }

  const account = accounts.find((item: AccountResponse) => item.uuid === value);

  return (
    <div className={`px-1 flex items-center ${cellStyle}`}>
      <CreditCardIcon className="mr-2 h-4 w-4 flex-shrink-0" />
      <span className="truncate">{account?.title}</span>
    </div>
  );
};
