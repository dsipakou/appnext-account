import React from 'react'
import { ArrowBigUpDash, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

// assets
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

import { getRelativeDate } from '@/utils/dateUtils'

import { Currency, Rate } from './types'

interface Types {
  currency: Currency
  rates: Rate[]
  selectCurrency: (code: string) => void
  unselectCurrency: (code: string) => void
  handleDeleteClick: (uuid: string) => void
  handleEditClick: (uuid: string) => void
}

const CurrencyCard: React.FC<Types> = ({
  currency,
  rates,
  selectCurrency,
  unselectCurrency,
  handleDeleteClick,
  handleEditClick
}) => {
  const [selected, setSelected] = React.useState<boolean>(false)

  const getRate = (uuid: string, seqNumber: number = 0): Rate | undefined => {
    if (!rates) {
      return
    }

    const currencyRates: Rate[] = rates.filter(
      (rate: Rate) => rate.currency === uuid
    )
    if (currencyRates.length < 2) {
      return currencyRates[0]
    }

    return currencyRates[seqNumber]
  }

  const getPercentage = (uuid: string): number => {
    if (!rates) {
      return 0
    }

    const _rates: Rate[] = rates.filter((rate: Rate) => rate.currency === uuid)
    if (_rates.length < 2) {
      return 0
    }

    return (1 - (_rates[1].rate / _rates[0].rate)) * 100
  }

  const getDate = (currencyUuid: string | undefined): string => {
    const date = getRate(currencyUuid)?.rateDate
    if (date === undefined) return ''

    return getRelativeDate(date)
  }

  const getDelta: number = () => {
    const today = getRate(currency.uuid)
    const yesterday = getRate(currency.uuid, 1)

    if ((today != null) && (yesterday != null)) {
      return (today.rate - yesterday.rate).toFixed(4)
    }
    return 0
  }

  const handleDelete = (e: MouseEvent): void => {
    e.stopPropagation()
    handleDeleteClick(currency.uuid)
  }

  const handleEdit = (e: MouseEvent): void => {
    e.stopPropagation()
    handleEditClick(currency.uuid)
  }

  const handleClick = (): void => {
    setSelected(!selected)

    if (selected) {
      unselectCurrency(currency.code)
    } else {
      selectCurrency(currency.code)
    }
  }

  return (
    <>
      <div
        onClick={handleClick}
        className={`flex flex-col cursor-pointer w-[270px] h-[180px] rounded-lg ${!selected ? 'drop-shadow-lg bg-white' : 'bg-blue-500 text-white'} px-3 py-2 justify-between`}
      >
        <div className="flex justify-between">
          <span className="text-2xl p-2 font-semibold">{currency.code}</span>
          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer z-10 rounded-full focus-visible:outline-none">
              <MoreVertical className="z-1 h-8 w-8 border-2 bg-white text-black rounded-full" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="h-4 w-4 mr-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-4" />
                <span>Delete</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete}>
                <ArrowBigUpDash className="h-4 w-4 mr-4" />
                <span>Make it base (TODO)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[34px]">{getRate(currency.uuid)?.rate.toFixed(4)}</span>
        </div>
        <div className="flex items-center gap-2 pl-2">
          <span className="flex text-lg items-end">{getPercentage(currency.uuid) > 0 && '+'}{getPercentage(currency.uuid)?.toFixed(2)}%</span>
          <span className="text-sm">
            {getPercentage(currency.uuid) > 0 && '+'}{getDelta()}
          </span>
          {getPercentage(currency.uuid) < 0 && <ArrowDownRight className="text-red-500" />}
          {getPercentage(currency.uuid) > 0 && <ArrowUpRight className="text-green-500" />}
        </div>
        <div className="flex justify-between items-center">
          {currency.isDefault && <Badge>Default</Badge>}
          <span className="flex text-xs justify-end w-full">{getDate(currency.uuid)}</span>
        </div>
      </div>
    </>
  )
}

export default CurrencyCard
