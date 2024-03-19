import { FC } from 'react'
import { useStore } from '@/app/store'
import { formatMoney } from '@/utils/numberUtils'

interface Types {
  title: string
  planned: number
  spent: number
}

const GeneralSummaryCard: FC<Types> = ({ title, planned, spent }) => {
  const currencySign = useStore((state) => state.currencySign)

  const maxValue: number = Math.max(planned, spent)
  const spentPercent = spent * 100 / maxValue
  const plannedPercent = planned * 100 / maxValue

  return (
    <div className="flex flex-col border bg-slate-600 items-center justify-center text-white h-[80px]">
      <div className="flex justify-center w-full">
        <span className="text-yellow-300">
          {title.charAt(0).toUpperCase() + title.slice(1)} Summary
        </span>
      </div>
      <div className="flex w-full">
        <div className="flex flex-1">
          <div className="flex flex-1 justify-end">
            <div className="flex flex-col h-full">
              <div className="flex justify-end text-xl">
                {formatMoney(planned)} {currencySign}
              </div>
              <div className="flex justify-end text-xs items-end">
                Planned
              </div>
            </div>
          </div>
          <div className="flex items-start ml-2">
            <div className="rounded bg-yellow-400 w-5" style={{ height: `${plannedPercent}%` }}></div>
          </div>
        </div>
        <div className="w-[1px] bg-gray-500 mx-1"></div>
        <div className="flex flex-1">
          <div className="flex items-end mr-2 h-full">
            <div className="rounded bg-yellow-400 w-5" style={{ height: `${spentPercent}%` }}></div>
          </div>
          <div className="flex flex-1 justify-start">
            <div className="flex flex-col h-full">
              <div className="flex justify-start text-xl">
                {formatMoney(spent)} {currencySign}
              </div>
              <div className="flex justify-start text-xs">
                Actual
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GeneralSummaryCard
