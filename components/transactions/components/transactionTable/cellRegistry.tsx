import React from 'react';
import { RowData } from '.';
import { AccountResponse } from '@/components/accounts/types';
import { Currency } from '@/components/currencies/types';
import { CompactWeekItem } from '@/components/budget/types';
import { CategoryResponse } from '@/components/categories/types';

// Unified Cell Components (handle both display and edit modes)
import { DateCell, AccountCell, BudgetCell, CategoryCell, OutcomeCell } from './cells';

interface RenderCellProps {
  row: RowData;
  key: keyof RowData;
  isEditing: boolean;
  value: any;
  currencyValue: string;
  editedRow: RowData;
  accounts: AccountResponse[];
  categories: CategoryResponse[];
  currencies: Currency[];
  user: string | null;
  budget?: CompactWeekItem;
  categoryType: 'INC' | 'EXP';
  defaultCurrencySign: string;
  baseCurrency: Currency | undefined;
  defaultCurrency: Currency | undefined;
  cellStyle: string;
  inputStyle: string;
  commonInputClass: string;
  isChanged: boolean;
  isCurrencyChanged: boolean;
  isInvalid: boolean;
  nextId: number;
  currencyInputRef: React.RefObject<HTMLInputElement>;
  handleChange: (id: number, field: keyof RowData, value: any) => void;
  handleAmountChange: (id: number, field: keyof RowData, value: any) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>, id: number) => void;
}

export const renderCellFromRegistry = ({
  row,
  key,
  isEditing,
  value,
  currencyValue,
  editedRow,
  accounts,
  categories,
  currencies,
  user,
  budget,
  categoryType,
  defaultCurrencySign,
  baseCurrency,
  defaultCurrency,
  cellStyle,
  commonInputClass,
  isChanged,
  isCurrencyChanged,
  isInvalid,
  nextId,
  currencyInputRef,
  handleChange,
  handleAmountChange,
  handleKeyDown,
}: RenderCellProps): React.ReactNode => {
  switch (key) {
    case 'date':
      return (
        <DateCell
          isEditing={isEditing}
          value={value as Date}
          cellStyle={cellStyle}
          handleChange={handleChange}
          row={editedRow}
          isInvalid={isInvalid}
          user={user}
        />
      );
    case 'account':
      return (
        <AccountCell
          isEditing={isEditing}
          value={value as string}
          accounts={accounts}
          cellStyle={cellStyle}
          handleChange={handleChange}
          handleKeyDown={handleKeyDown}
          row={editedRow}
          isInvalid={isInvalid}
          user={budget?.user || user}
        />
      );
    case 'budget':
      return (
        <BudgetCell
          isEditing={isEditing}
          budgetName={row.budgetName}
          value={value as string}
          cellStyle={cellStyle}
          accounts={accounts}
          handleChange={handleChange}
          handleKeyDown={handleKeyDown}
          row={editedRow}
          isInvalid={isInvalid}
          user={user}
        />
      );
    case 'category':
      return (
        <CategoryCell
          isEditing={isEditing}
          categoryParentName={row.categoryParentName}
          categoryName={row.categoryName}
          value={value as string}
          cellStyle={cellStyle}
          categories={categories}
          categoryType={categoryType}
          handleChange={handleChange}
          handleKeyDown={handleKeyDown}
          row={editedRow}
          isInvalid={isInvalid}
          user={user}
          defaultOpen={!!budget}
        />
      );
    case 'outcome':
      return (
        <OutcomeCell
          isEditing={isEditing}
          row={isEditing ? editedRow : row} // TODO: review this
          value={value}
          currencyValue={currencyValue}
          currencies={currencies}
          defaultCurrencySign={defaultCurrencySign}
          baseCurrency={baseCurrency}
          defaultCurrency={defaultCurrency}
          cellStyle={cellStyle}
          isChanged={isChanged}
          isCurrencyChanged={isCurrencyChanged}
          user={user}
          commonInputClass={commonInputClass}
          nextId={nextId}
          currencyInputRef={currencyInputRef}
          isInvalid={isInvalid}
          handleAmountChange={handleAmountChange}
          handleChange={handleChange}
          handleKeyDown={handleKeyDown}
        />
      );
    case 'currency':
    case 'outcomeInDefaultCurrency':
      return null;
    default:
      return null;
  }
};
