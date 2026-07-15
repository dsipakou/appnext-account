// System
import { ArrowLeft, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

// Components
import AccountDetailsCard from '@/components/accounts/components/AccountDetailsCard';
// Hooks
import { useAccount } from '@/hooks/accounts';

const AccountDetails = () => {
  const router = useRouter();
  const { uuid } = router.query;

  if (typeof uuid !== 'string') return;

  const { data: account } = useAccount(uuid);
  if (!account) return;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-blue-600 p-3">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{account.title}</h1>
            </div>
          </div>
          <Link
            href="/accounts"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Accounts
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {account &&
            account.usage.map((item) => (
              <AccountDetailsCard
                key={item.month}
                month={item.month}
                spendings={item.spendings}
                income={item.income || 0}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
