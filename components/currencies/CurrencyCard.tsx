// System
import { ArrowDownRight, ArrowUpRight, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import React from 'react';

// UI
import { Badge } from '@/components/ui/badge';
import * as Ddm from '@/components/ui/dropdown-menu';
// Utils
import { getRelativeDate } from '@/utils/dateUtils';

// Types
import { Currency, Rate } from './types';

interface Types {
  currency: Currency;
  rates: Rate[];
  selectCurrency: (code: string) => void;
  unselectCurrency: (code: string) => void;
  handleDeleteClick: (uuid: string) => void;
  handleEditClick: (uuid: string) => void;
}

const CurrencyCard: React.FC<Types> = ({
  currency,
  rates,
  selectCurrency,
  unselectCurrency,
  handleDeleteClick,
  handleEditClick,
}) => {
  const [selected, setSelected] = React.useState<boolean>(false);

  const getRate = (uuid: string, seqNumber: number = 0): Rate | undefined => {
    if (!rates) {
      return;
    }

    const currencyRates: Rate[] = rates.filter((rate: Rate) => rate.currency === uuid);
    if (currencyRates.length < 2) {
      return currencyRates[0];
    }

    return currencyRates[seqNumber];
  };

  const getPercentage = (uuid: string): number => {
    if (!rates) {
      return 0;
    }

    const _rates: Rate[] = rates.filter((rate: Rate) => rate.currency === uuid);
    if (_rates.length < 2) {
      return 0;
    }

    return (1 - _rates[1].rate / _rates[0].rate) * 100;
  };

  const getDate = (currencyUuid: string | undefined): string => {
    const date = getRate(currencyUuid)?.rateDate;
    if (date === undefined) return '';

    return getRelativeDate(date);
  };

  const getDelta: number = () => {
    const today = getRate(currency.uuid);
    const yesterday = getRate(currency.uuid, 1);

    if (today != null && yesterday != null) {
      return (today.rate - yesterday.rate).toFixed(4);
    }
    return 0;
  };

  const handleDelete = (e: MouseEvent): void => {
    e.stopPropagation();
    handleDeleteClick(currency.uuid);
  };

  const handleEdit = (e: MouseEvent): void => {
    e.stopPropagation();
    handleEditClick(currency.uuid);
  };

  const handleClick = (): void => {
    setSelected(!selected);

    if (selected) {
      unselectCurrency(currency.code);
    } else {
      selectCurrency(currency.code);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`flex h-[180px] w-[270px] cursor-pointer flex-col rounded-lg ${!selected ? 'bg-white drop-shadow-lg' : 'bg-blue-500 text-white'} justify-between px-3 py-2`}
      >
        <div className="flex justify-between">
          <span className="p-2 text-2xl font-semibold">{currency.code}</span>
          <Ddm.DropdownMenu>
            <Ddm.DropdownMenuTrigger className="z-10 cursor-pointer rounded-full focus-visible:outline-none">
              <MoreVertical className="z-1 h-8 w-8 rounded-full border-2 bg-white text-black" />
            </Ddm.DropdownMenuTrigger>
            <Ddm.DropdownMenuContent>
              <Ddm.DropdownMenuLabel>Actions</Ddm.DropdownMenuLabel>
              <Ddm.DropdownMenuSeparator />
              <Ddm.DropdownMenuItem onClick={handleEdit}>
                <Pencil className="mr-4 h-4 w-4" />
                <span>Edit</span>
              </Ddm.DropdownMenuItem>
              <Ddm.DropdownMenuItem onClick={handleDelete}>
                <Trash2 className="mr-4 h-4 w-4" />
                <span>Delete</span>
              </Ddm.DropdownMenuItem>
              <Ddm.DropdownMenuSeparator />
            </Ddm.DropdownMenuContent>
          </Ddm.DropdownMenu>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[34px]">{getRate(currency.uuid)?.rate.toFixed(4)}</span>
        </div>
        <div className="flex items-center gap-2 pl-2">
          <span className="flex items-end text-lg">
            {getPercentage(currency.uuid) > 0 && '+'}
            {getPercentage(currency.uuid)?.toFixed(2)}%
          </span>
          <span className="text-sm">
            {getPercentage(currency.uuid) > 0 && '+'}
            {getDelta()}
          </span>
          {getPercentage(currency.uuid) < 0 && <ArrowDownRight className="text-red-500" />}
          {getPercentage(currency.uuid) > 0 && <ArrowUpRight className="text-green-500" />}
        </div>
        <div className="flex items-center justify-between">
          {currency.isDefault && <Badge>Default</Badge>}
          <span className="flex w-full justify-end text-xs">{getDate(currency.uuid)}</span>
        </div>
      </div>
    </>
  );
};

export default CurrencyCard;
