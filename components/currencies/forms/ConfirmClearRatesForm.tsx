import React from 'react';
import { useSWRConfig } from 'swr';

import { Button } from '@/components/ui/button';
import * as Dlg from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useClearCurrenciesOnDate } from '@/hooks/currencies';
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
    <Dlg.Dialog open={open} onOpenChange={handleClose}>
      <Dlg.DialogPopup>
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Please, confirm clearing</Dlg.DialogTitle>
          <Dlg.DialogDescription>You are about to clear rates for {getFormattedDate(date)}</Dlg.DialogDescription>
        </Dlg.DialogHeader>
        <Dlg.DialogFooter>
          <Dlg.DialogClose render={<Button variant="ghost" />}>Cancel</Dlg.DialogClose>
          <Button disabled={isClearing} variant="destructive" onClick={handleClear}>
            Delete
          </Button>
        </Dlg.DialogFooter>
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default ConfirmClearRatesForm;
