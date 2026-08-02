import React from 'react';
import { useSWRConfig } from 'swr';

import { Button } from '@/components/ui/button';
import * as Dlg from '@/components/ui/dialog';
import { toastManager } from '@/components/ui/toast';
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
  const handleClear = async () => {
    try {
      await deleteCurrency();
      mutate(`rates/day/${getFormattedDate(date)}`);
      handleClose();
      toastManager.add({
        id: 'currency-rates-clear',
        title: 'Rates cleared successfully',
        type: 'success',
      });
    } catch (error) {
      const message = extractErrorMessage(error);
      if (message.error?.includes('There are transactions')) {
        toastManager.add({
          id: 'currency-rates-clear-has-transactions',
          title: 'This date contains transactions',
          description: 'You need to delete transactions first',
          type: 'error',
        });
      } else {
        toastManager.add({
          id: 'currency-rates-clear-error',
          title: 'Cannot clear rates.',
          type: 'error',
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
