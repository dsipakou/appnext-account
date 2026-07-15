import { zodResolver } from '@hookform/resolvers/zod';
import EmojiPicker from 'emoji-picker-react';
import { X } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useSWRConfig } from 'swr';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useCategories, useCreateCategory } from '@/hooks/categories';

import { Category, CategoryType } from '../types';

const formSchema = z
  .object({
    title: z.string().min(2, {
      message: 'Must be at least 2 characters long',
    }),
    type: z.nativeEnum(CategoryType),
    isParent: z.boolean(),
    parentCategory: z.string().uuid().optional(),
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

interface Types {
  parent?: Category | undefined;
}

const AddForm: React.FC<Types> = ({ parent }) => {
  const { data: categories = [] } = useCategories();
  const { trigger: createCategory, isMutating: isCreating } = useCreateCategory();

  const [parentList, setParentList] = React.useState<Category[]>([]);
  const [selectedEmoji, setSelectedEmoji] = React.useState<string | null>(null);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      type: CategoryType.Expense,
      isParent: false,
    },
  });

  const watchIsParent = form.watch('isParent');
  const watchType = form.watch('type');

  React.useEffect(() => {
    if (!categories) return;

    const parents = categories.filter(
      (category: Category) => category.parent === null && category.type !== CategoryType.Income,
    );
    setParentList(parents);
  }, [categories]);

  React.useEffect(() => {
    if (!watchIsParent) {
      form.setValue('parentCategory', undefined);
    }
  }, [watchIsParent]);

  React.useEffect(() => {
    if (parent != null) {
      form.setValue('isParent', true);
      form.setValue('parentCategory', parent.uuid);
    }
  }, [parent]);

  const handleSave = async (payload: z.infer<typeof formSchema>) => {
    try {
      await createCategory({
        icon: selectedEmoji,
        name: payload.title,
        parent: payload.parentCategory || '',
        type: payload.type,
        description: payload.description,
      });
      toast({
        title: 'Saved!',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'Please, check your fields',
      });
    }
  };

  const cleanFormErrors = (open: boolean) => {
    if (!open) {
      form.clearErrors();
      form.reset();
      setSelectedEmoji(null);
    }
  };

  return (
    <Dialog onOpenChange={cleanFormErrors}>
      <DialogTrigger asChild>
        <Button>+ Add Category</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add category</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Choose icon</Button>
            </PopoverTrigger>
            <PopoverContent className="flex w-[400px] justify-center" sideOffset={5}>
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
            </PopoverContent>
          </Popover>
          <span>{selectedEmoji}</span>
          {selectedEmoji && (
            <Button variant="link" onClick={() => setSelectedEmoji(null)}>
              <X className="mr-2 h-4 w-4" />
              <span>clear icon</span>
            </Button>
          )}
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
            <div className="flex flex-col space-y-3">
              <div className="flex w-full">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category title</FormLabel>
                      <FormControl>
                        <Input className="w-full" disabled={isCreating} id="title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category type</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isCreating || parent}
                        >
                          <SelectTrigger className="relative w-full">
                            <SelectValue placeholder="Category type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value={CategoryType.Income}>Income</SelectItem>
                              <SelectItem value={CategoryType.Expense}>Expense</SelectItem>
                              <SelectItem value={CategoryType.CapitalExpense}>Capital Expense</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex">
                {watchType !== CategoryType.Income && (
                  <div className="flex h-12 w-1/2 items-center">
                    <FormField
                      control={form.control}
                      name="isParent"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="isParent"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isCreating || parent}
                              />
                              <Label htmlFor="isParent">Has parent</Label>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                {watchType !== CategoryType.Income && watchIsParent && (
                  <div className="flex w-1/2">
                    <FormField
                      control={form.control}
                      name="parentCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isCreating || parent}
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Add description if you want"
                          className="resize-none"
                          disabled={isCreating}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button type="submit">Save</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddForm;
