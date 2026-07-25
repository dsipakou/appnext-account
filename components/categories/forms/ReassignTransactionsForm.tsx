import { Repeat } from 'lucide-react';
import React from 'react';
import * as z from 'zod';

import { ConfirmTransactionsTransferForm } from '@/components/categories/forms';
import { Category, CategoryType } from '@/components/categories/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Form } from '@/components/ui/form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Repeat className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage category</DialogTitle>
        </DialogHeader>
        <Form className="space-y-8">
          <div className="flex flex-col space-y-3">
            <div className="flex w-full">
              <Field name="category">
                <FieldLabel>Re-assign transactions from this category to</FieldLabel>
                <Select onValueChange={(category) => setValues({ category })} value={values.category || undefined}>
                  <SelectTrigger className="relative w-full">
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {parentCategories.map((parent: Category) =>
                        getChildren(parent.uuid).map((category: Category) => (
                          <SelectItem key={category.uuid} value={category.uuid}>
                            {parent.name} / {category.name}
                          </SelectItem>
                        )),
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{errors.category}</FieldError>
              </Field>
            </div>
          </div>
        </Form>
        <Button disabled={!values.category} onClick={handleTransfer}>
          Transfer
        </Button>
        {isConfirmTransferOpen && (
          <ConfirmTransactionsTransferForm
            open={isConfirmTransferOpen}
            setOpen={setIsConfirmTransferOpen}
            sourceCategory={sourceCategory}
            destCategory={values.category}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReassignTransactionsForm;
