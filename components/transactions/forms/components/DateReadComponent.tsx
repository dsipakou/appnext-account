import { GridRenderCellParams } from '@mui/x-data-grid';
import { Calendar } from 'lucide-react';
import React from 'react';

import { DAY_MONTH_YEAR_FORMAT, getFormattedDate } from '@/utils/dateUtils';

interface Types extends GridRenderCellParams {}

const DateReadComponent: React.FC<Types> = (params) => {
  const formattedDate = params.value ? getFormattedDate(params.value, DAY_MONTH_YEAR_FORMAT) : 'No date selected';

  return (
    <div className="flex w-full items-center gap-2 pl-2">
      <Calendar className="h-5" />
      <span className="text-sm">{formattedDate}</span>
    </div>
  );
};

export default DateReadComponent;
