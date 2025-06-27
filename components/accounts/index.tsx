// System
import * as React from 'react';
// Components
import { AddForm as AddAccount } from './forms';
import AccountCard from '@/components/accounts/components/AccountCard';
// Hooks
import { useAccounts } from '@/hooks/accounts';
// Types
import { AccountResponse } from './types';

const Index: React.FC = () => {
  const { data: accounts = [] } = useAccounts();

  const noAccounts = (
    <div className="flex justify-center items-center flex-1">
      <span className="text-2xl">No accounts added</span>
    </div>
  );

  return (
    <div className="flex flex-col flex-1">
      <div className="flex w-full px-6 my-3 justify-between items-center">
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
