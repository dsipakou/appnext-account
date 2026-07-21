// System
// UI
import { Trash } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useSWRConfig } from 'swr';

import ConfirmClearRatesForm from '@/components/currencies/forms/ConfirmClearRatesForm';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { MaskedInput } from '@/components/ui/currency-input';
import * as Dlg from '@/components/ui/dialog';
import * as Frm from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
// Hooks
import { RateResponse, useCreateBatchedRates, useRatesOnDate } from '@/hooks/rates';
// Utils
import { getFormattedDate } from '@/utils/dateUtils';
import { extractErrorMessage } from '@/utils/stringUtils';

// Types
import { Currency, RateItemPostRequest, RatePostRequest } from '../types';

interface Types {
  currencies: Currency[];
}

interface FormData {
  rateDate: Date;
  [dynamicKey: string]: number | string;
}

const AddRatesForm: React.FC<Types> = ({ currencies = [] }) => {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [isClearRatesDialogOpen, setIsClearRatesDialogOpen] = React.useState<boolean>(false);

  const { mutate } = useSWRConfig();
  const { toast } = useToast();
  const form = useForm<FormData>();

  const { data: ratesOnDate = [], url } = useRatesOnDate(getFormattedDate(selectedDate));
  const { trigger: createBatchedRates, isMutating: isCreating } = useCreateBatchedRates();

  React.useEffect(() => {
    form.setValue('rateDate', selectedDate);
    if (currencies.length > 0) {
      currencies.forEach((item: Currency) => {
        form.setValue(item.uuid, '');
      });
    }

    if (ratesOnDate.length === 0) return;

    ratesOnDate.forEach((item: RateResponse) => {
      form.setValue(item.currency, item.rate);
    });
  }, [selectedDate, ratesOnDate]);

  const changeDate = (day: Date | undefined) => {
    if (day != null) {
      setSelectedDate(day);
    }
  };

  const getBaseCurrency = (): Currency => {
    return currencies.find((item: Currency) => item.isBase)!;
  };

  const prepareSaveRequest = (formData: FormData): RatePostRequest => {
    const requestPayload: RatePostRequest = {
      baseCurrency: getBaseCurrency().uuid,
      items: [],
      rateDate: getFormattedDate(formData.rateDate),
    };

    Object.keys(formData).forEach((uuid: string) => {
      if (uuid === 'rateDate') return;

      const normalizedRate: number =
        typeof formData[uuid] === 'number'
          ? Number(formData[uuid])
          : Number(String(formData[uuid]).replace(/[^0-9.]/g, ''));
      const rateItem: RateItemPostRequest = {
        currency: uuid,
        rate: String(normalizedRate),
      };
      if (normalizedRate !== 0) requestPayload.items.push(rateItem);
    });

    return requestPayload;
  };

  const handleSave = async (formData: FormData): Promise<void> => {
    const payload = prepareSaveRequest(formData);

    try {
      await createBatchedRates(payload);
      //TODO: does not mutating

      mutate(url);
      mutate((key) => typeof key === 'string' && key.includes('rates?limit='), undefined);
      toast({
        title: 'Saved!',
      });
    } catch (error) {
      const message = extractErrorMessage(error);
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: message,
      });
    }
  };

  return (
    <Dlg.Dialog>
      <Dlg.DialogTrigger asChild className="mx-2">
        <Button variant="outline" className="border-blue-500 text-blue-500 hover:text-blue-600">
          + Add rates
        </Button>
      </Dlg.DialogTrigger>
      <Dlg.DialogContent>
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Add or update rates for currencies</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <Frm.Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
            <div className="flex space-y-3">
              <div className="flex w-1/3 flex-col space-y-2">
                {currencies.map(
                  (item: Currency) =>
                    !item.isBase && (
                      <div className="flex" key={item.uuid}>
                        <Frm.FormField
                          control={form.control}
                          name={item.uuid}
                          render={({ field }) => (
                            <Frm.FormItem className="flex items-center gap-2">
                              <Frm.FormControl>
                                <MaskedInput
                                  mask="0.0000"
                                  definitions={{
                                    0: /[0-9]/,
                                  }}
                                />
                              </Frm.FormControl>
                              <Frm.FormLabel>{item.sign}</Frm.FormLabel>
                            </Frm.FormItem>
                          )}
                        />
                      </div>
                    ),
                )}
              </div>
              <div>
                <Frm.FormField
                  control={form.control}
                  name="rateDate"
                  render={({ field }) => (
                    <Frm.FormItem>
                      <Frm.FormControl>
                        <Calendar
                          disabled={isCreating}
                          mode="single"
                          selected={field.value}
                          onSelect={changeDate}
                          weekStartsOn={1}
                          initialFocus
                        />
                      </Frm.FormControl>
                      <Frm.FormMessage />
                    </Frm.FormItem>
                  )}
                />
              </div>
            </div>
            <div className="flex justify-between gap-2">
              <Button disabled={isCreating} type="submit">
                Save
              </Button>
              {ratesOnDate.length > 0 && (
                <>
                  <Button type="button" variant="ghost" onClick={() => setIsClearRatesDialogOpen(true)}>
                    <Trash className="h-5 w-5 text-red-500" />
                  </Button>
                  <ConfirmClearRatesForm
                    date={selectedDate}
                    open={isClearRatesDialogOpen}
                    handleClose={() => setIsClearRatesDialogOpen(false)}
                  />
                </>
              )}
            </div>
          </form>
        </Frm.Form>
      </Dlg.DialogContent>
    </Dlg.Dialog>
  );
};

export default AddRatesForm;
