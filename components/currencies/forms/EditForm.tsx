import { Info } from 'lucide-react';
import React, { FC, useEffect } from 'react';
import { useSWRConfig } from 'swr';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { useCurrencies, useUpdateCurrency } from '@/hooks/currencies';
import { extractErrorMessage } from '@/utils/stringUtils';

import { Currency } from '../types';

interface Types {
  uuid: string;
  open: boolean;
  setOpen: (value: boolean) => void;
}

const formSchema = z.object({
  verbalName: z.string().min(2, { message: 'Must be at least 2 characters long' }),
  code: z.string().length(3, {
    message: 'Must be 3 characters long',
  }),
  sign: z.string({
    message: 'You need to specify currency sign',
  }),
  isDefault: z.boolean(),
  comments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const EditForm: FC<Types> = ({ uuid, open, setOpen }) => {
  const { mutate } = useSWRConfig();
  const { data: currencies = [] } = useCurrencies();
  const { trigger: updateCurrency, isMutating: isUpdating } = useUpdateCurrency(uuid);
  const [values, setValues] = React.useState<FormValues>({
    verbalName: '',
    code: '',
    sign: '',
    isDefault: false,
    comments: '',
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormValues, string>>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (!currencies.length) return;

    const _currency = currencies.find((item: Currency) => item.uuid === uuid);
    if (!_currency) return;

    setValues({
      verbalName: _currency.verbalName,
      code: _currency.code,
      sign: _currency.sign,
      isDefault: _currency.isDefault,
      comments: _currency.comments || '',
    });
    return () => {};
  }, [currencies, uuid]);

  const handleUpdate = async (payload: FormValues): Promise<void> => {
    try {
      await updateCurrency(payload);
      mutate('currencies/');
      cleanFormErrors(false);
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

  const cleanFormErrors = (open: boolean) => {
    if (!open) {
      setErrors({});
      setValues({ verbalName: '', code: '', sign: '', isDefault: false, comments: '' });
    }
    setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = formSchema.safeParse(values);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      setErrors({
        verbalName: fieldErrors.verbalName?.[0],
        code: fieldErrors.code?.[0],
        sign: fieldErrors.sign?.[0],
        isDefault: fieldErrors.isDefault?.[0],
        comments: fieldErrors.comments?.[0],
      });
      return;
    }

    setErrors({});
    await handleUpdate(result.data);
  };

  return (
    <Dialog open={open} onOpenChange={cleanFormErrors}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update currency details</DialogTitle>
        </DialogHeader>
        <Form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col space-y-3">
            <div className="flex w-full">
              <div className="flex w-2/3">
                <Field name="verbalName">
                  <FieldLabel>Currency name</FieldLabel>
                  <Input
                    className="w-full"
                    disabled={isUpdating}
                    placeholder="US Dollar"
                    id="verbalName"
                    value={values.verbalName}
                    onChange={(event) => setValues((current) => ({ ...current, verbalName: event.target.value }))}
                  />
                  <FieldError>{errors.verbalName}</FieldError>
                </Field>
              </div>
              <div className="flex w-1/3">
                <Field name="sign">
                  <FieldLabel>Sign</FieldLabel>
                  <Input
                    className="w-full"
                    disabled={isUpdating}
                    placeholder="$"
                    id="sign"
                    value={values.sign}
                    onChange={(event) => setValues((current) => ({ ...current, sign: event.target.value }))}
                  />
                  <FieldError>{errors.sign}</FieldError>
                </Field>
              </div>
            </div>
            <div className="flex w-full items-end">
              <div className="flex w-1/2">
                <Field name="code">
                  <FieldLabel>Code</FieldLabel>
                  <Input
                    className="w-full"
                    disabled={isUpdating}
                    placeholder="USD"
                    id="code"
                    value={values.code}
                    onChange={(event) => setValues((current) => ({ ...current, code: event.target.value }))}
                  />
                  <FieldError>{errors.code}</FieldError>
                </Field>
              </div>
              <div className="flex w-1/2 pb-2">
                <Field name="isDefault">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isDefault"
                      checked={values.isDefault}
                      onCheckedChange={(isDefault) => setValues((current) => ({ ...current, isDefault }))}
                      disabled={isUpdating}
                    />
                    <FieldLabel htmlFor="isDefault">set as default</FieldLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-black" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Making this currency as default <br />
                            will make current default currency as non-default
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FieldError>{errors.isDefault}</FieldError>
                </Field>
              </div>
            </div>
            <div className="flex pt-6">
              <Field name="comments">
                <Textarea
                  placeholder="Any comments"
                  className="resize-none"
                  disabled={isUpdating}
                  value={values.comments ?? ''}
                  onChange={(event) => setValues((current) => ({ ...current, comments: event.target.value }))}
                />
                <FieldError>{errors.comments}</FieldError>
              </Field>
            </div>
          </div>
          <Button type="submit">Save</Button>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditForm;
