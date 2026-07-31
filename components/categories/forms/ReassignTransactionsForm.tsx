import { Repeat } from 'lucide-react';
import React from 'react';
import * as z from 'zod';

import { ConfirmTransactionsTransferForm } from '@/components/categories/forms';
import { Category, CategoryType } from '@/components/categories/types';
import { Button } from '@/components/ui/button';
import * as Dlg from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Form } from '@/components/ui/form';
import * as Slc from '@/components/ui/select';
import { useCategories } from '@/hooks/categories';

const formSchema = z.object({
  category: z.string().min(1, { error: 'Please choose category' }),
});

type FormValues = z.infer<typeof formSchema>;

interface Types {
  uuid: string;
}

const ReassignTransactionsForm: React.FC<Types> = ({ uuid }) => {
  const [isConfirmTransferOpen, setIsConfirmTransferOpen] = React.useState<boolean>(false);
  const [values, setValues] = React.useState<FormValues>({ category: '' });
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormValues, string>>>({});

  const { data: categories = [] } = useCategories();

  const parentCategories = categories.filter(
    (item: Category) => item.parent === null && item.type === CategoryType.Expense,
  );
  const sourceCategory = categories.find((item: Category) => item.uuid === uuid);

  const getChildren = (parentUuid: string) =>
    categories.filter((item: Category) => item.parent === parentUuid && item.uuid !== uuid);

  const handleTransfer = () => {
    const result = formSchema.safeParse(values);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      setErrors({ category: fieldErrors.category?.[0] });
      return;
    }

    setErrors({});
    setIsConfirmTransferOpen(true);
  };

  return (
    <Dlg.Dialog>
      <Dlg.DialogTrigger render={<Button size="sm" variant="ghost" />}>
        <Repeat className="h-4 w-4" />
      </Dlg.DialogTrigger>
      <Dlg.DialogPopup>
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Manage category</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <Form className="contents">
          <Dlg.DialogPanel>
            <div className="flex w-full">
              <Field name="category">
                <FieldLabel>Re-assign transactions from this category to</FieldLabel>
                <Slc.Select
                  onValueChange={(category) => setValues({ category })}
                  value={values.category || undefined}
                  items={categories.map((item: Category) => ({
                    label: item.name,
                    value: item.uuid,
                  }))}
                >
                  <Slc.SelectTrigger className="relative w-full">
                    <Slc.SelectValue placeholder="Choose category" />
                  </Slc.SelectTrigger>
                  <Slc.SelectPopup>
                    <Slc.SelectGroup>
                      {parentCategories.map((parent: Category) =>
                        getChildren(parent.uuid).map((item: Category) => (
                          <Slc.SelectItem key={item.uuid} value={item.uuid}>
                            {parent.icon} {parent.name} / {item.name}
                          </Slc.SelectItem>
                        )),
                      )}
                    </Slc.SelectGroup>
                  </Slc.SelectPopup>
                </Slc.Select>
                <FieldError>{errors.category}</FieldError>
              </Field>
            </div>
          </Dlg.DialogPanel>
          <Dlg.DialogFooter>
            <Dlg.DialogClose render={<Button variant="ghost" />}>Cancel</Dlg.DialogClose>
            <Button disabled={!values.category} onClick={handleTransfer}>
              Transfer
            </Button>
          </Dlg.DialogFooter>
        </Form>
        {isConfirmTransferOpen && (
          <ConfirmTransactionsTransferForm
            open={isConfirmTransferOpen}
            setOpen={setIsConfirmTransferOpen}
            sourceCategory={sourceCategory}
            destCategory={values.category}
          />
        )}
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default ReassignTransactionsForm;
