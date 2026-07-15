import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid';
import { addDays, format, subDays } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Types extends GridRenderEditCellParams {}

const DateComponent: React.FC<Types> = (params) => {
  const { id, field, value } = params;
  const apiRef = useGridApiContext();

  const handleChange = (newValue: any) => {
    apiRef.current.setEditCellValue({ id, field, value: newValue });
  };

  React.useEffect(() => {
    apiRef.current.setEditCellValue({ id, field, value: value || new Date() });
  }, []);

  return (
    <div className="flex h-full w-full select-none items-center bg-slate-100">
      <ChevronLeft className="w-7 cursor-pointer" onClick={() => handleChange(subDays(value, 1))} />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex h-full w-full justify-start rounded-lg border border-2 bg-white text-left text-xs font-normal"
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            {value ? format(value, 'MMM dd') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="h-full w-full p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date: Date | undefined) => !(date == null) && handleChange(date)}
            weekStartsOn={1}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <ChevronRight className="w-7 cursor-pointer" onClick={() => handleChange(addDays(value, 1))} />
    </div>
  );
};

export default DateComponent;
