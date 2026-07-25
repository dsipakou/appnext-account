import { Info } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React from 'react';
import { useSWRConfig } from 'swr';
import * as z from 'zod';

// UI
import { Button } from '@/components/ui/button';
import * as Dlg from '@/components/ui/dialog';
import * as Field from '@/components/ui/field';
import * as Frm from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import * as Tlp from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
// Hooks
import { useCreateCurrency } from '@/hooks/currencies';
// Utils
import { extractErrorMessage } from '@/utils/stringUtils';

interface Types {
  handleClose: () => void;
}

const formSchema = z.object({
  verbalName: z.string().min(2, { message: 'Must be at least 2 characters long' }),
  code: z.string().length(3, {
    message: 'Must be 3 characters long',
  }),
  sign: z.string({
    message: 'You need to specify currency sign',
  }),
  isDefault: z.boolean().optional(),
  comments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddForm: React.FC<Types> = ({ handleClose }) => {
  const { mutate } = useSWRConfig();
  const { update: updateSession } = useSession();
  const [values, setValues] = React.useState<FormValues>({
    verbalName: '',
    code: '',
    sign: '',
    isDefault: false,
    comments: '',
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormValues, string>>>({});

  const { toast } = useToast();
  const { trigger: createCurrency, isMutating: isCreating } = useCreateCurrency();

  const handleSave = async (payload: FormValues) => {
    try {
      const currency = await createCurrency(payload);
      if (currency.isBase) {
        updateSession({ currency: payload.code });
      }
      toast({
        title: 'Saved!',
      });
      mutate((key) => typeof key === 'string' && key.includes('rates/'), undefined);
      handleClose();
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
    await handleSave(result.data);
  };

  return (
    <Dlg.Dialog onOpenChange={cleanFormErrors}>
      <Dlg.DialogTrigger asChild className="mx-2">
        <Button>+ Add currency</Button>
      </Dlg.DialogTrigger>
      <Dlg.DialogContent>
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Add currency</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <Frm.Form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col space-y-3">
            <div className="flex w-full">
              <div className="flex w-2/3">
                <Field.Field name="verbalName">
                  <Field.FieldLabel>Currency name</Field.FieldLabel>
                  <Input
                    className="w-full"
                    disabled={isCreating}
                    placeholder="US Dollar"
                    id="verbalName"
                    value={values.verbalName}
                    onChange={(event) => setValues((current) => ({ ...current, verbalName: event.target.value }))}
                  />
                  <Field.FieldError>{errors.verbalName}</Field.FieldError>
                </Field.Field>
              </div>
              <div className="flex w-1/3">
                <Field.Field name="sign">
                  <Field.FieldLabel>Sign</Field.FieldLabel>
                  <Input
                    className="w-full"
                    disabled={isCreating}
                    placeholder="$"
                    maxLength={2}
                    id="sign"
                    value={values.sign}
                    onChange={(event) => setValues((current) => ({ ...current, sign: event.target.value }))}
                  />
                  <Field.FieldError>{errors.sign}</Field.FieldError>
                </Field.Field>
              </div>
            </div>
            <div className="flex w-full items-end">
              <div className="flex w-1/2">
                <Field.Field name="code">
                  <Field.FieldLabel>Code</Field.FieldLabel>
                  <Input
                    className="w-full"
                    disabled={isCreating}
                    placeholder="USD"
                    maxLength={3}
                    id="code"
                    value={values.code}
                    onChange={(event) => setValues((current) => ({ ...current, code: event.target.value }))}
                  />
                  <Field.FieldError>{errors.code}</Field.FieldError>
                </Field.Field>
              </div>
              <div className="flex w-1/2 pb-2">
                <Field.Field name="isDefault">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isDefault"
                      checked={values.isDefault}
                      onCheckedChange={(isDefault) => setValues((current) => ({ ...current, isDefault }))}
                      disabled={isCreating}
                    />
                    <Field.FieldLabel htmlFor="isDefault">make it default</Field.FieldLabel>
                    <Tlp.TooltipProvider>
                      <Tlp.Tooltip>
                        <Tlp.TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-black" />
                        </Tlp.TooltipTrigger>
                        <Tlp.TooltipContent>
                          <p>
                            Making this currency as default <br />
                            will make current default currency as non-default
                          </p>
                        </Tlp.TooltipContent>
                      </Tlp.Tooltip>
                    </Tlp.TooltipProvider>
                  </div>
                  <Field.FieldError>{errors.isDefault}</Field.FieldError>
                </Field.Field>
              </div>
            </div>
            <div className="flex pt-6">
              <Field.Field name="comments">
                <Textarea
                  placeholder="Any comments"
                  className="resize-none"
                  disabled={isCreating}
                  value={values.comments ?? ''}
                  onChange={(event) => setValues((current) => ({ ...current, comments: event.target.value }))}
                />
                <Field.FieldError>{errors.comments}</Field.FieldError>
              </Field.Field>
            </div>
          </div>
          <Button type="submit">Save</Button>
        </Frm.Form>
      </Dlg.DialogContent>
    </Dlg.Dialog>
  );
};

export default AddForm;
