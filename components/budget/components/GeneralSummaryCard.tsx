import { FC } from 'react';

import { useStore } from '@/app/store';
import { formatMoney } from '@/utils/numberUtils';

interface Types {
  title: string;
  planned: number;
  spent: number;
}

const GeneralSummaryCard: FC<Types> = ({ title, planned, spent }) => {
  const currencySign = useStore((state) => state.currency.sign);

  const maxValue: number = Math.max(planned, spent);
  const spentPercent = (spent * 100) / maxValue;
  const plannedPercent = (planned * 100) / maxValue;

  return (
    <div className="flex h-[80px] flex-col items-center justify-center border bg-slate-600 text-white">
      <div className="flex w-full justify-center">
        <span className="text-yellow-300">{title.charAt(0).toUpperCase() + title.slice(1)} Summary</span>
      </div>
      <div className="flex w-full">
        <div className="flex flex-1">
          <div className="flex flex-1 justify-end">
            <div className="flex h-full flex-col">
              <div className="flex justify-end text-xl">
                {formatMoney(planned)} {currencySign}
              </div>
              <div className="flex items-end justify-end text-xs">Planned</div>
            </div>
          </div>
          <div className="ml-2 flex items-end">
            <div className="w-5 rounded bg-yellow-400" style={{ height: `${plannedPercent}%` }}></div>
          </div>
        </div>
        <div className="mx-1 w-[1px] bg-gray-500"></div>
        <div className="flex flex-1">
          <div className="mr-2 flex h-full items-end">
            <div className="w-5 rounded bg-yellow-400" style={{ height: `${spentPercent}%` }}></div>
          </div>
          <div className="flex flex-1 justify-start">
            <div className="flex h-full flex-col">
              <div className="flex justify-start text-xl">
                {formatMoney(spent)} {currencySign}
              </div>
              <div className="flex justify-start text-xs">Actual</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSummaryCard;
