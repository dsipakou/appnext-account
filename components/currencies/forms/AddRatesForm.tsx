// System
// UI
import { Trash } from 'lucide-react';
import React from 'react';
import { useSWRConfig } from 'swr';

import ConfirmClearRatesForm from '@/components/currencies/forms/ConfirmClearRatesForm';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import * as Dlg from '@/components/ui/dialog';
import * as Field from '@/components/ui/field';
import * as Frm from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toastManager } from '@/components/ui/toast';
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
  const [values, setValues] = React.useState<FormData>({ rateDate: new Date() });

  const { mutate } = useSWRConfig();
  const { data: ratesOnDate = [], url } = useRatesOnDate(getFormattedDate(selectedDate));
  const { trigger: createBatchedRates, isMutating: isCreating } = useCreateBatchedRates();

  React.useEffect(() => {
    const nextValues: FormData = { rateDate: selectedDate };

    if (currencies.length > 0) {
      currencies.forEach((item: Currency) => {
        nextValues[item.uuid] = '';
      });
    }

    ratesOnDate.forEach((item: RateResponse) => {
      nextValues[item.currency] = item.rate;
    });

    setValues(nextValues);
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
      toastManager.add({
        id: 'currency-rates-save',
        title: 'Saved!',
        type: 'success',
      });
    } catch (error) {
      const message = extractErrorMessage(error);
      toastManager.add({
        id: 'currency-rates-save-error',
        title: 'Something went wrong',
        description: message,
        type: 'error',
      });
    }
  };

  return (
    <Dlg.Dialog>
      <Dlg.DialogTrigger render={<Button variant="ghost" />}>+ Add rates</Dlg.DialogTrigger>
      <Dlg.DialogPopup>
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Add or update rates for currencies</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <Frm.Form
          onSubmit={(event) => {
            event.preventDefault();
            handleSave(values);
          }}
          className="contents"
        >
          <Dlg.DialogPanel className="flex flex-row gap-4">
            <div className="flex w-1/3 flex-col space-y-2">
              {currencies.map(
                (item: Currency) =>
                  !item.isBase && (
                    <Field.Field name={item.uuid} className="flex flex-row items-center gap-2 pr-2">
                      <Input
                        value={values[item.uuid] ?? ''}
                        onChange={(event) => {
                          let value = event.target.value;
                          value = value.replace(/,/g, '.');
                          const firstDot = value.indexOf('.');
                          if (firstDot !== -1) {
                            value = value.slice(0, firstDot + 1) + value.slice(firstDot + 1).replace(/\./g, '');
                          }
                          setValues((current) => ({
                            ...current,
                            [item.uuid]: value,
                          }));
                        }}
                      />
                      <Field.FieldLabel>{item.sign}</Field.FieldLabel>
                    </Field.Field>
                  ),
              )}
            </div>
            <div>
              <Field.Field name="rateDate">
                <Calendar
                  disabled={isCreating}
                  mode="single"
                  selected={values.rateDate}
                  onSelect={changeDate}
                  weekStartsOn={1}
                  initialFocus
                />
              </Field.Field>
            </div>
          </Dlg.DialogPanel>
          <Dlg.DialogFooter>
            <div className="flex w-full justify-between gap-2">
              {ratesOnDate.length > 0 && (
                <>
                  <Button type="button" variant="destructive" onClick={() => setIsClearRatesDialogOpen(true)}>
                    <Trash className="h-5 w-5 text-red-500" /> Clear
                  </Button>
                  <ConfirmClearRatesForm
                    date={selectedDate}
                    open={isClearRatesDialogOpen}
                    handleClose={() => setIsClearRatesDialogOpen(false)}
                  />
                </>
              )}
              <div>
                <Dlg.DialogClose render={<Button variant="ghost" />}>Cancel</Dlg.DialogClose>
                <Button disabled={isCreating} type="submit">
                  Save
                </Button>
              </div>
            </div>
          </Dlg.DialogFooter>
        </Frm.Form>
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default AddRatesForm;
