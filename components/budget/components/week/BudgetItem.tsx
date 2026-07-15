import { BadgeCheck, Check, Edit, Loader, Plus, Repeat, ScrollText, Trash } from 'lucide-react';
import { useSession } from 'next-auth/react';
import * as React from 'react';
import { useSWRConfig } from 'swr';

import { useStore } from '@/app/store';
import ConfirmDeleteForm from '@/components/budget/forms/ConfirmDeleteForm';
import EditForm from '@/components/budget/forms/EditForm';
import { CompactWeekItem } from '@/components/budget/types';
import { AddForm } from '@/components/transactions/forms';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Draggable } from '@/components/ui/dnd';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useEditBudget } from '@/hooks/budget';
import { UserResponse, useUsers } from '@/hooks/users';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/numberUtils';
import { extractErrorMessage } from '@/utils/stringUtils';

interface Types {
  index: number;
  day: number;
  budget: CompactWeekItem;
  weekUrl: string;
  monthUrl: string;
  isDragging: boolean;
  isDragLoading: boolean;
  mutateBudget: (updatedBudget: unknown) => void;
  clickShowTransactions: (uuid: string) => void;
}

const BudgetItem: React.FC<Types> = ({
  day,
  budget,
  weekUrl,
  monthUrl,
  isDragging,
  isDragLoading,
  mutateBudget,
  clickShowTransactions,
}) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isEditDialogOpened, setIsEditDialogOpened] = React.useState<boolean>(false);
  const [isConfirmDeleteDialogOpened, setIsConfirmDeleteDialogOpened] = React.useState<boolean>(false);
  const [isAddTransactionDialogOpened, setIsAddTransactionDialogOpened] = React.useState<boolean>(false);
  const { toast } = useToast();
  const { mutate } = useSWRConfig();

  const { data: users = [] } = useUsers();
  const { trigger: completeBudget, isMutating: isCompleting } = useEditBudget(budget.uuid);
  const {
    data: { user: authUser },
  } = useSession();

  const percentage: number = Math.floor((budget.spent * 100) / budget.planned);

  const currencySign = useStore((state) => state.currency.sign);

  const budgetUser = users.find((item: UserResponse) => item.uuid === budget.user);

  const isSameUser = budgetUser?.username === authUser?.username;

  const handleClickComplete = async (): Promise<void> => {
    try {
      const updatedBudget = await completeBudget({ isCompleted: !budget.isCompleted, category: budget.category });
      mutateBudget(updatedBudget);
      mutate('budget/upcomming/', undefined);
    } catch (error) {
      const message = extractErrorMessage(error);
      toast({
        variant: 'destructive',
        title: 'Cannot be completed',
        description: message,
      });
    }
  };

  return (
    <div className="relative flex h-[80px] w-full">
      <Draggable
        id={budget.uuid}
        isLoading={isDragLoading}
        className={cn(
          'group absolute flex h-[80px] w-full flex-col justify-between rounded-md p-2',
          day === 1 && 'hover:left-4',
          day === 0 && 'hover:right-4',

          !isDragging && 'hover:z-20 hover:h-[100px] hover:w-[290px] hover:scale-110 hover:shadow-xl',
          !budget.isCompleted && ['bg-white', isSameUser ? 'shadow-md' : 'text-blue-500'],
          budget.isCompleted && 'bg-slate-300 opacity-[90%] grayscale-[40%]',
        )}
      >
        <div
          className={cn(
            'absolute left-0 top-0 h-0 w-0 rounded-tl-sm border-r-transparent',
            budget.recurrent === 'monthly' && 'border-r-[25px] border-t-[25px] border-t-cyan-400',
            budget.recurrent === 'weekly' && 'border-r-[25px] border-t-[25px] border-t-orange-400',
          )}
        ></div>
        {budget.isCompleted && (
          <div className={cn('absolute right-1 top-1 flex items-center align-middle group-hover:right-3')}>
            <BadgeCheck className="h-4 w-4 text-green-600" />
          </div>
        )}
        <div className="flex flex-row items-center gap-1">
          {!isSameUser && (
            <>
              <div className={cn('absolute left-6 top-[4px] flex items-center align-middle group-hover:hidden')}>
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="bg-violet-500 text-xs font-bold text-white">
                    {budgetUser?.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="justify-center text-sm font-bold">
                <div
                  className={cn(
                    'absolute left-6 top-1 hidden items-center align-middle',
                    !isDragging && 'group-hover:flex',
                  )}
                >
                  <Badge className="h-4 bg-violet-500">{budgetUser?.username}</Badge>
                </div>
              </div>
            </>
          )}
          <div
            className={cn(
              'flex grow overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold',
              !isDragging && 'group-hover:ml-3 group-hover:text-base',
            )}
          >
            <span>{budget.title}</span>
          </div>
          {!!budget.recurrent && (
            <>
              <div
                className={cn(
                  'absolute left-[2px] top-[2px] flex items-center align-middle',
                  budget.recurrent === 'weekly' && 'text-orange-500',
                  budget.recurrent === 'monthly' && 'text-cyan-500',
                )}
              >
                <Repeat className={cn('mr-1 h-3 w-3 text-white')} />
              </div>
              <div
                className={cn(
                  'absolute right-9 top-1 hidden items-center align-middle',
                  !isDragging && 'group-hover:flex',
                  budget.recurrent === 'weekly' && 'text-orange-500',
                  budget.recurrent === 'monthly' && 'text-cyan-500',
                )}
              >
                <span
                  className={cn(
                    'text-xs',
                    budget.recurrent === 'weekly' && 'text-orange-500',
                    budget.recurrent === 'monthly' && 'text-cyan-500',
                  )}
                >
                  {budget.recurrent}
                </span>
              </div>
            </>
          )}
        </div>
        <div className="flex h-full items-center justify-center">
          <div className={cn('text-sm font-semibold', !isDragging && 'group-hover:flex')}>
            <span>{formatMoney(budget.spent)}</span>
            <span>{currencySign}</span>
          </div>
          {budget.planned !== 0 && (
            <div className={cn('mx-2 hidden text-xs font-semibold', !isDragging && 'group-hover:flex')}>of</div>
          )}
          {budget.planned !== 0 && (
            <div className={cn('flex text-xs', isDragging && 'hidden')}>
              <span className="pl-1 group-hover:hidden">(</span>
              <span>{formatMoney(budget.planned)}</span>
              <span className="group-hover:hidden">)</span>
              <span className="hidden group-hover:flex">{currencySign}</span>
            </div>
          )}
          <div className={cn('ml-[3px] text-xs', isDragging && 'hidden')}>
            {budget.planned === 0 && <span className="ml-2 hidden group-hover:flex">(not planned)</span>}
          </div>
        </div>
        <div className="flex items-center justify-center">
          {budget.planned !== 0 ? (
            <>
              <Progress
                className={cn('h-1.5 bg-gray-200', percentage > 100 && 'bg-red-200')}
                indicatorclassname={cn('bg-green-500', percentage > 100 && 'bg-red-500')}
                value={percentage > 100 ? percentage % 100 : percentage}
              />
              <div className="ml-2 text-xs font-bold">{`${percentage}%`}</div>
            </>
          ) : (
            <Badge
              variant="secondary"
              className="flex h-3 bg-white text-xs font-normal tracking-widest text-violet-600 group-hover:hidden"
            >
              Not Planned
            </Badge>
          )}
        </div>
        <div
          className={cn(
            'hidden h-full justify-center gap-1 text-xs',
            !isDragging && 'group-hover:flex group-hover:items-end',
          )}
          data-no-dnd="true"
        >
          <Button
            disabled={isCompleting}
            variant="outline"
            className={cn('h-2 bg-white px-3 text-xs', budget.isCompleted && 'bg-gray-400')}
            onClick={handleClickComplete}
          >
            {!isCompleting && <Check className={cn('h-4 text-gray-400', budget.isCompleted && 'text-white')} />}
            {isCompleting && <Loader className={cn('h-4 text-gray-400', budget.isCompleted && 'text-white')} />}
          </Button>
          <Button
            disabled={isLoading}
            variant="outline"
            className="h-2 w-full bg-slate-200 px-3 text-xs"
            onClick={() => setIsAddTransactionDialogOpened(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            disabled={isLoading}
            variant="outline"
            className="h-2 bg-white px-3 text-xs"
            onClick={() => clickShowTransactions(budget.uuid)}
          >
            <ScrollText className="h-4 w-4" />
          </Button>
          <Button
            disabled={isLoading}
            variant="outline"
            className="h-2 bg-white px-3 text-xs"
            onClick={() => setIsEditDialogOpened(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            className="h-2 border-2 border-red-500 px-3"
            onClick={() => setIsConfirmDeleteDialogOpened(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
        {isEditDialogOpened && (
          <EditForm
            open={isEditDialogOpened}
            setOpen={setIsEditDialogOpened}
            uuid={budget.uuid}
            weekUrl={weekUrl}
            monthUrl={monthUrl}
          />
        )}
        {isConfirmDeleteDialogOpened && (
          <ConfirmDeleteForm
            open={isConfirmDeleteDialogOpened}
            setOpen={setIsConfirmDeleteDialogOpened}
            uuid={budget.uuid}
            recurrent={budget.recurrent}
            budgetDate={budget.budgetDate}
          />
        )}
        {isAddTransactionDialogOpened && (
          <AddForm
            url={weekUrl}
            open={isAddTransactionDialogOpened}
            onOpenChange={setIsAddTransactionDialogOpened}
            budget={budget}
          />
        )}
      </Draggable>
    </div>
  );
};

export default BudgetItem;
