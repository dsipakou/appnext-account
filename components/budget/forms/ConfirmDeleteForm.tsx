import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useSWRConfig } from 'swr';
import { useToast } from '@/components/ui/use-toast';
import { useDeleteBudget, useStopBudgetSeries } from '@/hooks/budget';
import { RecurrentTypes } from '@/components/budget/types';

interface Types {
  open: boolean;
  setOpen: (open: boolean) => void;
  uuid: string;
  recurrent?: RecurrentTypes;
  budgetDate?: string;
}

const ConfirmDeleteForm: React.FC<Types> = ({ open, setOpen, uuid, recurrent, budgetDate }) => {
  const [deletionMode, setDeletionMode] = React.useState<'instance' | 'series'>('instance');

  const { mutate } = useSWRConfig();
  const { toast } = useToast();
  const { trigger: deleteBudget, isMutating: isDeletingBudget } = useDeleteBudget(uuid);
  const { trigger: stopSeries, isMutating: isStoppingSeries } = useStopBudgetSeries(uuid);

  const handleDelete = async () => {
    try {
      if (recurrent && recurrent !== 'occasional' && deletionMode === 'series') {
        // Stop the series
        await stopSeries({ until: budgetDate });
      } else {
        // Delete only this instance
        await deleteBudget();
      }
      setOpen(false);
      toast({
        title: deletionMode === 'series' ? 'Series stopped successfully' : 'Deleted successfully',
      });
      // Clear all budget-related cache entries
      await mutate(
        (key) =>
          typeof key === 'string' &&
          (key.includes('budget/weekly-usage/') || key.includes('budget/usage/') || key.includes('budget/pending/')),
        undefined,
        { revalidate: true }
      );
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Please, try again',
      });
    }
  };

  const isRecurrent = recurrent && recurrent !== 'occasional';
  const isLoading = isDeletingBudget || isStoppingSeries;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>{isRecurrent ? 'Delete recurring budget' : 'Please, confirm deletion'}</DialogTitle>

        {isRecurrent ? (
          <div className="flex flex-col gap-4">
            <p className="leading-7">This is a {recurrent} recurring budget. How would you like to delete it?</p>

            <RadioGroup value={deletionMode} onValueChange={(value) => setDeletionMode(value as 'instance' | 'series')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="instance" id="instance" disabled={isLoading} />
                <Label htmlFor="instance" className="font-normal cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-semibold">Delete only this instance</span>
                    <span className="text-sm text-muted-foreground">
                      The series will continue and new budgets will be created
                    </span>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="series" id="series" disabled={isLoading} />
                <Label htmlFor="series" className="font-normal cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-semibold">Stop the series from this date</span>
                    <span className="text-sm text-muted-foreground">
                      This and all future budgets in the series will be deleted
                    </span>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        ) : (
          <p className="leading-7">You are about to delete a budget</p>
        )}

        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-4 text-muted-foreground">
            <Spinner className="size-5" />
            <span className="text-sm font-medium">
              {deletionMode === 'series' ? 'Stopping series...' : 'Deleting budget...'}
            </span>
          </div>
        )}

        <DialogFooter>
          <Button disabled={isLoading} variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={isLoading} variant="destructive" onClick={handleDelete}>
            {deletionMode === 'series' ? 'Stop Series' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteForm;
