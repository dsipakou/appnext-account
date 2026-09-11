import { useSession } from "next-auth/react";
import * as React from "react";

import type { User } from "@/components/users/types";

import AccountCard from "@/components/accounts/components/AccountCard";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useAccounts } from "@/hooks/accounts";
import { useUsers } from "@/hooks/users";

import type { AccountResponse } from "./types";

import { AddForm as AddAccount } from "./forms";

const Index: React.FC = () => {
  const { data: accounts = [], isLoading: isAccountsLoading } = useAccounts();
  const { data: session } = useSession();
  const { data: users = [] } = useUsers();

  const authUser = users.find((item: User) => item.username === session?.user?.username);
  const yourAccounts = authUser
    ? accounts.filter((item: AccountResponse) => item.user === authUser.uuid)
    : [];
  const sortedYourAccounts = yourAccounts.toSorted((a: AccountResponse, b: AccountResponse) => {
    if (a.isDefault && !b.isDefault) {
      return a.isDefault ? -1 : 1;
    }

    return a.title.localeCompare(b.title);
  });
  const otherAccounts = authUser
    ? accounts.filter((item: AccountResponse) => item.user !== authUser.uuid)
    : accounts;

  const emptyState = (
    <Empty className="max-w-2xl border bg-white shadow-sm">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <span className="text-xl">$</span>
        </EmptyMedia>
        <EmptyTitle>Create your first account</EmptyTitle>
        <EmptyDescription>
          Add a wallet, card, or cash account to start tracking balances and planning your budget.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <AddAccount />
      </EmptyContent>
    </Empty>
  );

  let content = (
    <>
      <div className="rounded-xl bg-white pt-3">
        <span className="p-3">Your accounts</span>
        <div className="flex flex-col rounded-xl bg-white py-3">
          {sortedYourAccounts.map((item: AccountResponse) => (
            <div key={item.uuid}>
              <AccountCard account={item} />
            </div>
          ))}
        </div>
      </div>
      {otherAccounts.length > 0 && (
        <div className="rounded-xl bg-white pt-3">
          <span className="p-3">Other accounts</span>
          <div className="flex flex-col rounded-xl bg-white py-3">
            {otherAccounts.map((item: AccountResponse) => (
              <div key={item.uuid}>
                <AccountCard account={item} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  if (isAccountsLoading) {
    content = (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Spinner className="size-8" />
        </div>
      </div>
    );
  } else if (accounts.length === 0) {
    content = <div className="flex flex-1 items-center justify-center">{emptyState}</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
      <div className="my-3 flex w-full items-center justify-between px-6">
        <span className="text-xl font-semibold">Accounts</span>
        <AddAccount />
      </div>
      {content}
    </div>
  );
};

export default Index;
