import React from 'react';
// UI
import * as Slc from '@/components/ui/select';
import * as Scr from '@/components/ui/scroll-area';
// Types
import { Category } from '@/components/categories/types';
import { RowData } from '@/components/transactions/components/transactionTable';
// Utils
import { cn } from '@/lib/utils';

type Props = {
  user: string;
  value: string;
  categories: Category[];
  categoryType: 'EXP' | 'INC';
  handleChange: (id: number, key: string, value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent, id: number) => void;
  row: RowData;
  isInvalid: boolean;
  defaultOpen?: boolean;
};

export default function CategoryComponent({
  user,
  value,
  categories,
  categoryType,
  handleChange,
  handleKeyDown,
  row,
  isInvalid,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = React.useState<boolean>(defaultOpen);
  const [scrollReady, setScrollReady] = React.useState<boolean>(false);
  const parents = categories.filter((item: Category) => item.parent === null && item.type === categoryType);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open || categories.length === 0 || !value) return;

    setTimeout(() => {
      setScrollReady(true);
    }, 100);
  }, [categories, open, value]);

  React.useEffect(() => {
    if (!scrollReady || !value) return;

    const scrollUuid = categories.find((item: Category) => item.uuid === value)?.parent || value;

    const parentElement = scrollAreaRef.current?.querySelector(`[data-parent-id="${scrollUuid}"]`);
    if (!!parentElement) {
      parentElement.scrollIntoView({ behavior: 'instant', block: 'start' });
      setScrollReady(false);
    }
  }, [scrollReady, value]);

  const groupedCategories = categories.reduce(
    (grouped: Record<string, Category[]>, category: Category): Record<string, Category[]> => {
      const key = category.parent || 'null'; // use 'null' for categories without a parent
      if (!(key in grouped)) {
        grouped[key] = [];
      }
      grouped[key].push(category);
      return grouped;
    },
    {}
  );

  const onChange = (value: string) => {
    const category = categories.find((item: Category) => item.uuid === value);
    const parent = category ? categories.find((item: Category) => item.uuid === category.parent) : '';

    handleChange(row.id, 'category', value);
    handleChange(row.id, 'categoryName', category ? category.name : '');
    handleChange(row.id, 'categoryParentName', parent ? parent.name : '');
  };

  const handleOpen = () => {
    setOpen(!open);
  };

  const expenseList = (parent: Category) => (
    <>
      <Slc.SelectGroup>
        <Slc.SelectLabel data-parent-id={parent.uuid}>{parent.name}</Slc.SelectLabel>
        {groupedCategories[parent.uuid]?.map((item: Category) => (
          <Slc.SelectItem key={item.uuid} value={item.uuid}>
            {parent.icon} {item.name}
          </Slc.SelectItem>
        ))}
      </Slc.SelectGroup>
      <Slc.SelectSeparator />
    </>
  );

  return (
    <Slc.Select value={value} open={open} onValueChange={(value) => onChange(value)} onOpenChange={handleOpen}>
      <Slc.SelectTrigger
        className={cn(
          'w-full h-8 px-2 text-sm border-0 focus:ring-0 focus:outline-none focus:border-primary bg-white focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-blue-700 text-left',
          isInvalid && 'outline outline-red-400'
        )}
        onKeyDown={(e) => handleKeyDown(e, row.id)}
      >
        <Slc.SelectValue />
      </Slc.SelectTrigger>
      <Slc.SelectContent position="popper" sideOffset={-40} className="max-h-[480px]">
        <Scr.ScrollArea className="relative h-[470px]" ref={scrollAreaRef}>
          {parents.map((parent: Category, index: number) => (
            <div key={parent.uuid}>
              {categoryType === 'EXP' ? (
                expenseList(parent)
              ) : (
                <Slc.SelectItem key={parent.uuid} value={parent.uuid}>
                  {parent.icon} {parent.name}
                </Slc.SelectItem>
              )}
              <Slc.SelectSeparator />
            </div>
          ))}
        </Scr.ScrollArea>
      </Slc.SelectContent>
    </Slc.Select>
  );
}
