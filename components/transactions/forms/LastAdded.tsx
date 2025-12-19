import React from 'react';
import { useSWRConfig } from 'swr';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import * as Dlg from '@/components/ui/dialog';
import { TransactionsTable } from '@/components/transactions/components/transactionTable';
import { useLastAddedTransactions, useReadLastAddedTransactions } from '@/hooks/transactions';
import { useUsers } from '@/hooks/users';
import { useToast } from '@/components/ui/use-toast';

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
      <Dlg.DialogTrigger asChild>
        <Button variant="link">See last added</Button>
      </Dlg.DialogTrigger>
      <Dlg.DialogContent className="flex flex-col min-w-[1000px] h-screen my-20">
        <Dlg.DialogHeader>
          <div className="flex justify-between pr-7">
            <Dlg.DialogTitle>Transactions added since your last visit</Dlg.DialogTitle>
            <Button disabled={isReading || transactions.length === 0} onClick={handleMarkAsSeenClick}>
              Mark as seen
            </Button>
          </div>
        </Dlg.DialogHeader>
        <div className="h-full">
          <TransactionsTable transactions={transactions} />
        </div>
      </Dlg.DialogContent>
    </Dlg.Dialog>
  );
};

export default LastAdded;
