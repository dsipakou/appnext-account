// System
import * as React from 'react';

import AccountCard from '@/components/accounts/components/AccountCard';
// Hooks
import { useAccounts } from '@/hooks/accounts';

// Components
import { AddForm as AddAccount } from './forms';
// Types
import { AccountResponse } from './types';

const Index: React.FC = () => {
  const { data: accounts = [] } = useAccounts();

  const noAccounts = (
    <div className="flex flex-1 items-center justify-center">
      <span className="text-2xl">No accounts added</span>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="my-3 flex w-full items-center justify-between px-6">
        <span className="text-xl font-semibold">Accounts</span>
        <AddAccount />
      </div>
      {accounts.length === 0 && noAccounts}
      <div className="grid grid-cols-3 gap-3">
        {accounts.map((item: AccountResponse) => (
          <div key={item.uuid}>
            <AccountCard account={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Index;
