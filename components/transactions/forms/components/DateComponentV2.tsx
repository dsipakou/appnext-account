import { addDays, format, isSameWeek, subDays } from 'date-fns';
import { ArrowBigLeft, ArrowBigRight } from 'lucide-react';
import React from 'react';

// Types
import { RowData } from '@/components/transactions/components/transactionTable';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
// UI
import * as Ppv from '@/components/ui/popover';
// Utils
import { cn } from '@/lib/utils';

type Props = {
  user: string;
  value: string;
  handleChange: (id: number, key: string, value: Date | null) => void;
  row: RowData;
  isInvalid: boolean;
};

export default function DateComponent({ user, value, handleChange, row, isInvalid }: Props) {
  const [openCalendar, setOpenCalendar] = React.useState<number | null>(null);

  const onChange = (value: Date) => {
    console.log(value);
    handleChange(row.id, 'date', value);
    if (!isSameWeek(value, row.date)) {
      handleChange(row.id, 'budget', null);
    }
    setOpenCalendar(null);
  };

  return (
    <div className="flex w-full items-center justify-center">
      <Button size="sm" variant="ghost" onClick={() => onChange(subDays(value as Date, 1))}>
        <ArrowBigLeft className="h-4 w-4" />
      </Button>
      <Ppv.Popover open={openCalendar === row.id} onOpenChange={(open) => setOpenCalendar(open ? row.id : null)}>
        <Ppv.PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'mx-1 h-8 w-full justify-start border-0 bg-white px-2 text-left text-sm font-normal',
              'focus:border-primary focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-blue-700',
              isInvalid && 'outline outline-red-400',
            )}
          >
            {format(value as Date, 'dd MMM')}
          </Button>
        </Ppv.PopoverTrigger>
        <Ppv.PopoverContent className="p-0">
          <Calendar
            mode="single"
            selected={value as Date}
            onSelect={(date) => {
              if (date) {
                onChange(date);
              }
            }}
            weekStartsOn={1}
            initialFocus
          />
        </Ppv.PopoverContent>
      </Ppv.Popover>
      <Button size="sm" variant="ghost" onClick={() => onChange(addDays(value as Date, 1))}>
        <ArrowBigRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
