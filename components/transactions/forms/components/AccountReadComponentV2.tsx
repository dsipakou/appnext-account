import { CreditCard } from 'lucide-react';
import React from 'react';

const AccountReadComponentV2: React.FC<Types> = (params) => {
  return (
    <div className="flex w-full items-center gap-2 pl-2">
      <CreditCard className="h-5" />
      <span className="text-sm">{params.account.title}</span>
    </div>
  );
};

export default AccountReadComponentV2;
