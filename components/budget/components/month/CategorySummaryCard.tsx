import { FC } from 'react';
import { useStore } from '@/app/store';
import { useSession } from 'next-auth/react';
import { Progress } from '@/components/ui/progress';
import { formatMoney } from '@/utils/numberUtils';
import { GroupedByCategoryBudget } from '@/components/budget/types';
import { cn } from '@/lib/utils';

interface Types {
  item: GroupedByCategoryBudget;
}

const CategorySummaryCard: FC<Types> = ({ item }) => {
  const { data } = useSession();
  const user = data?.user;
  if (!user) {
    return null;
  }

  const planned = item.plannedInCurrencies[user.currency];
  const spent = item.spentInCurrencies[user.currency];
  const percentage: number = Math.floor((spent * 100) / planned) || 0;

  const currencySign = useStore((state) => state.currency.sign);

  return (
    <div className="flex h-full">
      <div className="flex w-full flex-col">
        <div className="flex w-full">
          <span className="text-xl font-semibold">Month overall</span>
        </div>
        <div>
          <div className="flex w-full my-2 justify-center">
            <span className="text-2xl font-bold">
              {formatMoney(spent)} {currencySign}
            </span>
            <span className="mx-2">of</span>
            <span className="text-normal">
              {formatMoney(planned)} {currencySign}
            </span>
          </div>
        </div>
        <div>
          <div className="relative mb-1">
            <Progress
              className={cn('h-10 rounded-lg', percentage > 100 ? 'bg-red-200' : 'bg-gray-300')}
              indicatorclassname={cn(percentage > 100 ? 'bg-red-500' : 'bg-green-500')}
              value={percentage > 100 ? percentage % 100 : percentage}
            />
            <div className="absolute top-0 w-full h-full">
              <div className="flex text-white font-bold h-full items-center justify-center text-xl">
                {planned === 0 ? 'Not planned' : `${percentage}%`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySummaryCard;
