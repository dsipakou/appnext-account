import React from 'react';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { DndContext, DragEndEvent, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Category } from '../types';
import { CategoryItem } from './CategoryItem';
import { useSWRConfig } from 'swr';
import { useReorderCategories } from '@/hooks/categories';
import { useToast } from '@/components/ui/use-toast';

interface Props {
  categories: Category[];
  selectedEmoji: string | null;
  parent: string | null;
  parentCategories: Category[];
  isUpdating: boolean;
  onOpenPopup: (open: boolean, category: Category) => void;
  onClickShowTransactions: (uuid: string) => void;
  onParentChange: (parent: string | null) => void;
  onCategoryNameChange: (value: string) => void;
  onEmojiClear: () => void;
  onSave: (category: Category, originalName: string) => void;
  emojiPopover: () => React.ReactNode;
}

export const SortableCategoryList: React.FC<Props> = ({
  categories = [],
  selectedEmoji,
  parent,
  parentCategories,
  isUpdating,
  onOpenPopup,
  onClickShowTransactions,
  onParentChange,
  onCategoryNameChange,
  onEmojiClear,
  onSave,
  emojiPopover,
}) => {
  const [categoriesState, setCategoriesState] = React.useState<Category[]>(categories);
  const [loading, setLoading] = React.useState<boolean>(false);
  const { mutate } = useSWRConfig();
  const { trigger: reorderCategories, isMutating: isReordering } = useReorderCategories();
  const { toast } = useToast();

  const memorizedCategories = React.useMemo(() => categories, [categories]);
  
  const getCategoryName = (uuid: string) => {
    return categories.find((category) => category.uuid === uuid)?.name;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      setLoading(true);
      console.log('over', over);
      if (over.data?.current?.sortable.index === undefined) return;
      
      // Optimistically update the UI
      setCategoriesState((categories) => {
        const oldIndex = categories.findIndex((item) => item.uuid === active.id);
        const newIndex = categories.findIndex((item) => item.uuid === over.id);
        
        // Ensure indices are valid
        if (oldIndex === -1 || newIndex === -1) return categories;
        
        return arrayMove(categories, oldIndex, newIndex);
      });

      try {
        await reorderCategories({
          category: active.id,
          index: over.data.current.sortable.index,
        });
        mutate('categories/');
        toast({
          title: 'Category reordered',
        });
      } catch (error) {
        // Revert optimistic update on error
        setCategoriesState(memorizedCategories);
        toast({
          variant: 'destructive',
          title: 'Error reordering category',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (categoriesState.length === 0) {
    return (
      <div className="flex h-full w-full p-5 justify-center text-slate-300">
        <span className="text-center">Need to add at least one subcategory</span>
      </div>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
    >
      <SortableContext 
        items={categoriesState.map((category: Category) => category.uuid)}
        strategy={verticalListSortingStrategy}
      >
        {categoriesState.map((category: Category) => (
          <CategoryItem
            key={category.uuid}
            id={category.uuid}
            category={category}
            selectedEmoji={selectedEmoji}
            parent={parent}
            parentCategories={parentCategories}
            isUpdating={isUpdating}
            isReordering={isReordering}
            onOpenPopup={onOpenPopup}
            onClickShowTransactions={onClickShowTransactions}
            onParentChange={onParentChange}
            onCategoryNameChange={onCategoryNameChange}
            onEmojiClear={onEmojiClear}
            onSave={onSave}
            emojiPopover={emojiPopover}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}; 