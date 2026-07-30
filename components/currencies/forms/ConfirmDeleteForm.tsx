import React from 'react';
import { useSWRConfig } from 'swr';

import { Button } from '@/components/ui/button';
import * as Dlg from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useCurrencies, useDeleteCurrency } from '@/hooks/currencies';

import { Currency } from '../types';

interface Types {
  uuid: string;
  open: boolean;
  handleClose: () => void;
}

const ConfirmDeleteForm: React.FC<Types> = ({ open = false, uuid, handleClose }) => {
  const [currency, setCurrency] = React.useState<Currency>();
  const { data: currencies = [] } = useCurrencies();
  const { mutate } = useSWRConfig();
  const { toast } = useToast();
  const { trigger: deleteCurrency, isMutating: isDeleting } = useDeleteCurrency(uuid);

  React.useEffect(() => {
    if (!currencies.length) return;

    const _currency = currencies.find((item: Currency) => item.uuid === uuid);
    setCurrency(_currency);
  }, [currencies, uuid]);

  const handleDelete = async () => {
    if (currency == null) return;

    try {
      await deleteCurrency();
      mutate('currencies/');
      handleClose();
      toast({
        title: 'Deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Please, try again',
      });
    }
  };

  return (
    <Dlg.Dialog open={open} onOpenChange={handleClose}>
      <Dlg.DialogTrigger></Dlg.DialogTrigger>
      <Dlg.DialogPopup>
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Please, confirm deletion</Dlg.DialogTitle>
          <Dlg.DialogDescription>You are about to delete {currency?.code} currency</Dlg.DialogDescription>
        </Dlg.DialogHeader>
        <Dlg.DialogFooter>
          <Dlg.DialogClose render={<Button variant="ghost" />}>Cancel</Dlg.DialogClose>
          <Button disabled={isDeleting} variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </Dlg.DialogFooter>
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default ConfirmDeleteForm;
