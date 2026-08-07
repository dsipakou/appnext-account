import { useSession } from 'next-auth/react';
import React from 'react';
import { useSWRConfig } from 'swr';

import { TransactionsTable } from '@/components/transactions/components/transactionTable';
import { Button } from '@/components/ui/button';
import * as Dlg from '@/components/ui/dialog';
import { toastManager } from '@/components/ui/toast';
import { useLastAddedTransactions, useReadLastAddedTransactions } from '@/hooks/transactions';
import { useUsers } from '@/hooks/users';

const LastAdded: React.FC = () => {
  const [user, setUser] = React.useState();
  const { mutate } = useSWRConfig();

  const { data: transactions = [], url } = useLastAddedTransactions();
  const { trigger: readTransactions, isMutating: isReading } = useReadLastAddedTransactions();
  const { data: users = [] } = useUsers();
  const {
    data: { user: authUser },
  } = useSession();

  React.useEffect(() => {
    if (!authUser || users.length === 0) return;

    const _user = users.find((item: User) => item.username === authUser.username)!;
    setUser(_user.uuid);
  }, [authUser, users]);

  const handleMarkAsSeenClick = async () => {
    if (!user) return;
    const payload = {
      user,
      transaction: transactions[0].uuid,
    };

    try {
      await readTransactions(payload);
      mutate(url);
      toastManager.add({
        id: 'transaction-last-added-read',
        title: 'Transactions marked as viewed',
        type: 'success',
      });
    } catch (error) {
      toastManager.add({
        id: 'transaction-last-added-read-error',
        title: 'Something went wrong',
        type: 'error',
      });
    }
  };

  return (
    <Dlg.Dialog>
      <Dlg.DialogTrigger render={<Button variant="link" />}>See last added</Dlg.DialogTrigger>
      <Dlg.DialogPopup className="my-20 flex h-screen min-w-250 flex-col">
        <Dlg.DialogHeader>
          <div className="flex justify-between pr-7">
            <Dlg.DialogTitle>Transactions added since your last visit</Dlg.DialogTitle>
            <Button disabled={isReading || transactions.length === 0} onClick={handleMarkAsSeenClick}>
              Mark as seen
            </Button>
          </div>
        </Dlg.DialogHeader>
        <Dlg.DialogPanel>
          <TransactionsTable transactions={transactions} />
        </Dlg.DialogPanel>
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default LastAdded;
