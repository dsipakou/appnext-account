import { GridRenderCellParams, GridRowModes, GridRowModesModel } from '@mui/x-data-grid';
import React from 'react';

import { Currency } from '@/components/currencies/types';
import { useCurrencies } from '@/hooks/currencies';

interface Types extends GridRenderCellParams {
  rowModesModel: GridRowModesModel;
}

const BaseAmountReadComponent: React.FC<Types> = (params) => {
  const { data: currencies = [] } = useCurrencies();
  const baseCurrencySign = currencies.find((item: Currency) => item.isBase)?.sign || '';

  const isInEditMode = params.rowModesModel[params.id]?.mode === GridRowModes.Edit;
  if (isInEditMode) {
    return <div className="flex h-full w-full select-none bg-slate-100 p-2"></div>;
  }
  return (
    <span className="italic text-slate-500">
      {params.formattedValue && `${params.formattedValue} ${baseCurrencySign}`}
    </span>
  );
};

export default BaseAmountReadComponent;
