import { GridRenderCellParams } from '@mui/x-data-grid';
import React from 'react';

import { Currency } from '@/components/currencies/types';

interface Types extends GridRenderCellParams {
  currency: Currency;
}

const AmountReadComponent: React.FC<Types> = (params) => {
  const currencySign = params.currency?.sign || '';

  if (!params.value) {
    return;
  }

  return (
    <div className="flex w-full items-center gap-2 pl-2">
      <span className="text-sm font-semibold">{params.value}</span>
      <span>{currencySign}</span>
    </div>
  );
};

export default AmountReadComponent;
