import React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Currency } from '@/components/currencies/types';
import { RowData } from '..';
import CurrencyComponent from '@/components/transactions/forms/components/CurrencyComponentV2';

interface OutcomeCellProps {
  isEditing: boolean;
  row: RowData;
  value?: number;
  currencyValue?: string;
  currencies: Currency[];
  defaultCurrencySign: string;
  baseCurrency: Currency | undefined;
  defaultCurrency: Currency | undefined;
  cellStyle: string;
  isChanged: boolean;
  isCurrencyChanged: boolean;
  // Edit mode props
  user?: string | null;
  commonInputClass?: string;
  nextId?: number;
  currencyInputRef?: React.RefObject<HTMLInputElement>;
  isInvalid?: boolean;
  handleAmountChange?: (id: number, field: keyof RowData, value: any) => void;
  handleChange?: (id: number, field: keyof RowData, value: any) => void;
  handleKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>, id: number) => void;
}

interface CurrencyConversionsProps {
  row: RowData;
  transactionCurrency: Currency | undefined;
  defaultCurrency: Currency | undefined;
  baseCurrency: Currency | undefined;
}

export const OutcomeCell: React.FC<OutcomeCellProps> = ({
  isEditing,
  row,
  value,
  currencyValue,
  currencies,
  defaultCurrencySign,
  baseCurrency,
  defaultCurrency,
  cellStyle,
  isChanged,
  isCurrencyChanged,
  user,
  commonInputClass,
  nextId,
  currencyInputRef,
  isInvalid,
  handleAmountChange,
  handleChange,
  handleKeyDown,
}) => {
  const isSaved = !!row.uuid;
  const transactionCurrency = currencies.find((item: Currency) => item.uuid === (currencyValue || row.currency));

  // Edit mode
  if (
    isEditing &&
    value !== undefined &&
    currencyValue !== undefined &&
    handleAmountChange &&
    handleChange &&
    handleKeyDown &&
    commonInputClass &&
    nextId !== undefined
  ) {
    return (
      <div className="flex gap-2">
        <div className="flex items-center h-8 min-w-0 flex-1">
          <Input
            type="text"
            placeholder="0.00"
            step="0.01"
            min="0"
            value={value}
            pattern="[0-9]+([\,][0-9]+)?"
            onChange={(e) => handleAmountChange(row.id, 'outcome', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, row.id)}
            onClick={(e) => e.currentTarget.select()}
            className={`${commonInputClass} text-right flex-1 min-w-0`}
            ref={row.id === nextId - 1 ? currencyInputRef : null}
            required
          />
          <span className="ml-1 flex-shrink-0">{transactionCurrency?.sign}</span>
        </div>
        <div className="flex-shrink-0">
          <CurrencyComponent
            user={user}
            value={currencyValue}
            handleChange={handleChange}
            handleKeyDown={handleKeyDown}
            row={row}
            isInvalid={isInvalid}
            isSaved={isSaved}
          />
        </div>
      </div>
    );
  }

  // Display mode
  const getDisplayAmount = () => {
    if (isSaved && !isCurrencyChanged && !isChanged) {
      return row.outcomeInDefaultCurrency?.toFixed(2);
    }
    return row.outcome;
  };

  const getDisplayCurrency = () => {
    if (isSaved && !isCurrencyChanged) {
      return defaultCurrencySign;
    }
    return transactionCurrency?.sign;
  };

  const shouldShowConversions = isSaved && !isChanged && !isCurrencyChanged;

  return (
    <div className={cn(cellStyle, 'flex gap-2')}>
      <div className="flex items-center justify-end px-2 text-right min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="font-semibold">{getDisplayAmount()}</span>
          <span className={cn(isCurrencyChanged && 'text-amber-600 font-bold')}>{getDisplayCurrency()}</span>
        </div>
      </div>
      {/* Reserve space matching the currency dropdown width in edit mode */}
      <div className="flex items-center justify-center flex-shrink-0 w-20">
        {shouldShowConversions ? (
          <CurrencyConversions
            row={row}
            transactionCurrency={transactionCurrency}
            defaultCurrency={defaultCurrency}
            baseCurrency={baseCurrency}
          />
        ) : (
          transactionCurrency && <span className="text-xs text-slate-400 font-medium">{transactionCurrency.code}</span>
        )}
      </div>
    </div>
  );
};

const CurrencyConversions: React.FC<CurrencyConversionsProps> = ({
  row,
  transactionCurrency,
  defaultCurrency,
  baseCurrency,
}) => {
  return (
    <div className="flex flex-col w-20">
      {defaultCurrency !== transactionCurrency && baseCurrency !== transactionCurrency && (
        <div className="ml-1 text-slate-500 text-[0.6rem] select-none">
          <span>(</span>
          <span className="mr-1 select-text font-semibold">{row.outcome}</span>
          <span>{transactionCurrency?.sign}</span>
          <span>)</span>
        </div>
      )}
      <div className="ml-1 text-slate-500 text-[0.6rem] select-none">
        <span>(</span>
        <span className="mr-1 select-text font-semibold">{Number(row.inBase)?.toFixed(2)}</span>
        <span>{baseCurrency?.sign}</span>
        <span>)</span>
      </div>
    </div>
  );
};
