// System
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, ScrollText, X } from 'lucide-react';
import React from 'react';

import { ReassignTransactionsForm } from '@/components/categories/forms';
import { ConfirmDeleteForm } from '@/components/categories/forms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as Ppv from '@/components/ui/popover';
import * as Slc from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import * as Tlt from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { Category, CategoryType } from '../types';
import { Badge } from '@/components/ui/badge';

interface Props {
  id: string;
  category: Category;
  selectedEmoji: string | null;
  parent: string | null;
  parentCategories: Category[];
  isUpdating: boolean;
  isReordering: boolean;
  onOpenPopup: (open: boolean, category: Category) => void;
  onClickShowTransactions: (uuid: string) => void;
  onParentChange: (value: string) => void;
  onCategoryNameChange: (value: string) => void;
  onEmojiClear: () => void;
  onSave: (category: Category, originalName: string) => void;
  emojiPopover: () => React.ReactNode;
}

export const CategoryItem: React.FC<Props> = ({
  id,
  category,
  selectedEmoji,
  parent,
  parentCategories,
  isUpdating,
  isReordering,
  onOpenPopup,
  onClickShowTransactions,
  onParentChange,
  onCategoryNameChange,
  onEmojiClear,
  onSave,
  emojiPopover,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: isReordering,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? '100' : 'auto',
    boxShadow: isDragging ? '0 2px 0 rgba(0,0,0,0.5), 0 -1px 0 rgba(0,0,0,0.5)' : 'none',
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div key={category.uuid} ref={setNodeRef} style={style}>
      <Separator />
      <div className="group my-1 flex flex-nowrap items-center p-1" key={category.uuid}>
        <div className="ml-2 flex items-center">
          <div className={cn('flex cursor-grab items-center active:cursor-grabbing')} {...attributes} {...listeners}>
            <GripVertical className={cn('h-4 w-4 text-gray-400', isReordering && 'invisible')} />
          </div>
        </div>
        <span className="ml-4 flex h-6 items-center">{category.name}</span>
        <div className="pl-2">{category.type === CategoryType.CapitalExpense && <Badge>Capital Expense</Badge>}</div>
        <span>
          {!isDragging && (
            <ScrollText
              className="ml-3 hidden h-6 w-6 cursor-pointer p-1 hover:text-blue-400 group-hover:flex"
              onClick={() => onClickShowTransactions(category.uuid)}
            />
          )}
        </span>
        <Ppv.Popover onOpenChange={(open) => onOpenPopup(open, category)}>
          <Ppv.PopoverTrigger asChild>
            <span>
              {!isDragging && (
                <Pencil className="ml-3 hidden h-6 w-6 cursor-pointer px-1 hover:text-blue-400 group-hover:flex" />
              )}
            </span>
          </Ppv.PopoverTrigger>
          <Ppv.PopoverAnchor />
          <Ppv.PopoverContent className="flex w-80 flex-col gap-3 rounded-md border-none bg-white" sideOffset={10}>
            <Ppv.PopoverClose className="absolute right-5 top-5">
              <X className="h-4 w-4" />
            </Ppv.PopoverClose>
            <span className="text-lg">Editing</span>
            <div className="flex justify-between">
              <div className="flex w-1/2 justify-center">
                {selectedEmoji && (
                  <>
                    <span className="flex items-center justify-center text-2xl">{selectedEmoji}</span>
                    <Button variant="link" onClick={onEmojiClear}>
                      <X className="mr-2 h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              <div>{emojiPopover()}</div>
            </div>
            <div>
              <Slc.Select
                onValueChange={onParentChange}
                defaultValue={category.parent || undefined}
                disabled={isUpdating}
              >
                <Slc.SelectTrigger className="relative w-full">
                  <Slc.SelectValue placeholder="Choose parent category" />
                </Slc.SelectTrigger>
                <Slc.SelectContent>
                  <Slc.SelectGroup>
                    {parentCategories.map((category: Category) => (
                      <Slc.SelectItem key={category.uuid} value={category.uuid}>
                        {category.name}
                      </Slc.SelectItem>
                    ))}
                  </Slc.SelectGroup>
                </Slc.SelectContent>
              </Slc.Select>
            </div>
            <div>
              <Input
                id="name"
                className="w-full"
                defaultValue={category.name}
                onChange={(event) => onCategoryNameChange(event.target.value)}
              />
            </div>
            <div className="mt-2 flex items-end justify-between">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={
                    !category.name ||
                    (category.icon === selectedEmoji && category.name === category.name && parent === category.parent)
                  }
                  onClick={() =>
                    onSave(
                      {
                        ...category,
                        name: category.name,
                        parent: parent || category.parent,
                      },
                      category.name,
                    )
                  }
                >
                  Save
                </Button>
                <Tlt.TooltipProvider>
                  <Tlt.Tooltip>
                    <Tlt.TooltipTrigger>
                      <ReassignTransactionsForm uuid={category.uuid} />
                    </Tlt.TooltipTrigger>
                    <Tlt.TooltipContent>
                      Re-assign transactions and budgets from this category to another one
                    </Tlt.TooltipContent>
                  </Tlt.Tooltip>
                </Tlt.TooltipProvider>
              </div>
              <ConfirmDeleteForm uuid={category.uuid} />
            </div>
            <Ppv.PopoverArrow width={20} height={10} className="border-none fill-white shadow-lg" />
          </Ppv.PopoverContent>
        </Ppv.Popover>
      </div>
    </div>
  );
};
