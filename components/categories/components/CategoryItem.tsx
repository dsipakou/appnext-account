// System
import React from 'react';
import { X, Pencil, ScrollText, GripVertical } from 'lucide-react';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
// Components
import { ReassignTransactionsForm } from '@/components/categories/forms';
import { ConfirmDeleteForm } from '@/components/categories/forms';
// UI
import { Button } from '@/components/ui/button';
import * as Ppv from '@/components/ui/popover';
import * as Slc from '@/components/ui/select';
import * as Tlt from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
// Types
import { Category } from '../types';
import { roundToNearestMinutes } from 'date-fns';
// Utils
import { cn } from '@/lib/utils';


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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isReordering });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? "100" : "auto",
    boxShadow: isDragging ? '0 2px 0 rgba(0,0,0,0.5), 0 -1px 0 rgba(0,0,0,0.5)' : 'none',
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div key={category.uuid} ref={setNodeRef} style={style}>
      <Separator />
      <div className="group flex flex-nowrap my-1 p-1" key={category.uuid}>
        <div className="flex items-center ml-2">
          <div className={cn(
            "flex items-center cursor-grab active:cursor-grabbing",
          )}
           {...attributes} {...listeners}>
            <GripVertical className={cn("w-4 h-4 text-gray-400", isReordering && "invisible")} />
          </div>
        </div>
        <span className="flex items-center ml-4 h-6">{category.name}</span>
        <span>
          {!isDragging && (
            <ScrollText
              className="hidden group-hover:flex w-6 h-6 ml-3 p-1 cursor-pointer hover:text-blue-400"
              onClick={() => onClickShowTransactions(category.uuid)}
            />
          )}
        </span>
        <Ppv.Popover onOpenChange={(open) => onOpenPopup(open, category)}>
          <Ppv.PopoverTrigger asChild>
            <span>
              {!isDragging && (
                <Pencil className="hidden group-hover:flex w-6 h-6 ml-3 px-1 cursor-pointer hover:text-blue-400" />
              )}
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
                    <span className="flex justify-center items-center text-2xl">
                      {selectedEmoji}
                    </span>
                    <Button variant="link" onClick={onEmojiClear}>
                      <X className="w-4 h-4 mr-2" />
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
            <div className="flex items-end mt-2 justify-between">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={
                    !category.name ||
                    (category.icon === selectedEmoji &&
                      category.name === category.name &&
                      parent === category.parent)
                  }
                  onClick={() =>
                    onSave(
                      {
                        ...category,
                        name: category.name,
                        parent: parent || category.parent,
                      },
                      category.name
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
            <Ppv.PopoverArrow
              width={20}
              height={10}
              className="fill-white shadow-lg border-none"
            />
          </Ppv.PopoverContent>
        </Ppv.Popover>
      </div>
    </div>
  );
}; 