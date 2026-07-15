import { format } from 'date-fns';
import React from 'react';

import DateComponent from '@/components/transactions/forms/components/DateComponentV2';
import { Badge } from '@/components/ui/badge';

import { RowData } from '..';

interface DateCellProps {
  isEditing: boolean;
  value: Date;
  cellStyle: string;
  // Edit mode props
  handleChange?: (id: number, field: keyof RowData, value: any) => void;
  row?: RowData;
  isInvalid?: boolean;
  user?: string | null;
}

export const DateCell: React.FC<DateCellProps> = ({
  isEditing,
  value,
  cellStyle,
  handleChange,
  row,
  isInvalid,
  user,
}) => {
  if (isEditing && row && handleChange) {
    console.log(value);
    return <DateComponent user={user} value={value} handleChange={handleChange} row={row} isInvalid={isInvalid} />;
  }

  return (
    <div className="flex items-center justify-center px-1">
      <Badge variant="outline" className={`text-xs font-medium ${cellStyle}`}>
        {format(value, 'dd MMM yyyy')}
      </Badge>
    </div>
  );
};
