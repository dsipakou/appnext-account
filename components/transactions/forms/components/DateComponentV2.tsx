import React from 'react';
import { ArrowBigLeft, ArrowBigRight, CalendarIcon } from 'lucide-react';
import { addDays, format, subDays, isSameWeek } from 'date-fns';
// UI
import * as Ppv from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
// Types
import { RowData } from '@/components/transactions/components/transactionTable';
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
    handleChange(row.id, 'date', value);
    if (!isSameWeek(value, row.date)) {
      handleChange(row.id, 'budget', null);
    }
    setOpenCalendar(null);
  };

  return (
    <div className="w-full flex items-center justify-center">
      <Button size="sm" variant="ghost" onClick={() => onChange(subDays(value as Date, 1))}>
        <ArrowBigLeft className="h-4 w-4" />
      </Button>
      <Ppv.Popover open={openCalendar === row.id} onOpenChange={(open) => setOpenCalendar(open ? row.id : null)}>
        <Ppv.PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full h-8 px-2 text-sm border-0 bg-white justify-start text-left font-normal mx-1',
              'focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-blue-700 focus:ring-0 focus:outline-none focus:border-primary',
              isInvalid && 'outline outline-red-400'
            )}
          >
            <CalendarIcon className="mr-2 h-5 w-5" />
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
