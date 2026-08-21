import React from "react";

import { Currency } from "@/components/currencies/types";
import CurrencyComponent from "@/components/transactions/forms/components/CurrencyComponentV2";
import { MaskedInput } from "@/components/ui/currency-input";
import { cn } from "@/lib/utils";

import { RowData } from "..";

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
  handleAmountChange?: (id: number, field: keyof RowData, value: any) => void;
  handleChange?: (id: number, field: keyof RowData, value: any) => void;
  handleKeyDown?: (
    e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>,
    id: number,
  ) => void;
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
  handleAmountChange,
  handleChange,
  handleKeyDown,
}) => {
  const isSaved = !!row.uuid;
  const transactionCurrency = currencies.find(
    (item: Currency) => item.uuid === (currencyValue || row.currency),
  );

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
        <div className="flex h-8 min-w-0 flex-1 items-center">
          <MaskedInput
            className={`${commonInputClass} min-w-0 flex-1 text-right`}
            inputRef={row.id === nextId - 1 ? currencyInputRef : null}
            mask={Number}
            unmask="typed"
            value={value}
            onFocus={(e) =>
              requestAnimationFrame(() => {
                e.target.select();
              })
            }
            id="amount"
            onAccept={(val) => handleAmountChange(row.id, "outcome", val)}
            onKeyDown={(e) => handleKeyDown(e, row.id)}
            scale={2}
            thousandsSeparator=" "
            radix="."
            normalizeZeros
            autofix
            padFractionalZeros={false}
            mapToRadix={[",", "ю", "б", "."]}
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
    <div className={cn(cellStyle, "flex gap-2")}>
      <div className="flex min-w-0 flex-1 items-center justify-end px-2 text-right">
        <div className="flex items-center gap-1">
          <span className="font-semibold">{getDisplayAmount()}</span>
          <span className={cn(isCurrencyChanged && "font-bold text-amber-600")}>
            {getDisplayCurrency()}
          </span>
        </div>
      </div>
      {/* Reserve space matching the currency dropdown width in edit mode */}
      <div className="flex w-20 flex-shrink-0 items-center justify-center">
        {shouldShowConversions ? (
          <CurrencyConversions
            row={row}
            transactionCurrency={transactionCurrency}
            defaultCurrency={defaultCurrency}
            baseCurrency={baseCurrency}
          />
        ) : (
          transactionCurrency && (
            <span className="text-xs font-medium text-slate-400">{transactionCurrency.code}</span>
          )
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
    <div className="flex w-20 flex-col">
      {defaultCurrency !== transactionCurrency && baseCurrency !== transactionCurrency && (
        <div className="ml-1 text-[0.6rem] text-slate-500 select-none">
          <span>(</span>
          <span className="mr-1 font-semibold select-text">{row.outcome}</span>
          <span>{transactionCurrency?.sign}</span>
          <span>)</span>
        </div>
      )}
      <div className="ml-1 text-[0.6rem] text-slate-500 select-none">
        <span>(</span>
        <span className="mr-1 font-semibold select-text">{Number(row.inBase)?.toFixed(2)}</span>
        <span>{baseCurrency?.sign}</span>
        <span>)</span>
      </div>
    </div>
  );
};
