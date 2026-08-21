// System
import { MoreHorizontal, TrashIcon, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

// Components
import { useStore } from '@/app/store';
import { ConfirmDeleteForm, EditForm as EditAccount, ReassignTransactionsForm } from '@/components/accounts/forms';
import { AccountResponse } from '@/components/accounts/types';
import { AccountUsage } from '@/components/transactions/types';
import { Button } from '@/components/ui/button';
// UI
import * as Mnu from '@/components/ui/menu';
// Types
import { User } from '@/components/users/types';
import { useAccountUsage } from '@/hooks/transactions';
// Hooks
import { useUsers } from '@/hooks/users';
import { cn } from '@/lib/utils';

interface Types {
  account: AccountResponse;
}

const formatMoney = (value: number, currencySign: string) => `${value.toFixed(2)} ${currencySign}`;

const AccountCard: React.FC<Types> = ({ account }) => {
  const [editOpen, setEditOpen] = React.useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = React.useState<boolean>(false);
  const [reassignOpen, setReassignOpen] = React.useState<boolean>(false);

  const { data: users = [] } = useUsers();

  // By default income and spent are 0
  const { data: usage = { income: 0, spent: 0 } as AccountUsage } = useAccountUsage(account.uuid);
  const income = usage.income;
  const expenses = usage.spent;

  const currencySign = useStore((state) => state.currency.sign);

  const isZeroState = income === 0 && expenses === 0;
  const balance = income - expenses;

  const getUser = (uuid: string): User | undefined => {
    return users.find((item: User) => item.uuid === uuid);
  };
  const user = getUser(account.user);

  return (
    <div className="relative flex flex-row justify-between overflow-hidden rounded-2xl bg-white p-2">
      <div className="pointer-events-none absolute -top-24 -right-20 size-48 rounded-full bg-cyan-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-6 size-44 rounded-full bg-violet-200/35 blur-3xl" />

      <div className="flex flex-1/3 justify-start gap-4">
        <div className="flex flex-1 p-4 pb-1.5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="truncate text-base leading-none font-semibold text-slate-950">{account.title}</div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                <UserIcon className="size-3.5" />
                <span className="truncate">{user?.username ?? 'No owner'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 p-4 pt-2">
          <div className="space-y-3">
            <div>
              <div className="text-xs text-slate-500">Balance this month</div>
              <div
                className={cn(
                  'mt-0.5 text-2xl font-semibold tracking-tight',
                  balance > 0 && 'text-emerald-600',
                  balance < 0 && 'text-red-500',
                  balance === 0 && 'text-slate-950',
                )}
              >
                {formatMoney(balance, currencySign)}
              </div>
            </div>

            {isZeroState ? (
              <div className="rounded-xl bg-slate-100/70 px-3 py-2 text-xs text-slate-500">
                No activity this month yet
              </div>
            ) : (
              <div className="flex items-center gap-3 text-xs">
                <div>
                  {' '}
                  <span className="text-slate-500">Income </span>{' '}
                  <span className="font-medium text-slate-800">{formatMoney(income, currencySign)}</span>
                </div>
                <div className="h-3.5 w-px bg-slate-200" />
                <div>
                  <span className="text-slate-500">Expenses </span>
                  <span className="font-medium text-slate-800">{formatMoney(expenses, currencySign)}</span>
                </div>
              </div>
            )}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          </div>
        </div>
      </div>

      <div className="flex flex-2/3 justify-end gap-2 px-2">
        <Mnu.Menu>
          <Mnu.MenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Open account actions"
                className="hover:bg-slate-100 hover:text-slate-950"
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </Mnu.MenuTrigger>
          <Mnu.MenuPopup align="end" sideOffset={6}>
            <Mnu.MenuGroup>
              <Mnu.MenuGroupLabel>Details</Mnu.MenuGroupLabel>
              <Mnu.MenuLinkItem render={<Link href={`/accounts/${account.uuid}`} />}>View Details</Mnu.MenuLinkItem>
            </Mnu.MenuGroup>
            <Mnu.MenuSeparator />
            <Mnu.MenuGroup>
              <Mnu.MenuGroupLabel>Actions</Mnu.MenuGroupLabel>
              <Mnu.MenuItem onClick={() => setEditOpen(true)}>Edit</Mnu.MenuItem>
              <Mnu.MenuItem onClick={() => setReassignOpen(true)}>Reassign Transactions</Mnu.MenuItem>
              <Mnu.MenuItem onClick={() => setDeleteOpen(true)} variant="destructive">
                <TrashIcon aria-hidden="true" />
                Delete
              </Mnu.MenuItem>
            </Mnu.MenuGroup>
          </Mnu.MenuPopup>
        </Mnu.Menu>
      </div>
      <EditAccount open={editOpen} setOpen={setEditOpen} uuid={account.uuid} />
      <ConfirmDeleteForm open={deleteOpen} setOpen={setDeleteOpen} uuid={account.uuid} />
      <ReassignTransactionsForm open={reassignOpen} setOpen={setReassignOpen} uuid={account.uuid} />
    </div>
  );
};

export default AccountCard;
