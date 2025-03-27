// System
import React from 'react';
import { useSWRConfig } from 'swr';
import EmojiPicker from 'emoji-picker-react';
import * as z from 'zod';
import { X, Pencil } from 'lucide-react';
// Components
import { TransactionsForm } from '@/components/categories/forms';
import { ConfirmDeleteForm } from '@/components/categories/forms';
// UI
import { Button } from '@/components/ui/button';
import * as Acd from '@/components/ui/accordion';
import * as Ppv from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
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

interface PopupTypes {
  uuid: string;
  name: string;
  parent: string | null;
  description: string | null;
}

const popupSchema = z.object({
  name: z.string().min(2),
  parent: z.string().uuid().nullable(),
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
    console.log('payload', category, 'originalName', originalName);
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
        <Ppv.PopoverTrigger asChild>
          <Button variant="outline" className="flex-1">
            Choose icon
          </Button>
        </Ppv.PopoverTrigger>
        <Ppv.PopoverContent className="flex w-[400px] justify-center" sideOffset={5}>
          <div>
            <EmojiPicker
              className="flex mt-5 h-20"
              skinTonesDisabled={true}
              onEmojiClick={(event) => setSelectedEmoji(event.emoji)}
            />
          </div>
          <Ppv.PopoverClose className="absolute top-5 right-5">
            <X className="w-4 h-4" />
          </Ppv.PopoverClose>
        </Ppv.PopoverContent>
      </Ppv.Popover>
    );
  };

  return (
    <div className="flex flex-col">
      <Acd.Accordion type="multiple">
        {parentCategories.map((item: Category) => (
          <Acd.AccordionItem key={item.uuid} value={item.uuid}>
            <div className="group flex h-12 w-full justify-start shadow-lg items-center bg-white">
              <Acd.AccordionTrigger className="flex gap-1 group text-lg">
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Acd.AccordionTrigger>
              <Ppv.Popover onOpenChange={(open) => onOpenPopup(open, item)}>
                <Ppv.PopoverTrigger asChild>
                  <span>
                    <Pencil className="hidden group-hover:flex w-7 h-7 ml-3 p-1 cursor-pointer hover:text-blue-400" />
                  </span>
                </Ppv.PopoverTrigger>
                <Ppv.PopoverAnchor />
                <Ppv.PopoverContent
                  className="flex flex-col gap-3 w-80 rounded-md bg-white border-none"
                  sideOffset={10}
                >
                  <Ppv.PopoverClose className="absolute top-5 right-5">
                    <X className="w-4 h-4" />
                  </Ppv.PopoverClose>
                  <span className="text-lg">Editing</span>
                  <div className="flex justify-between">
                    <div className="flex justify-center w-1/2">
                      {selectedEmoji && (
                        <>
                          <span className="flex justify-center items-center text-2xl">{selectedEmoji}</span>
                          <Button variant="link" onClick={() => setSelectedEmoji(null)}>
                            <X className="w-4 h-4 mr-2" />
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
                  <div className="flex items-end mt-2 justify-between">
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
                  <Ppv.PopoverArrow width={20} height={10} className="fill-white shadow-lg border-none" />
                </Ppv.PopoverContent>
              </Ppv.Popover>
            </div>
            <Acd.AccordionContent className="bg-white ml-2 pb-1 mb-2">
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
            </Acd.AccordionContent>
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
