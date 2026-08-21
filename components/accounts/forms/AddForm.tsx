import { FC, useMemo, useState } from 'react';
import { useSWRConfig } from 'swr';
import * as z from 'zod';

import { CategoryType } from '@/components/categories/types';
import { Button } from '@/components/ui/button';
import * as Dlg from '@/components/ui/dialog';
import { type FormErrors } from '@/components/ui/form';
import { toastManager } from '@/components/ui/toast';
import { useCreateAccount } from '@/hooks/accounts';
import { useCategories } from '@/hooks/categories';
import { useUsers } from '@/hooks/users';

import GenericForm, { GenericFormValues } from './GenericForm';

interface Types {
  customTrigger?: React.ReactElement;
}

const formSchema = z.object({
  kind: z.enum(['savings', 'spending']),
  title: z.string().min(2, {
    error: 'Title must be at least 2 characters',
  }),
  user: z.uuid({
    error: 'Please, select user',
  }),
  category: z.string(),
  description: z.string().optional(),
});

const getDefaultValues = (): GenericFormValues => ({
  kind: 'spending',
  title: '',
  user: '',
  category: '',
  description: '',
});

const AddForm: FC<Types> = ({ customTrigger }) => {
  const { mutate } = useSWRConfig();

  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<GenericFormValues>(getDefaultValues());
  const [errors, setErrors] = useState<FormErrors>({});

  const { data: users = [] } = useUsers();
  const { data: categories = [] } = useCategories();

  const { trigger: createAccount, isMutating: isCreating } = useCreateAccount();

  const incomeCategories = useMemo(() => categories.filter((item) => item.type === CategoryType.Income), [categories]);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = formSchema.safeParse(values);

    if (!result.success) {
      setErrors(z.flattenError(result.error).fieldErrors);
      return;
    }

    setErrors({});

    try {
      await createAccount(result.data);

      mutate('accounts/');

      setOpen(false);
      setValues(getDefaultValues());

      toastManager.add({
        id: 'account-create',
        title: 'Saved!',
        type: 'success',
      });
    } catch {
      toastManager.add({
        id: 'account-create-error',
        title: 'Something went wrong',
        type: 'error',
      });
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setErrors({});
      setValues(getDefaultValues());
    }
  };

  const defaultTrigger = <Button className="mx-2">+ Add account</Button>;

  return (
    <Dlg.Dialog open={open} onOpenChange={handleOpenChange}>
      <Dlg.DialogTrigger render={customTrigger || defaultTrigger} />

      <Dlg.DialogPopup>
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Add account</Dlg.DialogTitle>
        </Dlg.DialogHeader>

        <GenericForm
          values={values}
          errors={errors}
          users={users}
          incomeCategories={incomeCategories}
          isSubmitting={isCreating}
          onChange={setValues}
          onSubmit={handleSubmit}
        />
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default AddForm;
