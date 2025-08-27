import React from 'react';
import { Info, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePendingBudget } from '@/hooks/budget';
import { useCategories } from '@/hooks/categories';
import { useCurrencies } from '@/hooks/currencies';
import EditForm from '@/components/budget/forms/EditForm';
import ConfirmDeleteForm from '@/components/budget/forms/ConfirmDeleteForm';
import { Category } from '@/components/categories/types';
import { WeekBudgetItem } from '@/components/budget/types';
import { Currency } from '@/components/currencies/types';

interface Types {
  weekUrl: string;
  monthUrl: string;
}

const SavedForLaterForm: React.FC<Types> = ({ weekUrl, monthUrl }) => {
  const [isEditDialogOpened, setIsEditDialogOpened] = React.useState<boolean>(false);
  const [isConfirmDeleteDialogOpened, setIsConfirmDeleteDialogOpened] = React.useState<boolean>(false);
  const [activeBudgetUuid, setActiveBudgetUuid] = React.useState<string>('');

  const { data: pendingBudget = [] } = usePendingBudget();
  const { data: categories = [] } = useCategories();
  const { data: currencies = [] } = useCurrencies();

  const getCurrencySign = (currency: Currency) => {
    return currencies.find((item: Currency) => item == currency)?.sign || '';
  };

  const clearForm = () => {};

  const getCategoryName = (uuid: string): string => {
    return categories.find((item: Category) => item.uuid === uuid)?.name || '';
  };

  const clickEdit = (uuid: string) => {
    setActiveBudgetUuid(uuid);
    setIsEditDialogOpened(!isEditDialogOpened);
  };

  const clickDelete = (uuid: string) => {
    setActiveBudgetUuid(uuid);
    setIsConfirmDeleteDialogOpened(!isConfirmDeleteDialogOpened);
  };

  return (
    <Dialog onOpenChange={clearForm}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-blue-500 border-blue-500 hover:text-blue-600">
          Saved for later
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[600px]">
        {pendingBudget.length > 0 && (
          <DialogHeader>
            <DialogTitle>Pending budget</DialogTitle>
          </DialogHeader>
        )}
        <div className="flex flex-col gap-3">
          {pendingBudget.length === 0 ? (
            <div className="flex flex-col col-span-4 justify-center">
              <span className="text-2xl mb-2">You have no pending items</span>
              <div className="flex">
                <Info className="h-4 w-4 text-blue-500 mr-1" />
                <div className="flex flex-col">
                  <span className="text-m flex">If you want to plan something but haven't decided on a date yet</span>
                  <span className="text-sm">just create a budget and don't specify a date for it.</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {pendingBudget.map((budgetItem: WeekBudgetItem) => (
                <div key={budgetItem.uuid}>
                  <div
                    className="flex gap-3 justify-between items-center rounded px-4 py-2 border border-slate-200"
                    key={budgetItem.uuid}
                  >
                    <div className="flex w-3/5 flex-col h-full justify-center">
                      <div>
                        <span className="text-xl">{budgetItem.title}</span>
                      </div>
                      <div>
                        <span className="text-sm rounded bg-blue-400 text-white px-2 py-1">
                          {getCategoryName(budgetItem.category)}
                        </span>
                      </div>
                    </div>
                    <div className="flex w-1/5 items-center">
                      <span className="text-lg">
                        {budgetItem.amount} {getCurrencySign(budgetItem.currency)}
                      </span>
                    </div>
                    <div className="flex items-center h-full justify-end">
                      <Button variant="ghost" size="xs" onClick={() => clickEdit(budgetItem.uuid)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="xs" onClick={() => clickDelete(budgetItem.uuid)}>
                        <Trash className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  {isEditDialogOpened && (
                    <EditForm
                      open={isEditDialogOpened}
                      setOpen={() => clickEdit(budgetItem.uuid)}
                      uuid={activeBudgetUuid}
                      weekUrl={weekUrl}
                      monthUrl={monthUrl}
                    />
                  )}
                  {isConfirmDeleteDialogOpened && (
                    <ConfirmDeleteForm
                      open={isConfirmDeleteDialogOpened}
                      setOpen={() => clickDelete(budgetItem.uuid)}
                      uuid={activeBudgetUuid}
                      weekUrl={weekUrl}
                      monthUrl={monthUrl}
                    />
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SavedForLaterForm;
