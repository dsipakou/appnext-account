import { format, isSameDay } from 'date-fns';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import React from 'react';

import { useStore } from '@/app/store';
import { ConfirmDeleteForm, EditForm } from '@/components/budget/forms';
import { MonthBudgetItem } from '@/components/budget/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/numberUtils';

interface Types {
  item: MonthBudgetItem | undefined;
  date: Date;
  currency: string;
  clickShowTransactions: (uuid: string) => void;
}

const CalendarBudgetItem: React.FC<Types> = ({ item, date, currency, clickShowTransactions }) => {
  const [isEditDialogOpened, setIsEditDialogOpened] = React.useState<boolean>(false);
  const [isConfirmDeleteDialogOpened, setIsConfirmDeleteDialogOpened] = React.useState<boolean>(false);

  const currencySign = useStore((state) => state.currency.sign);

  if (item == null) {
    return (
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full">
          <span className={cn(isSameDay(date, new Date()) && 'rounded-full bg-blue-500 px-1 font-bold text-white')}>
            {format(date, 'd')}
          </span>
        </div>
      </div>
    );
  }

  const spent: number = item.spentInCurrencies[currency];

  const planned: number = item.plannedInCurrencies[currency];

  const percentage: number = Math.floor((spent * 100) / planned) || 0;

  const handleClickTransactions = (): void => {
    clickShowTransactions(item.uuid);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full justify-between">
        <span className={isSameDay(date, new Date()) && 'rounded-full bg-blue-500 px-1 font-bold text-white'}>
          {format(date, 'd')}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreVertical className="h-4 w-4 rounded-full border bg-white" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleClickTransactions}>Transactions</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsEditDialogOpened(true)}>
              <Pencil className="mr-4 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsConfirmDeleteDialogOpened(true)}>
              <Trash2 className="mr-4 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex w-full flex-col items-center justify-center">
        <span className="text-xs">
          {formatMoney(spent)} {currencySign}
        </span>
        <div className="relative w-full">
          <Progress
            className={`h-5 rounded-sm ${percentage > 100 ? 'bg-red-200' : 'bg-gray-200'}`}
            indicatorclassname={`${percentage > 100 ? 'bg-red-500' : 'bg-green-500'}`}
            value={percentage > 100 ? percentage % 100 : percentage}
          />
          <div className="absolute top-0 h-full w-full">
            <span className="flex h-full items-center justify-center text-xs font-semibold text-white">
              {planned === 0 ? 'Not planned' : percentage}
            </span>
          </div>
        </div>
      </div>
      {isEditDialogOpened && <EditForm uuid={item.uuid} open={isEditDialogOpened} setOpen={setIsEditDialogOpened} />}
      {isConfirmDeleteDialogOpened && (
        <ConfirmDeleteForm
          uuid={item.uuid}
          open={isConfirmDeleteDialogOpened}
          setOpen={setIsConfirmDeleteDialogOpened}
          recurrent={item.recurrent}
          budgetDate={item.budgetDate}
        />
      )}
    </div>
  );
};

export default CalendarBudgetItem;
