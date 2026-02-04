import * as React from 'react';
import { useSWRConfig } from 'swr';
import { useStore } from '@/app/store';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import { Check, Edit, Loader, Plus, Repeat, ScrollText, Trash, BadgeCheck } from 'lucide-react';
import { formatMoney } from '@/utils/numberUtils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CompactWeekItem } from '@/components/budget/types';
import { useUsers, UserResponse } from '@/hooks/users';
import { useEditBudget } from '@/hooks/budget';
import EditForm from '@/components/budget/forms/EditForm';
import ConfirmDeleteForm from '@/components/budget/forms/ConfirmDeleteForm';
import { AddForm } from '@/components/transactions/forms';
import { Draggable } from '@/components/ui/dnd';
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
    <div className="flex relative w-full h-[80px]">
      <Draggable
        id={budget.uuid}
        isLoading={isDragLoading}
        className={cn(
          'absolute flex flex-col group p-2 h-[80px] justify-between rounded-md w-full',
          day === 1 && 'hover:left-4',
          day === 0 && 'hover:right-4',

          !isDragging && 'hover:h-[100px] hover:w-[290px] hover:scale-110 hover:z-20 hover:shadow-xl',
          !budget.isCompleted && ['bg-white', isSameUser ? 'shadow-md' : 'text-blue-500'],
          budget.isCompleted && 'bg-slate-300 grayscale-[40%] opacity-[90%]'
        )}
      >
        <div
          className={cn(
            'absolute top-0 left-0 w-0 h-0 border-r-transparent rounded-tl-sm',
            budget.recurrent === 'monthly' && 'border-t-[25px] border-r-[25px] border-t-cyan-400',
            budget.recurrent === 'weekly' && 'border-t-[25px] border-r-[25px] border-t-orange-400'
          )}
        ></div>
        {budget.isCompleted && (
          <div className={cn('absolute flex align-middle items-center top-1 right-1 group-hover:right-3')}>
            <BadgeCheck className="text-green-600 h-4 w-4" />
          </div>
        )}
        <div className="flex flex-row gap-1 items-center">
          {!isSameUser && (
            <>
              <div className={cn('absolute flex align-middle items-center top-[4px] left-6 group-hover:hidden')}>
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-xs font-bold bg-violet-500 text-white">
                    {budgetUser?.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="justify-center text-sm font-bold">
                <div
                  className={cn(
                    'absolute align-middle items-center top-1 left-6 hidden',
                    !isDragging && 'group-hover:flex'
                  )}
                >
                  <Badge className="bg-violet-500 h-4">{budgetUser?.username}</Badge>
                </div>
              </div>
            </>
          )}
          <div
            className={cn(
              'flex grow whitespace-nowrap text-ellipsis overflow-hidden text-sm font-semibold',
              !isDragging && 'group-hover:text-base group-hover:ml-3'
            )}
          >
            <span>{budget.title}</span>
          </div>
          {!!budget.recurrent && (
            <>
              <div
                className={cn(
                  'absolute flex align-middle top-[2px] left-[2px] items-center',
                  budget.recurrent === 'weekly' && 'text-orange-500',
                  budget.recurrent === 'monthly' && 'text-cyan-500'
                )}
              >
                <Repeat className={cn('h-3 w-3 mr-1 text-white')} />
              </div>
              <div
                className={cn(
                  'absolute align-middle top-1 right-9 hidden items-center',
                  !isDragging && 'group-hover:flex',
                  budget.recurrent === 'weekly' && 'text-orange-500',
                  budget.recurrent === 'monthly' && 'text-cyan-500'
                )}
              >
                <span
                  className={cn(
                    'text-xs',
                    budget.recurrent === 'weekly' && 'text-orange-500',
                    budget.recurrent === 'monthly' && 'text-cyan-500'
                  )}
                >
                  {budget.recurrent}
                </span>
              </div>
            </>
          )}
        </div>
        <div className="flex h-full justify-center items-center">
          <div className={cn('text-sm font-semibold', !isDragging && 'group-hover:flex')}>
            <span>{formatMoney(budget.spent)}</span>
            <span>{currencySign}</span>
          </div>
          {budget.planned !== 0 && (
            <div className={cn('hidden text-xs font-semibold mx-2', !isDragging && 'group-hover:flex')}>of</div>
          )}
          {budget.planned !== 0 && (
            <div className={cn('flex text-xs', isDragging && 'hidden')}>
              <span className="group-hover:hidden pl-1">(</span>
              <span>{formatMoney(budget.planned)}</span>
              <span className="group-hover:hidden">)</span>
              <span className="hidden group-hover:flex">{currencySign}</span>
            </div>
          )}
          <div className={cn('text-xs ml-[3px]', isDragging && 'hidden')}>
            {budget.planned === 0 && <span className="hidden group-hover:flex ml-2">(not planned)</span>}
          </div>
        </div>
        <div className="flex justify-center items-center">
          {budget.planned !== 0 ? (
            <>
              <Progress
                className={cn('h-1.5 bg-gray-200', percentage > 100 && 'bg-red-200')}
                indicatorclassname={cn('bg-green-500', percentage > 100 && 'bg-red-500')}
                value={percentage > 100 ? percentage % 100 : percentage}
              />
              <div className="text-xs font-bold ml-2">{`${percentage}%`}</div>
            </>
          ) : (
            <Badge
              variant="secondary"
              className="flex h-3 font-normal group-hover:hidden text-xs tracking-widest bg-white text-violet-600"
            >
              Not Planned
            </Badge>
          )}
        </div>
        <div
          className={cn(
            'hidden h-full justify-center gap-1 text-xs',
            !isDragging && 'group-hover:flex group-hover:items-end'
          )}
          data-no-dnd="true"
        >
          <Button
            disabled={isCompleting}
            variant="outline"
            className={cn('px-3 text-xs h-2 bg-white', budget.isCompleted && 'bg-gray-400')}
            onClick={handleClickComplete}
          >
            {!isCompleting && <Check className={cn('h-4 text-gray-400', budget.isCompleted && 'text-white')} />}
            {isCompleting && <Loader className={cn('h-4 text-gray-400', budget.isCompleted && 'text-white')} />}
          </Button>
          <Button
            disabled={isLoading}
            variant="outline"
            className="px-3 text-xs h-2 bg-slate-200 w-full"
            onClick={() => setIsAddTransactionDialogOpened(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            disabled={isLoading}
            variant="outline"
            className="px-3 text-xs h-2 bg-white"
            onClick={() => clickShowTransactions(budget.uuid)}
          >
            <ScrollText className="h-4 w-4" />
          </Button>
          <Button
            disabled={isLoading}
            variant="outline"
            className="px-3 text-xs h-2 bg-white"
            onClick={() => setIsEditDialogOpened(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            className="px-3 h-2 border-2 border-red-500"
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
