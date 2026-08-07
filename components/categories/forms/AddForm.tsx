import EmojiPicker from 'emoji-picker-react';
import { X } from 'lucide-react';
import React from 'react';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import * as Dlg from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Form, type FormErrors } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverClose, PopoverPopup, PopoverTrigger } from '@/components/ui/popover';
import * as Slc from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toastManager } from '@/components/ui/toast';
import { useCategories, useCreateCategory } from '@/hooks/categories';

import { Category, CategoryType } from '../types';

const formSchema = z
  .object({
    title: z.string().min(2, {
      message: 'Must be at least 2 characters long',
    }),
    type: z.nativeEnum(CategoryType),
    isParent: z.boolean(),
    parentCategory: z.uuid().optional(),
    description: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.type !== CategoryType.Income && values.isParent && !values.parentCategory) {
      ctx.addIssue({
        message: 'Non-parent category should have parent selected',
        code: z.ZodIssueCode.custom,
        path: ['parentCategory'],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

interface Types {
  parent?: Category | undefined;
}

const AddForm: React.FC<Types> = ({ parent }) => {
  const { data: categories = [] } = useCategories();
  const { trigger: createCategory, isMutating: isCreating } = useCreateCategory();

  const [parentList, setParentList] = React.useState<Category[]>([]);
  const [selectedEmoji, setSelectedEmoji] = React.useState<string | null>(null);
  const [values, setValues] = React.useState<FormValues>({
    title: '',
    type: CategoryType.Expense,
    isParent: false,
    parentCategory: undefined,
    description: '',
  });
  const [errors, setErrors] = React.useState<FormErrors>({});

  React.useEffect(() => {
    if (!categories) return;

    const parents = categories.filter(
      (category: Category) => category.parent === null && category.type !== CategoryType.Income,
    );
    setParentList(parents);
  }, [categories]);

  React.useEffect(() => {
    if (!values.isParent) {
      setValues((current) => ({ ...current, parentCategory: undefined }));
    }
  }, [values.isParent]);

  React.useEffect(() => {
    if (parent != null) {
      setValues((current) => ({ ...current, isParent: true, parentCategory: parent.uuid }));
    }
  }, [parent]);

  const handleSave = async (payload: FormValues) => {
    try {
      await createCategory({
        icon: selectedEmoji,
        name: payload.title,
        parent: payload.parentCategory || '',
        type: payload.type,
        description: payload.description,
      });
      toastManager.add({
        id: 'category-create',
        title: 'Saved!',
        type: 'success',
      });
    } catch {
      toastManager.add({
        id: 'category-create-error',
        title: 'Something went wrong',
        description: 'Please, check your fields',
        type: 'error',
      });
    }
  };

  const cleanFormErrors = (open: boolean) => {
    if (!open) {
      setErrors({});
      setValues({
        title: '',
        type: CategoryType.Expense,
        isParent: false,
        parentCategory: undefined,
        description: '',
      });
      setSelectedEmoji(null);
    }
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = formSchema.safeParse(values);

    if (!result.success) {
      setErrors(z.flattenError(result.error).fieldErrors);
      return;
    }

    setErrors({});
    await handleSave(result.data);
  };

  return (
    <Dlg.Dialog onOpenChange={cleanFormErrors}>
      <Dlg.DialogTrigger render={<Button />}>+ Add Category</Dlg.DialogTrigger>
      <Dlg.DialogPopup>
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Add category</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <Form errors={errors} onSubmit={handleSubmit} className="contents">
          <Dlg.DialogPanel>
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger render={<Button variant="outline" />}>Choose icon</PopoverTrigger>
                <PopoverPopup className="flex w-100 justify-center" sideOffset={5}>
                  <div>
                    <EmojiPicker
                      className="mt-5 flex h-20"
                      skinTonesDisabled={true}
                      onEmojiClick={(event) => setSelectedEmoji(event.emoji)}
                    />
                  </div>
                  <PopoverClose className="absolute top-5 right-5">
                    <X className="h-4 w-4" />
                  </PopoverClose>
                </PopoverPopup>
              </Popover>
              <span>{selectedEmoji}</span>
              {selectedEmoji && (
                <Button variant="link" onClick={() => setSelectedEmoji(null)}>
                  <X className="mr-2 h-4 w-4" />
                  <span>clear icon</span>
                </Button>
              )}
            </div>
            <div className="flex w-full">
              <Field name="title">
                <FieldLabel>Category title</FieldLabel>
                <Input
                  className="w-full"
                  disabled={isCreating}
                  id="title"
                  value={values.title}
                  onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
                />
                <FieldError />
              </Field>
            </div>
            <div>
              <Field name="type">
                <FieldLabel>Category type</FieldLabel>
                <Slc.Select
                  onValueChange={(type) => setValues((current) => ({ ...current, type: type as CategoryType }))}
                  value={values.type}
                  disabled={isCreating || !!parent}
                  items={[
                    { label: 'Income', value: CategoryType.Income },
                    { label: 'Expense', value: CategoryType.Expense },
                    { label: 'Capital Expense', value: CategoryType.CapitalExpense },
                  ]}
                >
                  <Slc.SelectTrigger className="relative w-full">
                    <Slc.SelectValue placeholder="Category type" />
                  </Slc.SelectTrigger>
                  <Slc.SelectContent>
                    <Slc.SelectGroup>
                      <Slc.SelectItem value={CategoryType.Income}>Income</Slc.SelectItem>
                      <Slc.SelectItem value={CategoryType.Expense}>Expense</Slc.SelectItem>
                      <Slc.SelectItem value={CategoryType.CapitalExpense}>Capital Expense</Slc.SelectItem>
                    </Slc.SelectGroup>
                  </Slc.SelectContent>
                </Slc.Select>
                <FieldError />
              </Field>
            </div>
            <div className="flex">
              {values.type !== CategoryType.Income && (
                <div className="flex h-12 w-1/2 items-center">
                  <Field name="isParent">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isParent"
                        checked={values.isParent}
                        onCheckedChange={(isParent) => setValues((current) => ({ ...current, isParent }))}
                        disabled={isCreating || !!parent}
                      />
                      <FieldLabel htmlFor="isParent">Has parent</FieldLabel>
                    </div>
                    <FieldError />
                  </Field>
                </div>
              )}
              {values.type !== CategoryType.Income && values.isParent && (
                <div className="flex w-1/2">
                  <Field name="parentCategory">
                    <Slc.Select
                      onValueChange={(parentCategory) => setValues((current) => ({ ...current, parentCategory }))}
                      value={values.parentCategory}
                      disabled={isCreating || !!parent}
                      items={parentList.map((item: Category) => ({
                        label: item.icon + '  ' + item.name,
                        value: item.uuid,
                      }))}
                    >
                      <Slc.SelectTrigger className="relative w-full">
                        <Slc.SelectValue placeholder="Choose parent category" />
                      </Slc.SelectTrigger>
                      <Slc.SelectContent>
                        <Slc.SelectGroup>
                          {parentList.map((item: Category) => (
                            <Slc.SelectItem key={item.uuid} value={item.uuid}>
                              <span className="mr-2">{item.icon}</span>
                              <span>{item.name}</span>
                            </Slc.SelectItem>
                          ))}
                        </Slc.SelectGroup>
                      </Slc.SelectContent>
                    </Slc.Select>
                    <FieldError />
                  </Field>
                </div>
              )}
            </div>
            <div>
              <Field name="description">
                <Textarea
                  placeholder="Add description if you want"
                  className="resize-none"
                  disabled={isCreating}
                  value={values.description ?? ''}
                  onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
                />
                <FieldError />
              </Field>
            </div>
          </Dlg.DialogPanel>
          <Dlg.DialogFooter>
            <Dlg.DialogClose render={<Button variant="ghost" />}>Cancel</Dlg.DialogClose>
            <Button type="submit">Save</Button>
          </Dlg.DialogFooter>
        </Form>
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default AddForm;
