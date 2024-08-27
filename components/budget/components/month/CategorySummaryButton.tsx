import { FC } from 'react'
import { useStore } from '@/app/store'
import { formatMoney } from '@/utils/numberUtils'
import { cn } from '@/lib/utils'

interface Types {
  title: string
  isActive: boolean
  planned: number
  spent: number
}

const CategorySummaryButton: FC<Types> = ({ title, isActive, planned, spent }) => {
  const maxValue: number = Math.max(planned, spent)

  const spentPercent: number = spent * 100 / maxValue

  const plannedPercent: number = planned * 100 / maxValue

  const currencySign = useStore((state) => state.currencySign)

  return (
    <div className={cn(
      "h-[80px] rounded-md cursor-pointer",
      isActive ? "w-[92%] border-slate-300 bg-slate-400 text-slate-50" : "hover:drop-shadow-lg drop-shadow bg-white w-[90%]"
    )}>
      <div className="flex flex-col h-full justify-center p-2">
        <div className="flex w-full h-1/2">
          <div className="flex flex-1 gap-2 justify-end items-end">
            <span className="self-right text-xl">{formatMoney(planned)} {currencySign}</span>
            <div
              className={cn(
                "flex w-3",
                isActive ? "bg-white" : "bg-gray-400"
              )}
              style={{ height: `${plannedPercent}%` }}></div>
          </div>
          <div className="flex flex-1 gap-2 items-end">
            {spentPercent > plannedPercent
              ? (
                <div className="flex w-3 bg-red-500" style={{ height: `${spentPercent}%` }}></div>
              )
              : (
                <div className="flex w-3 bg-green-500" style={{ height: `${spentPercent}%` }}></div>
              )}
            <span className="text-xl font-bold">{formatMoney(spent)} {currencySign}</span>
          </div>
        </div>
        <div className="flex flex-1 items-top h-1/2 justify-center">
          <span className="text-lg">{title}</span>
        </div>
      </div>
    </div>
  )
}

export default CategorySummaryButton
