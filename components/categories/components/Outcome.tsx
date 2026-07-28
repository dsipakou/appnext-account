// System
import EmojiPicker from 'emoji-picker-react';
import { Pencil, X } from 'lucide-react';
import React from 'react';
import { useSWRConfig } from 'swr';
import * as z from 'zod';

// Components
import { TransactionsForm } from '@/components/categories/forms';
import { ConfirmDeleteForm } from '@/components/categories/forms';
import * as Acd from '@/components/ui/accordion';
// UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as Ppv from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
// Hooks
import { useUpdateCategory } from '@/hooks/categories';
// Utils
import { extractErrorMessage } from '@/utils/stringUtils';

// Types
import { Category } from '../types';
import { SortableCategoryList } from './SortableCategoryList';

interface Types {
  parentCategories: Category[];
  categoriesByParent: (uuid: string) => {};
}

const popupSchema = z.object({
  name: z.string().min(2),
  parent: z.uuid().nullable(),
  description: z.string().optional(),
});

const Outcome: React.FC<Types> = ({ parentCategories, categoriesByParent }) => {
  const [errors, setErrors] = React.useState<string>('');
  const [uuid, setUuid] = React.useState<string>('');
  const [activeCategoryUuid, setActiveCategoryUuid] = React.useState<string>('');
  const [categoryName, setCategoryName] = React.useState<string>('');
  const [parent, setParent] = React.useState<string | null>('');
  const [isOpenTransactionsForm, setIsOpenTransactionsForm] = React.useState<boolean>(false);
  const [selectedEmoji, setSelectedEmoji] = React.useState<string | null>(null);

  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const { trigger: updateCategory, isMutating: isUpdating } = useUpdateCategory(uuid);

  const onOpenPopup = (open: boolean, category: Category) => {
    if (open) {
      setUuid(category.uuid);
      setCategoryName(category.name);
      setParent(category.parent);
      setSelectedEmoji(category.icon);
    }
  };

  const clickShowTransactions = (categoryUuid: string) => {
    setActiveCategoryUuid(categoryUuid);
    setIsOpenTransactionsForm(true);
  };

  const handleCloseModal = () => {
    setIsOpenTransactionsForm(false);
    setActiveCategoryUuid('');
  };

  const handleSave = async (category: Category, originalName: string) => {
    const validatedPayload = popupSchema.safeParse(category);

    if (!validatedPayload.success) {
      for (const err in validatedPayload.error.issues) {
        setErrors(err);
      }

      toast({
        variant: 'destructive',
        title: 'Please, check your input',
        description: errors.toString(),
      });
    }

    if (validatedPayload.data?.name === originalName) {
      delete validatedPayload.data.name;
    }

    try {
      await updateCategory({
        ...validatedPayload.data,
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

  const emojiPopover = () => {
    return (
      <Ppv.Popover>
        <Ppv.PopoverTrigger render={<Button variant="outline" className="flex-1" />}>Choose icon</Ppv.PopoverTrigger>
        <Ppv.PopoverPopup className="w-100 flex justify-center" sideOffset={5}>
          <div>
            <EmojiPicker
              className="mt-5 flex h-20"
              skinTonesDisabled={true}
              onEmojiClick={(event) => setSelectedEmoji(event.emoji)}
            />
          </div>
          <Ppv.PopoverClose className="absolute right-5 top-5">
            <X className="h-4 w-4" />
          </Ppv.PopoverClose>
        </Ppv.PopoverPopup>
      </Ppv.Popover>
    );
  };

  return (
    <div className="flex flex-col overflow-y-auto">
      <Acd.Accordion multiple>
        {parentCategories.map((item: Category) => (
          <Acd.AccordionItem key={item.uuid} value={item.uuid}>
            <div className="group flex h-12 w-full items-center justify-start bg-white shadow-lg">
              <Acd.AccordionTrigger className="flex items-center pl-2 text-lg">
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Acd.AccordionTrigger>
              <Ppv.Popover onOpenChange={(open) => onOpenPopup(open, item)}>
                <Ppv.PopoverTrigger>
                  <span>
                    <Pencil className="ml-3 hidden h-7 w-7 cursor-pointer p-1 hover:text-blue-400 group-hover:flex" />
                  </span>
                </Ppv.PopoverTrigger>
                <Ppv.PopoverPopup className="flex w-80 flex-col gap-3 rounded-md border-none bg-white" sideOffset={10}>
                  <Ppv.PopoverClose className="absolute right-5 top-5">
                    <X className="h-4 w-4" />
                  </Ppv.PopoverClose>
                  <span className="text-lg">Editing</span>
                  <div className="flex justify-between">
                    <div className="flex w-1/2 justify-center">
                      {selectedEmoji && (
                        <>
                          <span className="flex items-center justify-center text-2xl">{selectedEmoji}</span>
                          <Button variant="link" onClick={() => setSelectedEmoji(null)}>
                            <X className="mr-2 h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                    <div>{emojiPopover()}</div>
                  </div>
                  <div>
                    <Input
                      id="name"
                      className="w-full"
                      defaultValue={item.name}
                      onChange={(event) => setCategoryName(event.target.value)}
                    />
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={item.icon === selectedEmoji && (!categoryName || categoryName === item.name)}
                        onClick={() => handleSave({ ...item, name: categoryName || item.name }, item.name)}
                      >
                        Save
                      </Button>
                    </div>
                    <ConfirmDeleteForm uuid={item.uuid} />
                  </div>
                </Ppv.PopoverPopup>
              </Ppv.Popover>
            </div>
            <Acd.AccordionPanel className="mb-2 ml-2 bg-white pb-1">
              <SortableCategoryList
                categories={categoriesByParent(item.uuid) as Category[]}
                selectedEmoji={selectedEmoji}
                parent={parent}
                parentCategories={parentCategories}
                isUpdating={isUpdating}
                onOpenPopup={onOpenPopup}
                onClickShowTransactions={clickShowTransactions}
                onParentChange={setParent}
                onCategoryNameChange={(value) => setCategoryName(value)}
                onEmojiClear={() => setSelectedEmoji(null)}
                onSave={handleSave}
                emojiPopover={emojiPopover}
              />
            </Acd.AccordionPanel>
          </Acd.AccordionItem>
        ))}
      </Acd.Accordion>
      {activeCategoryUuid && (
        <TransactionsForm open={isOpenTransactionsForm} handleClose={handleCloseModal} uuid={activeCategoryUuid} />
      )}
    </div>
  );
};

export default Outcome;
