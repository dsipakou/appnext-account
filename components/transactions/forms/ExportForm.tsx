import React from 'react';
import { Download } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { downloadFile } from '@/plugins/axios';
import { getFormattedDate } from '@/utils/dateUtils';

const ExportForm: React.FC = () => {
  const [exportRange, setExportRange] = React.useState<DateRange | undefined>(undefined);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const handleConfirm = (): void => {
    if (exportRange?.from && exportRange?.to) {
      const from = getFormattedDate(exportRange.from);
      const to = getFormattedDate(exportRange.to);
      setIsOpen(false);
      downloadFile(
        `transactions/date-range/?dateFrom=${from}&dateTo=${to}`,
        `transactions_${from}_${to}.xlsx`
      );
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => { if (!open) setExportRange(undefined); setIsOpen(open); }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="text-blue-500 hover:text-blue-600">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="range"
          selected={exportRange}
          onSelect={setExportRange}
          weekStartsOn={1}
          initialFocus
        />
        <div className="flex justify-end p-3 border-t">
          <Button
            size="sm"
            disabled={!exportRange?.from || !exportRange?.to}
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ExportForm;
