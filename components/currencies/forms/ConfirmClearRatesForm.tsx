import React from 'react';
import * as Dialog from '@/components/ui/dialog';
import { useSWRConfig } from 'swr';
import { Button } from '@/components/ui/button';
import { useClearCurrenciesOnDate } from '@/hooks/currencies';
import { useToast } from '@/components/ui/use-toast';
import { getFormattedDate } from '@/utils/dateUtils';
import { extractErrorMessage } from '@/utils/stringUtils';

interface Types {
  date: Date;
  open: boolean;
  handleClose: () => void;
}

const ConfirmClearRatesForm: React.FC<Types> = ({ open = false, date, handleClose }) => {
  const { trigger: deleteCurrency, isMutating: isClearing } = useClearCurrenciesOnDate(getFormattedDate(date));
  const { mutate } = useSWRConfig();
  const { toast } = useToast();

  const handleClear = async () => {
    try {
      await deleteCurrency();
      mutate(`rates/day/${getFormattedDate(date)}`);
      handleClose();
      toast({
        title: 'Rates cleared successfully',
      });
    } catch (error) {
      const message = extractErrorMessage(error);
      if (message.error?.includes('There are transactions')) {
        toast({
          variant: 'destructive',
          title: 'This date contains transactions',
          description: 'You need to delete transactions first',
        });
      } else {
        toast({
          title: 'Cannot clear rates.',
        });
      }
    }
  };

  return (
    <Dialog.Dialog open={open} onOpenChange={handleClose}>
      <Dialog.DialogContent>
        <Dialog.DialogTitle>Please, confirm clearing</Dialog.DialogTitle>
        <p className="leading-7">You are about to clear rates for {getFormattedDate(date)}</p>
        <Dialog.DialogFooter>
          <Button disabled={isClearing} variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button disabled={isClearing} variant="destructive" onClick={handleClear}>
            Delete
          </Button>
        </Dialog.DialogFooter>
      </Dialog.DialogContent>
    </Dialog.Dialog>
  );
};

export default ConfirmClearRatesForm;
