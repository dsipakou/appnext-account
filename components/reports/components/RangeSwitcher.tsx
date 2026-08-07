import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { parseAndFormatDate, REPORT_FORMAT } from '@/utils/dateUtils';

interface Types {
  dateFrom: string;
  dateTo: string;
  clickBack: () => void;
  clickForward: () => void;
}

const RangeSwitcher: React.FC<Types> = ({ dateFrom, dateTo, clickBack, clickForward }) => {
  const formattedDateFrom = parseAndFormatDate(dateFrom, REPORT_FORMAT);
  const formattedDateTo = parseAndFormatDate(dateTo, REPORT_FORMAT);

  return (
    <div className="flex w-100 items-center justify-between gap-2 rounded-xl border bg-white px-2 py-1 shadow-sm">
      <Button variant="ghost" size="icon" onClick={clickBack} className="h-8 w-8 rounded-lg">
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2 px-2">
        {formattedDateFrom}
        <span className="text-muted-foreground">→</span>
        {formattedDateTo}
      </div>

      <Button variant="ghost" size="icon" onClick={clickForward} className="h-8 w-8 rounded-lg">
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default RangeSwitcher;
