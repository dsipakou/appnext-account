import { useSession } from 'next-auth/react';
import React from 'react';
import { useSWRConfig } from 'swr';

import { TransactionsTable } from '@/components/transactions/components/transactionTable';
import { Button } from '@/components/ui/button';
import * as Dlg from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
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

  const { toast } = useToast();

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
      toast({
        title: 'Transactions marked as viewed',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
      });
    }
  };

  return (
    <Dlg.Dialog>
      <Dlg.DialogTrigger render={<Button variant="link" />}>See last added</Dlg.DialogTrigger>
      <Dlg.DialogPopup className="min-w-250 my-20 flex h-screen flex-col">
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
