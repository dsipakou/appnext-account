import EmojiPicker from 'emoji-picker-react';
import { X } from 'lucide-react';
import React from 'react';
import { useSWRConfig } from 'swr';
import * as z from 'zod';

import { Category, CategoryResponse } from '@/components/categories/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverClose, PopoverPopup, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useCategories, useUpdateCategory } from '@/hooks/categories';
import { extractErrorMessage } from '@/utils/stringUtils';

interface Types {
  uuid: string;
}

const formSchema = z.object({
  name: z.string().min(2),
  parent: z.uuid().nullable(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const EditForm: React.FC<Types> = ({ uuid }) => {
  const { mutate } = useSWRConfig();
  const { data: categories = [] } = useCategories();
  const { toast } = useToast();
  const { trigger: updateCategory, isMutating: isUpdating } = useUpdateCategory(uuid);

  const [parentList, setParentList] = React.useState<Category[]>([]);
  const [selectedEmoji, setSelectedEmoji] = React.useState<string | null>(null);
  const [values, setValues] = React.useState<FormValues>({ name: '', parent: null, description: '' });
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormValues, string>>>({});

  React.useEffect(() => {
    if (!categories) return;

    const _category = categories.find((item: CategoryResponse) => item.uuid === uuid);

    if (_category == null) return;

    const _parentCategories = categories.filter(
      (item: Category) => item.parent === null && item.type === _category.type,
    );

    setValues({
      name: _category.name,
      parent: _category.parent,
      description: _category.description || '',
    });

    setParentList(_parentCategories);
  }, [categories, uuid]);

  const handleSave = async (payload: FormValues) => {
    try {
      await updateCategory({
        ...payload,
        icon: selectedEmoji,
      });
      mutate('categories/');
      toast({
        title: 'Category updated',
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = formSchema.safeParse(values);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      setErrors({
        name: fieldErrors.name?.[0],
        parent: fieldErrors.parent?.[0],
        description: fieldErrors.description?.[0],
      });
      return;
    }

    setErrors({});
    await handleSave(result.data);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit category</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger render={<Button variant="outline" />}>Choose icon</PopoverTrigger>
            <PopoverPopup className="w-100 flex justify-center" sideOffset={5}>
              <div>
                <EmojiPicker
                  className="mt-5 flex h-20"
                  skinTonesDisabled={true}
                  onEmojiClick={(event) => setSelectedEmoji(event.emoji)}
                />
              </div>
              <PopoverClose className="absolute right-5 top-5">
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
        <Form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col space-y-3">
            <div className="flex w-full">
              <Field name="name">
                <FieldLabel>Category name</FieldLabel>
                <Input
                  className="w-full"
                  disabled={isUpdating}
                  id="name"
                  value={values.name}
                  onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
                />
                <FieldError>{errors.name}</FieldError>
              </Field>
            </div>
            {values.parent && (
              <div className="flex w-full">
                <Field name="parent">
                  <Select
                    onValueChange={(parentValue) => setValues((current) => ({ ...current, parent: parentValue }))}
                    value={values.parent || undefined}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="relative w-full">
                      <SelectValue placeholder="Choose parent category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {parentList.map((category: Category) => (
                          <SelectItem key={category.uuid} value={category.uuid}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError>{errors.parent}</FieldError>
                </Field>
              </div>
            )}
            <div className="flex pt-6">
              <Field name="description">
                <Textarea
                  placeholder="Add description if you want"
                  className="resize-none"
                  disabled={isUpdating}
                  value={values.description ?? ''}
                  onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
                />
                <FieldError>{errors.description}</FieldError>
              </Field>
            </div>
          </div>
          <Button disabled={isUpdating} type="submit">
            Save
          </Button>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditForm;
