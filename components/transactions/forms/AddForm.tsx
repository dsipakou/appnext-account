// System
import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useSWRConfig } from 'swr';
// Components
import { TransactionsTable } from '../components/transactionTable';
// UI
import * as Alr from '@/components/ui/alert-dialog';
import * as Dlg from '@/components/ui/dialog';
// Hooks
import { useUsers } from '@/hooks/users';
import { User } from '@/components/users/types';
// Types
import { CompactWeekItem } from '@/components/budget/types';

interface Types {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  budget?: CompactWeekItem;
}

const UnsavedTransactionsAlert: React.FC<{ open: boolean; setOpen: (open: boolean) => void }> = ({
  open = false,
  setOpen,
}) => {
  return (
    <Alr.AlertDialog open={open} onOpenChange={setOpen}>
      <Alr.AlertDialogTrigger asChild></Alr.AlertDialogTrigger>
      <Alr.AlertDialogContent>
        <Alr.AlertDialogHeader>
          <Alr.AlertDialogTitle>You have unsubmitted transactions</Alr.AlertDialogTitle>
          <Alr.AlertDialogDescription>Either remove or submit them</Alr.AlertDialogDescription>
        </Alr.AlertDialogHeader>
        <Alr.AlertDialogFooter>
          <Alr.AlertDialogAction className="w-20">OK</Alr.AlertDialogAction>
        </Alr.AlertDialogFooter>
      </Alr.AlertDialogContent>
    </Alr.AlertDialog>
  );
};

const AddForm: React.FC<Types> = ({ open, onOpenChange, url, budget }) => {
  const [user, setUser] = React.useState('');
  const [canClose, setCanClose] = React.useState<boolean>(true);
  const [alertOpen, setAlertOpen] = React.useState(false);

  const { data: users = [] } = useUsers();

  const {
    data: { user: authUser },
  } = useSession();
  const { mutate } = useSWRConfig();

  React.useEffect(() => {
    if (!authUser || users.length === 0) return;

    const _user = users.find((item: User) => item.username === authUser.username)!;
    setUser(_user.uuid);
  }, [authUser, users]);

  const handleCanClose = (flag: boolean) => {
    setCanClose(flag);
  };

  const onClose = (open: boolean) => {
    if (open) {
      onOpenChange(open);
      return;
    } else {
      mutate(url);
      mutate((key) => typeof key === 'string' && key.includes('budget/usage'), undefined);
      mutate((key) => typeof key === 'string' && key.includes('budget/weekly-usage'), undefined);
    }

    if (canClose) {
      onOpenChange(false);
    } else {
      setAlertOpen(!alertOpen);
    }
  };

  return (
    <>
      <Dlg.Dialog open={open} onOpenChange={onClose}>
        <Dlg.DialogTrigger asChild></Dlg.DialogTrigger>
        <Dlg.DialogContent className="flex flex-col sm:max-w-full w-4/5 h-5/6 items-start mx-3">
          <Dlg.DialogHeader>
            <Dlg.DialogTitle>Add transactions</Dlg.DialogTitle>
          </Dlg.DialogHeader>
          <div className="flex h-full w-full">
            <TransactionsTable budget={budget} handleCanClose={handleCanClose} mode="bulk" />
          </div>
        </Dlg.DialogContent>
      </Dlg.Dialog>
      <UnsavedTransactionsAlert open={alertOpen} setOpen={setAlertOpen} />
    </>
  );
};

export default AddForm;
