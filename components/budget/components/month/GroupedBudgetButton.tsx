import { format, getDate } from 'date-fns';
import { BadgeCheck, Repeat2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { FC } from 'react';

import { useStore } from '@/app/store';
import { MonthBudgetItem, MonthGroupedBudgetItem } from '@/components/budget/types';
import { Category } from '@/components/categories/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCategories } from '@/hooks/categories';
import { cn } from '@/lib/utils';
import { getFormattedDate, LONG_YEAR_SHORT_MONTH_FORMAT, parseDate } from '@/utils/dateUtils';
import { formatMoney, getNumberWithPostfix } from '@/utils/numberUtils';

interface Types {
  item: MonthGroupedBudgetItem;
}

const GroupedBudgetButton: FC<Types> = ({ item }) => {
  const {
    data: { user },
  } = useSession();

  const { data: categories = [] } = useCategories();

  const repeatedFor: number = item.items.length;

  const planned: number = item.plannedInCurrencies[user?.currency];
  const spent: number = item.spentInCurrencies[user?.currency] || 0;
  const spentOverall: number = item.spentInCurrenciesOverall[user?.currency] || 0;
  const percentage: number = Math.floor((spentOverall * 100) / planned);
  const isCompleted: boolean = item.items.every((_item: MonthBudgetItem) => _item.isCompleted);

  const currencySign = useStore((state) => state.currency.sign);

  const getCategoryIcon = (uuid: string) => categories.find((item: Category) => item.uuid === uuid)?.icon || '';
  const getCategoryName = (uuid: string) => categories.find((item: Category) => item.uuid === uuid)?.name || '';

  const getRepeatDay = (item: MonthBudgetItem) => {
    if (item.recurrent === 'monthly') {
      return `Montly on day ${format(parseDate(item.budgetDate), 'dd')}`;
    } else if (item.recurrent === 'weekly') {
      return `Weekly on ${format(parseDate(item.budgetDate), 'EEEE')}`;
    }
    return '';
  };

  const recurrent = item.items[0].recurrent;

  const regularProgress = () => {
    return (
      <>
        <Progress
          className={cn('h-8 rounded-sm', percentage > 100 ? 'bg-red-200' : 'bg-gray-300')}
          indicatorclassname={cn(percentage > 100 ? 'bg-red-500' : 'bg-blue-500')}
          value={percentage > 100 ? percentage % 100 : percentage}
        />
        <div className="absolute top-0 h-full w-full">
          <span className="flex h-full items-center justify-center text-lg font-semibold text-white">
            <div className="flex items-center gap-2">{planned === 0 ? 'Not planned' : `${percentage}%`}</div>
          </span>
        </div>
      </>
    );
  };

  const anotherCategoryProgress = () => (
    <>
      <div className="flex h-8 w-full justify-center">
        <span className="flex h-full items-center justify-center text-sm text-gray-700">
          <div className="flex items-center gap-1">
            <span className="font-semibold">From</span>
            <Badge
              variant="outline"
              className="flex h-5 w-full justify-center overflow-hidden whitespace-nowrap bg-sky-500 text-white"
            >
              <span className="font-bold">
                {getCategoryIcon(item.items[0].category)} {getCategoryName(item.items[0].category)}
              </span>
            </Badge>
          </div>
        </span>
      </div>
    </>
  );

  const anotherMonthProgress = () => (
    <>
      <div className="flex h-8 w-full justify-center">
        <span className="flex h-full items-center justify-center font-semibold text-blue-500">
          <div className="flex items-center gap-1">
            <span className="font-semibold">From</span>
            <Badge
              variant="outline"
              className="flex h-5 w-full justify-center overflow-hidden whitespace-nowrap bg-sky-500 text-white"
            >
              <span className="font-bold">
                {getFormattedDate(parseDate(item.items[0].budgetDate), LONG_YEAR_SHORT_MONTH_FORMAT)}
              </span>
            </Badge>
          </div>
        </span>
      </div>
    </>
  );

  return (
    <div
      className={cn(
        'h-[172px] cursor-pointer rounded-lg p-2 hover:drop-shadow-lg',
        recurrent && 'border-gray-300',
        isCompleted && 'bg-slate-200 text-slate-500 drop-shadow-sm',
        !isCompleted && 'bg-slate-50 outline-zinc-200 drop-shadow',
      )}
    >
      {!!recurrent && (
        <>
          <div
            className={cn(
              'z-60 absolute left-0 top-0 h-0 w-0 rounded-tl-lg border-r-transparent',
              recurrent === 'monthly' && ' border-r-[28px] border-t-[28px] border-t-cyan-400',
              recurrent === 'weekly' && 'border-r-[28px] border-t-[28px] border-t-orange-400',
            )}
          ></div>
          <div className="absolute left-[2px] top-[2px] text-white">
            <Repeat2 className="h-4 w-4"></Repeat2>
          </div>
        </>
      )}
      <div className="flex flex-col gap-3">
        <div className="flex w-full justify-between">
          <div className="relative">
            <span className="ml-4 text-lg">{item.title}</span>
            {repeatedFor > 1 && (
              <span className="absolute rounded-full bg-sky-500 px-1 text-xs text-white">{`x${repeatedFor}`}</span>
            )}
          </div>
          {isCompleted && !item.isAnotherCategory && !item.isAnotherMonth && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <BadgeCheck className="h-5 w-5 text-green-600" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Completed</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
        <div className="flex justify-center">
          <div className="flex items-start">
            <span className="text-xl font-bold">{formatMoney(spent)}</span>
            <span className="mx-1 text-xl font-bold">{currencySign}</span>
            {!item.isAnotherCategory && spent !== spentOverall && (
              <span className="mr-1 text-xs font-light italic">+{formatMoney(spentOverall - spent)}</span>
            )}
          </div>
          {planned !== 0 && (
            <>
              <span className="mx-1 text-sm">of</span>
              <span className="text-sm font-semibold">
                {formatMoney(planned)} {currencySign}
              </span>
            </>
          )}
        </div>
        <div className="relative">
          {item.isAnotherMonth
            ? anotherMonthProgress()
            : item.isAnotherCategory
              ? anotherCategoryProgress()
              : regularProgress()}
        </div>
        <div className="flex w-full">
          <div className="flex-1 justify-end">
            {item.items[0].recurrent && (
              <Badge variant="outline" className={cn('bg-white', isCompleted && 'text-slate-500')}>
                {getRepeatDay(item.items[0])}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupedBudgetButton;
