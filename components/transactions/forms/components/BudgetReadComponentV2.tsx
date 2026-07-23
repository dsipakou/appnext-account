import React from 'react';

import { TransactionResponse } from '../../types';

interface Types extends TransactionResponse {}

const BudgetReadComponentV2: React.FC<Types> = (transaction) => {
  return (
    <div className="flex w-full items-center gap-2 px-2">
      <span className="overflow-x-hidden rounded-sm border bg-slate-100 px-1 text-sm">{transaction.budget}</span>
    </div>
  );
};

export default BudgetReadComponentV2;
