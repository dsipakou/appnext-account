// System
import { useSession } from 'next-auth/react';
import * as React from 'react';

import AccountCard from '@/components/accounts/components/AccountCard';
import { User } from '@/components/users/types';
// Hooks
import { useAccounts } from '@/hooks/accounts';
import { useUsers } from '@/hooks/users';

// Components
import { AddForm as AddAccount } from './forms';
// Types
import { AccountResponse } from './types';

const Index: React.FC = () => {
  const { data: accounts = [] } = useAccounts();
  const { data: session } = useSession();
  const { data: users = [] } = useUsers();

  const authUser = users.find((item: User) => item.username === session?.user?.username);
  const yourAccounts = authUser ? accounts.filter((item: AccountResponse) => item.user === authUser.uuid) : [];
  const sortedYourAccounts = yourAccounts.sort((a: AccountResponse, b: AccountResponse) => {
    if (a.isDefault && !b.isDefault) return a.isDefault ? -1 : 1;
    return a.title.localeCompare(b.title);
  });
  const otherAccounts = authUser ? accounts.filter((item: AccountResponse) => item.user !== authUser.uuid) : accounts;
  const sortedAccounts = [...yourAccounts, ...otherAccounts];

  const noAccounts = (
    <div className="flex flex-1 items-center justify-center">
      <span className="text-2xl">No accounts added</span>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
      <div className="my-3 flex w-full items-center justify-between px-6">
        <span className="text-xl font-semibold">Accounts</span>
        <AddAccount />
      </div>
      {sortedYourAccounts.length === 0 && noAccounts}
      <div className="rounded-xl bg-white p-3">
        Your accounts
        <div className="flex flex-col gap-1 rounded-xl bg-white p-4">
          {sortedYourAccounts.map((item: AccountResponse) => (
            <div key={item.uuid}>
              <AccountCard account={item} />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl bg-white p-3">
        Other accounts
        <div className="flex flex-col gap-1 rounded-xl bg-white p-4">
          {otherAccounts.map((item: AccountResponse) => (
            <div key={item.uuid}>
              <AccountCard account={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
