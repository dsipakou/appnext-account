import { FC } from 'react'
import { useSession } from 'next-auth/react'
import { CheckCircle, Repeat2 } from 'lucide-react'
import { getDate, getDay, format } from 'date-fns'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from '@/components/ui/badge'
import { MonthGroupedBudgetItem } from '@/components/budget/types'
import { formatMoney } from '@/utils/numberUtils'
import { useCurrencies } from '@/hooks/currencies'
import { Currency } from '@/components/currencies/types'
import { MonthBudgetItem } from '@/components/budget/types'
import { parseDate } from '@/utils/dateUtils'

interface Types {
  item: MonthGroupedBudgetItem
}

const GroupedBudgetButton: FC<Types> = ({ item }) => {
  const { data: { user }} = useSession()

  const { data: currencies } = useCurrencies()

  const repeatedFor: number = item.items.length

  const planned: number = item.plannedInCurrencies[user?.currency]
  const spent: number = item.spentInCurrencies[user?.currency] || 0
  const percentage: number = Math.floor(spent * 100 / planned)
  const isCompleted: boolean = item.items.every((_item: MonthBudgetItem) => _item.isCompleted)

  const currencySign = currencies.find((item: Currency) => item.code === user.currency)?.sign || ''

  const progressColor: string = planned === 0 ?
    "secondary" :
    Math.floor(percentage) > 100 ?
      "error" :
      "primary"

  const getRepeatDay = (item: MonthBudgetItem) => {
    if (item.recurrent === 'monthly') {
      return `Repeat monthly on day ${getDate(parseDate(item.budgetDate))}`
    } else if (item.recurrent === 'weekly') {
      return `Repeat weekly on ${format(parseDate(item.budgetDate), 'EEEE')}`
    }
    return ''
  }

  const recurrent = item.items[0].recurrent

  const cssClass = !!recurrent ?
    recurrent === 'monthly'
      ? 'p-2 border-l-8 border-blue-400'
      : 'border-l-8 border-yellow-400'
    : 'border-gray-300'

  return (
    <div className={`${cssClass} h-[172px] border cursor-pointer p-2 rounded-lg ${isCompleted ? 'bg-slate-200 text-slate-500' : 'drop-shadow outline-zinc-200 bg-slate-50'}`}>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between w-full">
          <div className="relative">
            <span className="text-lg">{item.title}</span>
            {repeatedFor > 1 && <span className="absolute px-1 text-xs rounded-full bg-sky-500 text-white">{`x${repeatedFor}`}</span>}
          </div>
          {isCompleted && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <CheckCircle className="text-green-600 hover:h-6"/>
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
          <span className="text-xl font-bold">{formatMoney(spent)} {currencySign}</span>
          {planned !== 0 && (
            <>
              <span className="mx-2 text-sm">of</span>
              <span className="text-sm">{formatMoney(planned)} {currencySign}</span>
            </>
          )}
        </div>
        <div className="relative">
          <Progress
            className={`h-8 rounded-sm ${percentage > 100 ? 'bg-red-200' : 'bg-gray-300'}`}
            indicatorclassname={`${percentage > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
            color={progressColor}
            value={percentage > 100 ? percentage % 100 : percentage}
            sx={{
              height: 35,
              mx: 2,
              my: 1,
            }}
          />
          <div className="absolute top-0 w-full h-full">
            <span className="flex text-white text-lg font-semibold h-full items-center justify-center">
              {planned === 0 ? 'Not planned' : `${percentage}%`}
            </span>
          </div>
        </div>
        <div className="flex w-full">
          <div className="flex-1 justify-end">
            {item.items[0].recurrent &&
              <Badge variant="outline" className={`bg-white ${isCompleted && 'text-slate-500'}`}>
                <Repeat2 className="mr-1 h-4"/>
                {getRepeatDay(item.items[0])}
              </Badge>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default GroupedBudgetButton;
