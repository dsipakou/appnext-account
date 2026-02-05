import { FC } from 'react';
import { useStore } from '@/app/store';
import { useSession } from 'next-auth/react';
import { BadgeCheck, Repeat2 } from 'lucide-react';
import { getDate, format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { MonthGroupedBudgetItem, MonthBudgetItem } from '@/components/budget/types';
import { getNumberWithPostfix, formatMoney } from '@/utils/numberUtils';
import { useCategories } from '@/hooks/categories';
import { parseDate, getFormattedDate, LONG_YEAR_SHORT_MONTH_FORMAT } from '@/utils/dateUtils';
import { Category } from '@/components/categories/types';
import { cn } from '@/lib/utils';

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
        <div className="absolute top-0 w-full h-full">
          <span className="flex text-white text-lg font-semibold h-full items-center justify-center">
            <div className="flex gap-2 items-center">{planned === 0 ? 'Not planned' : `${percentage}%`}</div>
          </span>
        </div>
      </>
    );
  };

  const anotherCategoryProgress = () => (
    <>
      <div className="flex justify-center w-full h-8">
        <span className="flex text-sm text-gray-700 h-full items-center justify-center">
          <div className="flex gap-1 items-center">
            <span className="font-semibold">From</span>
            <Badge
              variant="outline"
              className="flex justify-center whitespace-nowrap overflow-hidden bg-sky-500 h-5 text-white w-full"
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
      <div className="flex justify-center w-full h-8">
        <span className="flex text-blue-500 font-semibold h-full items-center justify-center">
          <div className="flex gap-1 items-center">
            <span className="font-semibold">From</span>
            <Badge
              variant="outline"
              className="flex justify-center whitespace-nowrap overflow-hidden bg-sky-500 h-5 text-white w-full"
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
        'h-[172px] cursor-pointer p-2 rounded-lg hover:drop-shadow-lg',
        recurrent && 'border-gray-300',
        isCompleted && 'drop-shadow-sm bg-slate-200 text-slate-500',
        !isCompleted && 'drop-shadow outline-zinc-200 bg-slate-50'
      )}
    >
      {!!recurrent && (
        <>
          <div
            className={cn(
              'absolute z-60 top-0 left-0 w-0 h-0 border-r-transparent rounded-tl-lg',
              recurrent === 'monthly' && ' border-t-[28px] border-r-[28px] border-t-cyan-400',
              recurrent === 'weekly' && 'border-t-[28px] border-r-[28px] border-t-orange-400'
            )}
          ></div>
          <div className="absolute top-[2px] left-[2px] text-white">
            <Repeat2 className="h-4 w-4"></Repeat2>
          </div>
        </>
      )}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between w-full">
          <div className="relative">
            <span className="text-lg ml-4">{item.title}</span>
            {repeatedFor > 1 && (
              <span className="absolute px-1 text-xs rounded-full bg-sky-500 text-white">{`x${repeatedFor}`}</span>
            )}
          </div>
          {isCompleted && !item.isAnotherCategory && !item.isAnotherMonth && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <BadgeCheck className="text-green-600 h-5 w-5" />
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
            <span className="text-xl font-bold mx-1">{currencySign}</span>
            {!item.isAnotherCategory && spent !== spentOverall && (
              <span className="text-xs font-light italic mr-1">+{formatMoney(spentOverall - spent)}</span>
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
